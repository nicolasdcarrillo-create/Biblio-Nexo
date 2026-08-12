-- ADVERTENCIA: Este archivo es histórico y puede contener definiciones de funciones que han sido consolidadas.
-- NO ejecutar este archivo directamente en staging o producción para corregir funciones críticas.
-- Las definiciones autoritativas están en supabase/migrations/010_consolidacion.sql y se reaplican con 011_reaplicar_consolidacion.sql.
-- Si se necesita corregir funciones en la base de datos, usar 011_reaplicar_consolidacion.sql (idempotente) tras respaldar la BD.
-- ============================================================================
-- BiblioNexo — Funciones RPC atómicas para préstamos y devoluciones
-- ============================================================================
-- Objetivo (PRD P0): eliminar la condición de carrera en el stock.
-- Hoy el cliente hace: leer stock -> validar -> restar en el cliente -> guardar.
-- Si dos préstamos del último ejemplar llegan casi al mismo tiempo, ambos
-- pueden leer stock=1 antes de que el otro escriba, y el stock queda en -1.
--
-- La solución: mover el chequeo + descuento a una única transacción en
-- Postgres, bloqueando la fila del libro (SELECT ... FOR UPDATE) mientras
-- dura la operación. Cualquier llamada concurrente para el MISMO libro debe
-- esperar a que la primera transacción termine, así que la segunda ve el
-- stock ya actualizado y nunca puede dejarlo negativo.
--
-- Se ejecutan como SECURITY INVOKER (por defecto, no se declara
-- SECURITY DEFINER): respetan las políticas RLS existentes de tu proyecto en
-- vez de saltárselas, para no debilitar la seguridad que ya configuraste.
-- Ajusta los tipos de columna (bigint) si tus IDs son uuid.
-- ============================================================================

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
  v_prestamo_id bigint;
  v_fecha date := (current_date + interval '7 days')::date;
begin
  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  if v_lector_id is null then
    raise exception 'RUT no encontrado.' using errcode = 'P0001';
  end if;

  -- Bloquea la fila del libro hasta el final de la transacción.
  -- Una segunda llamada concurrente para el mismo libro espera aquí,
  -- en vez de leer un stock desactualizado.
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

-- ----------------------------------------------------------------------------

create or replace function public.devolver_prestamo(
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
  -- No confiamos en el libro_id/stock que mande el cliente: los recalculamos
  -- a partir del préstamo real, y bloqueamos esa fila también.
  select libro_id, estado into v_libro_id, v_estado
  from public.prestamos where id = p_prestamo_id for update;

  if v_libro_id is null then
    raise exception 'Préstamo no encontrado.' using errcode = 'P0001';
  end if;
  if v_estado = 'devuelto' then
    raise exception 'Este préstamo ya fue devuelto anteriormente.' using errcode = 'P0001';
  end if;

  update public.prestamos
    set estado = 'devuelto', fecha_devolucion_real = current_date
    where id = p_prestamo_id;

  update public.libros set stock = stock + 1 where id = v_libro_id;
end;
$$;

grant execute on function public.devolver_prestamo(bigint) to authenticated;
