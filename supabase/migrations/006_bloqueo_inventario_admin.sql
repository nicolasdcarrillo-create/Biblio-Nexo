-- ADVERTENCIA: Este archivo es histórico y puede contener definiciones de funciones que han sido consolidadas.
-- NO ejecutar este archivo directamente en staging o producción para corregir funciones críticas.
-- Las definiciones autoritativas están en supabase/migrations/010_consolidacion.sql y se reaplican con 011_reaplicar_consolidacion.sql.
-- Si se necesita corregir funciones en la base de datos, usar 011_reaplicar_consolidacion.sql (idempotente) tras respaldar la BD.
-- ============================================================================
-- BiblioNexo — 006: Correcciones críticas y sistema de bloqueo
-- ============================================================================
-- Ejecutar DESPUÉS de 001 a 005.
--
-- Contenido:
--   1. Corrige el trigger de auditoría, que podía bloquear TODAS las escrituras.
--   2. Separa "copias totales" de "copias disponibles", que hasta ahora eran
--      la misma columna y se corrompían al editar un libro.
--   3. Sistema de bloqueo de lectores (automático por atraso y manual).
--   4. Consultas de estado para el mesón: qué pasa con un libro y con un lector.
--   5. Detección de inconsistencias de inventario.
-- ============================================================================


-- ============================================================================
-- 1) CORRECCIÓN CRÍTICA: el trigger de auditoría ya no puede tumbar la app
-- ============================================================================
-- El problema: al ser un trigger AFTER ... FOR EACH ROW, si su inserción
-- fallaba (por ejemplo, por una política RLS que no permite INSERT), la
-- transacción completa se revertía. Es decir: agregar, editar o eliminar
-- cualquier libro, lector o préstamo dejaba de funcionar por completo.
--
-- La corrección: registrar la auditoría dentro de un bloque de excepción.
-- El principio es que la bitácora nunca debe impedir la operación real;
-- si no se puede registrar, se deja una advertencia y la operación continúa.

-- ARCHIVADO: create or replace function public.registrar_auditoria()
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

-- Además se agrega la política de inserción que faltaba, para que el camino
-- normal funcione y no dependa solo de que la función sea SECURITY DEFINER.
drop policy if exists "auditoria insercion por trigger" on public.auditoria;
create policy "auditoria insercion por trigger" on public.auditoria
  for insert with check (true);


-- ============================================================================
-- 2) CORRECCIÓN CRÍTICA: copias totales vs copias disponibles
-- ============================================================================
-- Hasta ahora `stock` significaba "copias disponibles" (se descontaba al
-- prestar), pero los formularios lo mostraban como "cantidad de ejemplares".
-- Editar un libro con copias prestadas corrompía el inventario en silencio.
--
-- Desde ahora:
--   copias_totales = cuántos ejemplares tiene la biblioteca (lo que se edita)
--   stock          = cuántos están disponibles ahora (lo calcula el sistema)

alter table public.libros add column if not exists copias_totales int;

-- Reconstrucción del valor real: disponibles + las que están prestadas
update public.libros l
set copias_totales = coalesce(l.stock, 0) + coalesce((
      select count(*) from public.prestamos p
      where p.libro_id = l.id and p.estado = 'activo'
    ), 0)
where l.copias_totales is null;

alter table public.libros alter column copias_totales set default 1;
update public.libros set copias_totales = 1 where copias_totales is null or copias_totales < 0;
alter table public.libros alter column copias_totales set not null;

/**
 * Ajusta el total de ejemplares de un libro y recalcula las disponibles.
 * Se usa al editar: recibe cuántos ejemplares hay en total y deduce cuántos
 * están libres, en vez de dejar que el usuario escriba un número incoherente.
 */
-- ARCHIVADO: create or replace function public.ajustar_copias(
  p_libro_id bigint,
  p_copias_totales int
)
returns table (copias_totales int, stock int)
language plpgsql
set search_path = public
as $$
declare
  v_prestadas int;
begin
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


-- ============================================================================
-- 3) SISTEMA DE BLOQUEO DE LECTORES
-- ============================================================================
-- Un lector queda impedido de pedir libros en dos casos:
--   a) Bloqueo automático: tiene al menos un préstamo atrasado. Se levanta
--      solo, en cuanto devuelve. Es lo que se le advierte en el aviso.
--   b) Bloqueo manual: sanción administrativa, con motivo escrito.

alter table public.lectores add column if not exists bloqueado_manual boolean not null default false;
alter table public.lectores add column if not exists motivo_bloqueo text;
alter table public.lectores add column if not exists bloqueado_en timestamptz;

/**
 * Estado completo de un lector, para mostrarlo en el mesón antes de prestar.
 * Si el RUT no existe, devuelve una fila con existe = false, de modo que la
 * interfaz pueda ofrecer registrarlo como lector nuevo.
 */
-- ARCHIVADO: create or replace function public.estado_lector(p_rut text)
returns table (
  existe boolean,
  lector_id bigint,
  nombre text,
  rut text,
  email text,
  telefono text,
  bloqueado_manual boolean,
  motivo_bloqueo text,
  prestamos_activos int,
  prestamos_atrasados int,
  puede_prestar boolean,
  motivo_rechazo text
)
language plpgsql
stable
set search_path = public
as $$
declare
  v_lector public.lectores;
  v_activos int := 0;
  v_atrasados int := 0;
  v_limite constant int := 3;   -- igual que en prestar_libro y CONFIG
  v_puede boolean := true;
  v_motivo text := null;
begin
  select * into v_lector from public.lectores where lectores.rut = p_rut;

  if v_lector.id is null then
    return query select false, null::bigint, null::text, p_rut, null::text, null::text,
                        false, null::text, 0, 0, false, 'Este RUT no está registrado.'::text;
    return;
  end if;

  select count(*) filter (where estado = 'activo'),
         count(*) filter (where estado = 'activo' and fecha_devolucion_esperada < public.hoy_chile())
    into v_activos, v_atrasados
  from public.prestamos
  where lector_id = v_lector.id;

  if v_lector.bloqueado_manual then
    v_puede := false;
    v_motivo := coalesce('Bloqueado por la biblioteca: ' || v_lector.motivo_bloqueo, 'Bloqueado por la biblioteca.');
  elsif v_atrasados > 0 then
    v_puede := false;
    v_motivo := 'Tiene ' || v_atrasados || ' libro(s) con la devolución atrasada.';
  elsif v_activos >= v_limite then
    v_puede := false;
    v_motivo := 'Ya tiene ' || v_activos || ' préstamos activos, el máximo permitido.';
  end if;

  return query select true, v_lector.id, v_lector.nombre, v_lector.rut, v_lector.email, v_lector.telefono,
                      v_lector.bloqueado_manual, v_lector.motivo_bloqueo,
                      v_activos, v_atrasados, v_puede, v_motivo;
end;
$$;

grant execute on function public.estado_lector(text) to authenticated;

/**
 * Bloquea o desbloquea a un lector manualmente. Solo administradores.
 */
create or replace function public.bloquear_lector(
  p_lector_id bigint,
  p_bloquear boolean,
  p_motivo text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede bloquear o desbloquear lectores.' using errcode = 'P0001';
  end if;

  update public.lectores
     set bloqueado_manual = p_bloquear,
         motivo_bloqueo   = case when p_bloquear then p_motivo else null end,
         bloqueado_en     = case when p_bloquear then now() else null end
   where id = p_lector_id;
end;
$$;

grant execute on function public.bloquear_lector(bigint, boolean, text) to authenticated;


-- ============================================================================
-- 4) CONSULTA DE LIBRO PARA EL MESÓN
-- ============================================================================
/**
 * Todo lo que hay que saber al escanear un código: el libro, si está prestado,
 * a quién, con qué RUT, desde cuándo, y en qué situación está esa persona.
 * Devuelve una fila por préstamo activo (o una sola fila si no hay ninguno).
 */
create or replace function public.consultar_libro(p_codigo text)
returns table (
  libro_id bigint,
  isbn text,
  titulo text,
  autor text,
  genero text,
  ubicacion text,
  portada_url text,
  copias_totales int,
  stock int,
  prestamo_id bigint,
  fecha_prestamo date,
  fecha_devolucion_esperada date,
  dias_restantes int,
  renovaciones int,
  lector_id bigint,
  lector_nombre text,
  lector_rut text,
  lector_email text,
  lector_telefono text,
  lector_bloqueado boolean,
  lector_atrasados int
)
language sql
stable
set search_path = public
as $$
  with libro as (
    select * from public.libros
    where isbn = p_codigo or isbn = replace(p_codigo, '-', '')
    limit 1
  )
  select
    l.id, l.isbn, l.titulo, l.autor, l.genero, l.ubicacion, l.portada_url,
    l.copias_totales, l.stock,
    p.id, p.fecha_prestamo, p.fecha_devolucion_esperada,
    (p.fecha_devolucion_esperada - public.hoy_chile())::int,
    p.renovaciones,
    lec.id, lec.nombre, lec.rut, lec.email, lec.telefono,
    lec.bloqueado_manual,
    coalesce((
      select count(*)::int from public.prestamos p2
      where p2.lector_id = lec.id and p2.estado = 'activo'
        and p2.fecha_devolucion_esperada < public.hoy_chile()
    ), 0)
  from libro l
  left join public.prestamos p on p.libro_id = l.id and p.estado = 'activo'
  left join public.lectores lec on lec.id = p.lector_id
  order by p.fecha_devolucion_esperada nulls last;
$$;

grant execute on function public.consultar_libro(text) to authenticated;


-- ============================================================================
-- 5) PRÉSTAMO CON VERIFICACIÓN DE BLOQUEO
-- ============================================================================
-- Se reemplaza prestar_libro para que respete el bloqueo. Antes solo revisaba
-- el límite de préstamos: un lector con libros atrasados podía seguir pidiendo.

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
  v_hoy date := public.hoy_chile();
  v_fecha date := public.hoy_chile() + 7;
  v_estado record;
begin
  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  if v_lector_id is null then
    raise exception 'RUT no encontrado.' using errcode = 'P0001';
  end if;

  -- Serializa las solicitudes del mismo lector
  perform pg_advisory_xact_lock(v_lector_id);

  -- Bloqueo manual, atrasos y límite se evalúan en un solo lugar
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
  values (p_libro_id, v_lector_id, v_hoy, v_fecha, 'activo')
  returning id into v_prestamo_id;

  return query select v_prestamo_id, v_fecha;
end;
$$;

grant execute on function public.prestar_libro(bigint, text) to authenticated;


-- ============================================================================
-- 6) HERRAMIENTA DE ADMINISTRACIÓN: inconsistencias de inventario
-- ============================================================================
/**
 * Detecta libros cuyo inventario no cuadra: las copias disponibles más las
 * prestadas deberían igualar el total de ejemplares. Cualquier diferencia
 * indica datos corrompidos por ediciones anteriores o escrituras manuales.
 */
create or replace function public.revisar_inventario()
returns table (
  libro_id bigint,
  titulo text,
  isbn text,
  copias_totales int,
  stock int,
  prestados int,
  diferencia int
)
language sql
stable
set search_path = public
as $$
  select l.id, l.titulo, l.isbn, l.copias_totales, l.stock,
         coalesce(p.activos, 0)::int,
         (l.copias_totales - l.stock - coalesce(p.activos, 0))::int
  from public.libros l
  left join (
    select libro_id, count(*) as activos
    from public.prestamos where estado = 'activo'
    group by libro_id
  ) p on p.libro_id = l.id
  where l.copias_totales - l.stock - coalesce(p.activos, 0) <> 0
     or l.stock < 0
  order by abs(l.copias_totales - l.stock - coalesce(p.activos, 0)) desc;
$$;

grant execute on function public.revisar_inventario() to authenticated;

/**
 * Corrige el inventario de un libro recalculando las copias disponibles
 * a partir del total de ejemplares y los préstamos realmente activos.
 */
-- ARCHIVADO: create or replace function public.corregir_inventario(p_libro_id bigint)
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
  from public.prestamos where libro_id = p_libro_id and estado = 'activo';

  -- Si hay más prestados que ejemplares registrados, el total estaba mal
  if v_totales < v_prestadas then
    v_totales := v_prestadas;
  end if;

  update public.libros
     set copias_totales = v_totales,
         stock = v_totales - v_prestadas
   where id = p_libro_id;

  return query select v_totales, v_totales - v_prestadas;
end;
$$;

grant execute on function public.corregir_inventario(bigint) to authenticated;


-- ============================================================================
-- 7) HERRAMIENTA DE ADMINISTRACIÓN: asignar roles
-- ============================================================================
/**
 * Cambia el rol de un miembro del personal. Solo administradores, y no permite
 * quitarse el propio rol de administrador (evita quedarse sin acceso).
 */
create or replace function public.asignar_rol(
  p_usuario_id uuid,
  p_rol text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar roles.' using errcode = 'P0001';
  end if;
  if p_rol not in ('admin', 'librero') then
    raise exception 'Rol no válido. Debe ser admin o librero.' using errcode = 'P0001';
  end if;
  if p_usuario_id = auth.uid() and p_rol <> 'admin' then
    raise exception 'No puedes quitarte tu propio rol de administrador.' using errcode = 'P0001';
  end if;

  insert into public.usuarios (id, email, rol)
  select p_usuario_id, u.email, p_rol from auth.users u where u.id = p_usuario_id
  on conflict (id) do update set rol = p_rol;
end;
$$;

grant execute on function public.asignar_rol(uuid, text) to authenticated;

/**
 * Lista el personal con acceso al sistema, para la vista de administración.
 */
create or replace function public.listar_personal()
returns table (
  usuario_id uuid,
  email text,
  rol text,
  ultimo_acceso timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver el personal.' using errcode = 'P0001';
  end if;

  return query
    select u.id, u.email::text, coalesce(p.rol, 'librero')::text, u.last_sign_in_at
    from auth.users u
    left join public.usuarios p on p.id = u.id
    order by u.email;
end;
$$;

grant execute on function public.listar_personal() to authenticated;
