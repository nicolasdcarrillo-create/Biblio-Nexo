-- ADVERTENCIA: Este archivo es histórico y puede contener definiciones de funciones que han sido consolidadas.
-- NO ejecutar este archivo directamente en staging o producción para corregir funciones críticas.
-- Las definiciones autoritativas están en supabase/migrations/010_consolidacion.sql y se reaplican con 011_reaplicar_consolidacion.sql.
-- Si se necesita corregir funciones en la base de datos, usar 011_reaplicar_consolidacion.sql (idempotente) tras respaldar la BD.
-- ============================================================================
-- BiblioNexo — 004: Reportes, portadas y zona horaria
-- ============================================================================
-- Ejecutar DESPUÉS de 001, 002 y 003.
--
-- Resuelve tres cosas:
--   a) No se guardaba la fecha en que se hacía un préstamo, así que era
--      imposible hacer reportes por día, semana, mes o año.
--   b) Las fechas se calculaban con current_date, que en Postgres es UTC.
--      En Chile (UTC-3/-4) un préstamo registrado a las 21:00 quedaba con la
--      fecha del día siguiente.
--   c) Faltaba dónde guardar la portada del libro.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) COLUMNAS NUEVAS
-- ----------------------------------------------------------------------------

-- Cuándo se hizo el préstamo (base de todos los reportes)
alter table public.prestamos add column if not exists fecha_prestamo date;
alter table public.prestamos add column if not exists fecha_devolucion_real date;

-- Cuándo se registró el lector (para el conteo de "nuevos lectores")
alter table public.lectores add column if not exists created_at timestamptz default now();

-- Portada del libro. Si queda vacía, la aplicación intenta buscarla en
-- Open Library usando el ISBN. Este campo permite cargar manualmente las
-- portadas de obras locales y patrimoniales, que no están en catálogos
-- internacionales (por ejemplo, los títulos de Ramón Quichiyao).
alter table public.libros add column if not exists portada_url text;

-- Rellena la fecha de préstamo de los registros antiguos usando created_at
-- si existe; si no, deja la fecha de devolución esperada menos 7 días.
update public.prestamos
set fecha_prestamo = coalesce(
      fecha_prestamo,
      (fecha_devolucion_esperada - interval '7 days')::date
    )
where fecha_prestamo is null;

-- Índices para que los reportes por rango de fechas sean rápidos
create index if not exists prestamos_fecha_prestamo_idx on public.prestamos (fecha_prestamo);
create index if not exists prestamos_fecha_devolucion_real_idx on public.prestamos (fecha_devolucion_real);
create index if not exists lectores_created_at_idx on public.lectores (created_at);

-- ----------------------------------------------------------------------------
-- 2) FECHA LOCAL DE CHILE
-- ----------------------------------------------------------------------------
-- Devuelve el día actual según el huso horario de Chile continental, en vez
-- del UTC que usa current_date. Se ajusta sola con el horario de verano.

create or replace function public.hoy_chile()
returns date
language sql
stable
as $$
  select (timezone('America/Santiago', now()))::date;
$$;

grant execute on function public.hoy_chile() to authenticated;

-- ----------------------------------------------------------------------------
-- 3) RPC DE PRÉSTAMO — ahora registra la fecha y usa hora local
-- ----------------------------------------------------------------------------

-- ARCHIVADO: create or replace function public.prestar_libro(
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
  v_hoy date := public.hoy_chile();
  v_fecha date := public.hoy_chile() + 7;
  -- Debe coincidir con CONFIG.MAX_PRESTAMOS_POR_LECTOR en js/config.js
  v_limite constant int := 3;
begin
  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  if v_lector_id is null then
    raise exception 'RUT no encontrado.' using errcode = 'P0001';
  end if;

  -- Serializa las solicitudes del mismo lector, para que el límite de
  -- préstamos no pueda saltarse con dos peticiones simultáneas.
  perform pg_advisory_xact_lock(v_lector_id);

  select count(*) into v_prestamos_activos
  from public.prestamos
  where lector_id = v_lector_id and estado = 'activo';

  if v_prestamos_activos >= v_limite then
    raise exception 'Este lector ya tiene % préstamos activos, el máximo permitido.', v_limite using errcode = 'P0001';
  end if;

  -- Bloquea la fila del libro hasta el final de la transacción
  select stock into v_stock from public.libros where id = p_libro_id for update;
  if v_stock is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;
  if v_stock < 1 then
    raise exception 'Stock insuficiente para prestar.' using errcode = 'P0001';
  end if;

  update public.libros set stock = stock - 1 where id = p_libro_id;

  insert into public.prestamos (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, estado)
  values (p_libro_id, v_lector_id, v_hoy, v_fecha, 'activo')
  returning id into v_prestamo_id;

  return query select v_prestamo_id, v_fecha;
end;
$$;

grant execute on function public.prestar_libro(bigint, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 4) RPC DE DEVOLUCIÓN — con hora local
-- ----------------------------------------------------------------------------

-- ARCHIVADO: create or replace function public.devolver_prestamo(
  p_prestamo_id bigint
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_libro_id bigint;
  v_estado text;
begin
  select libro_id, estado into v_libro_id, v_estado
  from public.prestamos where id = p_prestamo_id for update;

  if v_libro_id is null then
    raise exception 'Préstamo no encontrado.' using errcode = 'P0001';
  end if;
  if v_estado = 'devuelto' then
    raise exception 'Este préstamo ya fue devuelto anteriormente.' using errcode = 'P0001';
  end if;

  update public.prestamos
    set estado = 'devuelto', fecha_devolucion_real = public.hoy_chile()
    where id = p_prestamo_id;

  update public.libros set stock = stock + 1 where id = v_libro_id;
end;
$$;

grant execute on function public.devolver_prestamo(bigint) to authenticated;
