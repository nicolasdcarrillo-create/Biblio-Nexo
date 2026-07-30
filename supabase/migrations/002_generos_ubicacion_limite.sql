-- ============================================================================
-- BiblioNexo — 002: Género/Ubicación en catálogo + límite de préstamos
-- ============================================================================
-- Ejecutar DESPUÉS de 001_prestamos_atomicos.sql
-- ============================================================================

-- 1) Columnas nuevas en libros. "if not exists" hace que sea seguro
--    correr esta migración aunque ya existan (no falla, no duplica).
alter table public.libros add column if not exists genero text;
alter table public.libros add column if not exists ubicacion text;

-- 2) Reemplazamos prestar_libro para agregar el límite de préstamos
--    activos por lector. El chequeo queda dentro de la misma transacción
--    con bloqueo de fila, así que sigue siendo imposible saltárselo con
--    solicitudes simultáneas.
create or replace function public.prestar_libro(
  p_libro_id bigint,
  p_lector_rut text
)
returns table (
  prestamo_id bigint,
  fecha_devolucion_esperada date
)
language plpgsql
set search_path = public
as $$
declare
  v_lector_id bigint;
  v_stock int;
  v_prestamos_activos int;
  v_prestamo_id bigint;
  v_fecha date := (current_date + interval '7 days')::date;
  -- Máximo de préstamos activos simultáneos por lector.
  -- Debe coincidir con CONFIG.MAX_PRESTAMOS_POR_LECTOR en js/config.js
  -- (ese valor solo se usa para mostrarlo en pantalla; el que manda es este).
  v_limite constant int := 3;
begin
  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  if v_lector_id is null then
    raise exception 'RUT no encontrado.' using errcode = 'P0001';
  end if;

  -- Cuenta préstamos activos del lector. Como el lector no tiene fila propia
  -- que bloquear con FOR UPDATE de forma natural, el límite se hace seguro
  -- porque toda la función corre dentro de una sola transacción junto al
  -- bloqueo del libro: dos solicitudes del mismo lector en paralelo para
  -- libros distintos podrían, en un caso límite, colarse ambas si llegan al
  -- mismo instante exacto; para blindar también ese caso se usa un advisory
  -- lock por lector.
  perform pg_advisory_xact_lock(v_lector_id);

  select count(*) into v_prestamos_activos
  from public.prestamos
  where lector_id = v_lector_id and estado = 'activo';

  if v_prestamos_activos >= v_limite then
    raise exception 'Este lector ya tiene % préstamos activos, el máximo permitido.', v_limite using errcode = 'P0001';
  end if;

  -- Bloquea la fila del libro hasta el final de la transacción.
  select stock into v_stock from public.libros where id = p_libro_id for update;
  if v_stock is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;
  if v_stock < 1 then
    raise exception 'Stock insuficiente para prestar.' using errcode = 'P0001';
  end if;

  update public.libros set stock = stock - 1 where id = p_libro_id;

  insert into public.prestamos (libro_id, lector_id, fecha_devolucion_esperada, estado)
  values (p_libro_id, v_lector_id, v_fecha, 'activo')
  returning id into v_prestamo_id;

  return query select v_prestamo_id, v_fecha;
end;
$$;

grant execute on function public.prestar_libro(bigint, text) to authenticated;
