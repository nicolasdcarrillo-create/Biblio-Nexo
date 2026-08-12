-- ============================================================================
-- BiblioNexo — 011: Reaplicar definiciones consolidadas (corrección segura)
-- ============================================================================
-- Este script reaplica en la base de datos las definiciones "autoritativas"
-- que están consolidadas en 010_consolidacion.sql. Se usa cuando versiones
-- antiguas de migraciones previas (001..009) dejaron definiciones que
-- sobrescriben funciones críticas sin las guardas ni SECURITY DEFINER
-- apropiadas. Reaplicar estas definiciones garantiza que la base termine
-- con las versiones correctas sin reescribir el histórico de migraciones.
--
-- NOTA: ejecutar este archivo en el entorno de producción solo si se ha
-- verificado en staging. Es idempotente: usa CREATE OR REPLACE FUNCTION.
-- ============================================================================

-- ── prestar_libro (definición consolidada)
create or replace function public.prestar_libro(p_libro_id bigint, p_lector_rut text)
returns table (prestamo_id bigint, fecha_devolucion_esperada date)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lector_id bigint;
  v_stock int;
  v_prestamo_id bigint;
  v_hoy date := public.hoy_chile();
  v_dias int := public.parametro_int('dias_prestamo', 7);
  v_estado record;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para registrar un préstamo.' using errcode = 'P0001';
  end if;

  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  if v_lector_id is null then
    raise exception 'RUT no encontrado.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(v_lector_id);

  select * into v_estado from public.estado_lector(p_lector_rut);
  if not v_estado.puede_prestar then
    raise exception '%', v_estado.motivo_rechazo using errcode = 'P0001';
  end if;

  select stock into v_stock from public.libros where id = p_libro_id for update;
  if v_stock is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;
  if v_stock < 1 then
    raise exception 'No hay ejemplares disponibles de este libro.' using errcode = 'P0001';
  end if;

  update public.libros set stock = stock - 1 where id = p_libro_id;

  insert into public.prestamos (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, estado)
  values (p_libro_id, v_lector_id, v_hoy, v_hoy + v_dias, 'activo')
  returning id into v_prestamo_id;

  return query select v_prestamo_id::bigint, (v_hoy + v_dias)::date;
end;
$$;
grant execute on function public.prestar_libro(bigint, text) to authenticated;

-- ── devolver_prestamo (definición consolidada)
drop function if exists public.devolver_prestamo(bigint);
create or replace function public.devolver_prestamo(p_prestamo_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_libro_id bigint;
  v_estado text;
  v_filas int;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para registrar una devolución.' using errcode = 'P0001';
  end if;

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

  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    raise exception 'No se pudo actualizar el préstamo. Revisa las políticas de acceso.' using errcode = 'P0001';
  end if;

  update public.libros set stock = stock + 1 where id = v_libro_id;
end;
$$;
grant execute on function public.devolver_prestamo(bigint) to authenticated;

-- ── renovar_prestamo (definición consolidada)
drop function if exists public.renovar_prestamo(bigint);
create or replace function public.renovar_prestamo(p_prestamo_id bigint)
returns table (nueva_fecha date, renovaciones_usadas int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado text;
  v_vence date;
  v_renovaciones int;
  v_limite int := public.parametro_int('max_renovaciones', 2);
  v_dias int := public.parametro_int('dias_prestamo', 7);
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para renovar un préstamo.' using errcode = 'P0001';
  end if;

  select estado, fecha_devolucion_esperada, renovaciones
    into v_estado, v_vence, v_renovaciones
  from public.prestamos where id = p_prestamo_id for update;

  if v_estado is null then
    raise exception 'Préstamo no encontrado.' using errcode = 'P0001';
  end if;
  if v_estado <> 'activo' then
    raise exception 'Solo se pueden renovar préstamos activos.' using errcode = 'P0001';
  end if;
  if v_renovaciones >= v_limite then
    raise exception 'Este préstamo ya se renovó % veces, el máximo permitido.', v_limite using errcode = 'P0001';
  end if;
  if v_vence < public.hoy_chile() then
    raise exception 'El préstamo está atrasado. Debe devolverse antes de volver a prestarlo.' using errcode = 'P0001';
  end if;

  update public.prestamos
     set fecha_devolucion_esperada = v_vence + v_dias,
         renovaciones = renovaciones + 1
   where id = p_prestamo_id;

  return query select (v_vence + v_dias)::date, (v_renovaciones + 1)::int;
end;
$$;
grant execute on function public.renovar_prestamo(bigint) to authenticated;

-- ── ajustar_copias (definición consolidada)
create or replace function public.ajustar_copias(p_libro_id bigint, p_copias_totales int)
returns table (copias_totales int, stock int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prestadas int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ajustar los ejemplares.' using errcode = 'P0001';
  end if;
  if p_copias_totales < 0 then
    raise exception 'El número de ejemplares no puede ser negativo.' using errcode = 'P0001';
  end if;

  perform 1 from public.libros where id = p_libro_id for update;

  select count(*) into v_prestadas
  from public.prestamos
  where libro_id = p_libro_id and estado = 'activo';

  if p_copias_totales < v_prestadas then
    raise exception 'No puedes dejar % ejemplares: hay % prestados en este momento.',
      p_copias_totales, v_prestadas using errcode = 'P0001';
  end if;

  update public.libros
     set copias_totales = p_copias_totales,
         stock = p_copias_totales - v_prestadas
   where id = p_libro_id;

  return query select p_copias_totales, p_copias_totales - v_prestadas;
end;
$$;
grant execute on function public.ajustar_copias(bigint, int) to authenticated;

-- ── corregir_inventario (definición consolidada)
create or replace function public.corregir_inventario(p_libro_id bigint)
returns table (copias_totales int, stock int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prestadas int;
  v_totales int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede corregir el inventario.' using errcode = 'P0001';
  end if;

  select l.copias_totales into v_totales from public.libros l where l.id = p_libro_id for update;
  if v_totales is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;

  select count(*) into v_prestadas
  from public.prestamos
  where libro_id = p_libro_id and estado = 'activo';

  update public.libros
     set stock = greatest(0, v_totales - v_prestadas)
   where id = p_libro_id;

  return query select v_totales, greatest(0, v_totales - v_prestadas);
end;
$$;
grant execute on function public.corregir_inventario(bigint) to authenticated;

-- ── registrar_auditoria (definición consolidada)
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_id text;
begin
  begin
    begin
      select email into v_email from auth.users where id = auth.uid();
    exception when others then
      v_email := null;
    end;

    v_id := coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id'));

    insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_antes, datos_despues)
    values (
      tg_table_name, v_id, tg_op, auth.uid(), v_email,
      case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  exception when others then
    -- La auditoría nunca bloquea la operación principal
    raise warning 'No se pudo registrar la auditoría de % en %: %', tg_op, tg_table_name, sqlerrm;
  end;

  return coalesce(new, old);
end;
$$;
grant execute on function public.registrar_auditoria() to authenticated;

-- ============================================================================
-- Fin de 011_reaplicar_consolidacion.sql
-- ============================================================================
