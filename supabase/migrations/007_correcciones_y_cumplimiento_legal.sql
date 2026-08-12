-- ADVERTENCIA: Este archivo es histórico y puede contener definiciones de funciones que han sido consolidadas.
-- NO ejecutar este archivo directamente en staging o producción para corregir funciones críticas.
-- Las definiciones autoritativas están en supabase/migrations/010_consolidacion.sql y se reaplican con 011_reaplicar_consolidacion.sql.
-- Si se necesita corregir funciones en la base de datos, usar 011_reaplicar_consolidacion.sql (idempotente) tras respaldar la BD.
-- ============================================================================
-- BiblioNexo — 007: Correcciones críticas y cumplimiento legal
-- ============================================================================
-- Ejecutar DESPUÉS de 001 a 006. Esta migración es la ÚLTIMA que define las
-- funciones de préstamo: no vuelvas a ejecutar la 002, 004 ni la 006 después
-- de esta, porque reinstalarían versiones anteriores sin las correcciones.
--
-- Contenido:
--   A. Corrección: tipos de retorno (varchar vs text) que hacían fallar 4 RPC.
--   B. Corrección: estado_lector respetaba RLS y el bloqueo se podía eludir.
--   C. Parámetros del sistema en un solo lugar, en vez de repetidos en 5.
--   D. Cumplimiento Ley 21.719: derechos ARCO, consentimiento, retención.
--   E. Cumplimiento Ley 21.663: evidencia para reporte de incidentes.
--
-- AVISO: esto implementa medidas TÉCNICAS que apoyan el cumplimiento. No
-- reemplaza la revisión de la Dirección Jurídica de la Municipalidad, que debe
-- validar textos de consentimiento, plazos de conservación y designaciones.
-- ============================================================================


-- ============================================================================
-- A. CORRECCIÓN CRÍTICA: tipos de retorno
-- ============================================================================
-- ----------------------------------------------------------------------------
-- IMPORTANTE: por qué hay DROP antes de cada CREATE
-- ----------------------------------------------------------------------------
-- PostgreSQL no permite que "create or replace function" cambie el tipo de
-- retorno de una función existente: responde
--   ERROR: cannot change return type of existing function
--
-- Varias funciones de esta migración añaden columnas al resultado respecto de
-- las versiones de las migraciones 005 y 006 (por ejemplo, buscar_libros ahora
-- devuelve copias_totales). Sin estos DROP la migración completa falla y las
-- correcciones críticas no se aplican.
--
-- Se usa "if exists" para que funcione en una instalación nueva, y NO se usa
-- CASCADE: si algo dependiera de estas funciones, es mejor que el error avise
-- en vez de borrar objetos en silencio.
-- ----------------------------------------------------------------------------

drop function if exists public.estado_lector(text);
drop function if exists public.consultar_libro(text);
drop function if exists public.buscar_libros(text, int, int);
drop function if exists public.revisar_inventario();
drop function if exists public.prestar_libro(bigint, text);
drop function if exists public.renovar_prestamo(bigint);


-- Si las columnas de las tablas son varchar(n) en vez de text, PostgreSQL
-- rechaza la llamada con "structure of query does not match function result
-- type". Los cast ::text hacen que la función funcione con cualquiera de los
-- dos tipos. Lo mismo con ::bigint para los identificadores, por si las
-- tablas usan serial (integer) en vez de bigserial.

create or replace function public.estado_lector(p_rut text)
returns table (
  existe boolean, lector_id bigint, nombre text, rut text, email text, telefono text,
  bloqueado_manual boolean, motivo_bloqueo text,
  prestamos_activos int, prestamos_atrasados int,
  puede_prestar boolean, motivo_rechazo text
)
language plpgsql
stable
-- SECURITY DEFINER es indispensable: sin esto la función respetaba las
-- políticas RLS del usuario que la llama, así que si un librero no podía ver
-- todos los préstamos, el conteo salía bajo y tanto el límite como el bloqueo
-- por atraso se podían eludir sin que nadie lo notara.
security definer
set search_path = public
as $$
declare
  v_lector public.lectores;
  v_activos int := 0;
  v_atrasados int := 0;
  v_limite int;
  v_puede boolean := true;
  v_motivo text := null;
begin
  v_limite := public.parametro_int('max_prestamos_por_lector', 3);

  select * into v_lector from public.lectores where lectores.rut = p_rut;

  if v_lector.id is null then
    return query select false, null::bigint, null::text, p_rut::text, null::text, null::text,
                        false, null::text, 0, 0, false, 'Este RUT no está registrado.'::text;
    return;
  end if;

  -- Se califican las columnas con el nombre de la tabla: RETURNS TABLE declara
  -- una salida llamada lector_id y sin calificar PostgreSQL no distingue entre
  -- la variable de salida y la columna, y aborta con "reference is ambiguous".
  select count(*) filter (where p.estado = 'activo'),
         count(*) filter (where p.estado = 'activo' and p.fecha_devolucion_esperada < public.hoy_chile())
    into v_activos, v_atrasados
  from public.prestamos p
  where p.lector_id = v_lector.id;

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

  return query select true, v_lector.id::bigint, v_lector.nombre::text, v_lector.rut::text,
                      v_lector.email::text, v_lector.telefono::text,
                      v_lector.bloqueado_manual, v_lector.motivo_bloqueo::text,
                      v_activos, v_atrasados, v_puede, v_motivo::text;
end;
$$;

grant execute on function public.estado_lector(text) to authenticated;


create or replace function public.consultar_libro(p_codigo text)
returns table (
  libro_id bigint, isbn text, titulo text, autor text, genero text, ubicacion text,
  portada_url text, copias_totales int, stock int,
  prestamo_id bigint, fecha_prestamo date, fecha_devolucion_esperada date,
  dias_restantes int, renovaciones int,
  lector_id bigint, lector_nombre text, lector_rut text, lector_email text,
  lector_telefono text, lector_bloqueado boolean, lector_atrasados int
)
language sql
stable
security definer
set search_path = public
as $$
  with libro as (
    select * from public.libros
    where isbn = p_codigo or isbn = replace(p_codigo, '-', '')
    limit 1
  )
  select
    l.id::bigint, l.isbn::text, l.titulo::text, l.autor::text, l.genero::text,
    l.ubicacion::text, l.portada_url::text, l.copias_totales::int, l.stock::int,
    p.id::bigint, p.fecha_prestamo, p.fecha_devolucion_esperada,
    (p.fecha_devolucion_esperada - public.hoy_chile())::int,
    p.renovaciones::int,
    lec.id::bigint, lec.nombre::text, lec.rut::text, lec.email::text, lec.telefono::text,
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


create or replace function public.buscar_libros(
  p_busqueda text default '', p_limite int default 50, p_desplazamiento int default 0
)
returns table (
  id bigint, isbn text, titulo text, autor text, genero text, ubicacion text,
  portada_url text, copias_totales int, stock int, total_coincidencias bigint
)
language sql
stable
set search_path = public
as $$
  with filtrados as (
    select l.* from public.libros l
    where p_busqueda is null or p_busqueda = ''
       or public.sin_acentos(l.titulo) like '%' || public.sin_acentos(p_busqueda) || '%'
       or public.sin_acentos(l.autor)  like '%' || public.sin_acentos(p_busqueda) || '%'
       or l.isbn like '%' || p_busqueda || '%'
  )
  select f.id::bigint, f.isbn::text, f.titulo::text, f.autor::text, f.genero::text,
         f.ubicacion::text, f.portada_url::text, f.copias_totales::int, f.stock::int,
         (select count(*) from filtrados)::bigint
  from filtrados f
  order by f.titulo
  limit p_limite offset p_desplazamiento;
$$;

grant execute on function public.buscar_libros(text, int, int) to authenticated;


create or replace function public.revisar_inventario()
returns table (
  libro_id bigint, titulo text, isbn text,
  copias_totales int, stock int, prestados int, diferencia int
)
language sql
stable
set search_path = public
as $$
  select l.id::bigint, l.titulo::text, l.isbn::text,
         l.copias_totales::int, l.stock::int,
         coalesce(p.activos, 0)::int,
         (l.copias_totales - l.stock - coalesce(p.activos, 0))::int
  from public.libros l
  left join (
    select libro_id, count(*) as activos
    from public.prestamos where estado = 'activo' group by libro_id
  ) p on p.libro_id = l.id
  where l.copias_totales - l.stock - coalesce(p.activos, 0) <> 0 or l.stock < 0
  order by abs(l.copias_totales - l.stock - coalesce(p.activos, 0)) desc;
$$;

grant execute on function public.revisar_inventario() to authenticated;


-- ============================================================================
-- C. PARÁMETROS EN UN SOLO LUGAR
-- ============================================================================
-- El límite de préstamos estaba escrito en cuatro archivos SQL más config.js.
-- Ahora vive en una tabla: se cambia sin tocar código y no puede quedar
-- desincronizado entre la interfaz y la base de datos.

create table if not exists public.parametros (
  clave text primary key,
  valor text not null,
  descripcion text,
  actualizado_en timestamptz not null default now()
);

insert into public.parametros (clave, valor, descripcion) values
  ('max_prestamos_por_lector', '3',  'Préstamos activos simultáneos permitidos por lector'),
  ('max_renovaciones',         '2',  'Renovaciones permitidas por préstamo'),
  ('dias_prestamo',            '7',  'Duración de un préstamo, en días'),
  ('dias_aviso_previo',        '3',  'Días antes del vencimiento en que se avisa al lector'),
  ('retencion_prestamos_anios','5',  'Años que se conserva el historial de préstamos antes de anonimizar (Ley 21.719, principio de limitación temporal)')
on conflict (clave) do nothing;

alter table public.parametros enable row level security;
drop policy if exists "parametros lectura" on public.parametros;
create policy "parametros lectura" on public.parametros for select using (true);
drop policy if exists "parametros escritura admin" on public.parametros;
create policy "parametros escritura admin" on public.parametros
  for all using (public.es_admin()) with check (public.es_admin());

create or replace function public.parametro_int(p_clave text, p_defecto int)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select valor::int from public.parametros where clave = p_clave), p_defecto);
$$;

grant execute on function public.parametro_int(text, int) to authenticated;


-- Se reinstalan las funciones de préstamo y renovación leyendo los parámetros
create or replace function public.prestar_libro(p_libro_id bigint, p_lector_rut text)
returns table (prestamo_id bigint, fecha_devolucion_esperada date)
language plpgsql
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


create or replace function public.renovar_prestamo(p_prestamo_id bigint)
returns table (nueva_fecha date, renovaciones_usadas int)
language plpgsql
set search_path = public
as $$
declare
  v_estado text;
  v_vence date;
  v_renovaciones int;
  v_limite int := public.parametro_int('max_renovaciones', 2);
  v_dias int := public.parametro_int('dias_prestamo', 7);
begin
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


-- ============================================================================
-- D. CUMPLIMIENTO LEY 21.719 (vigente desde el 1 de diciembre de 2026)
-- ============================================================================

-- D.1 CONSENTIMIENTO INFORMADO
-- La ley exige registrar cuándo y bajo qué versión de la información el
-- titular consintió el tratamiento de sus datos. Sin fecha ni versión, no hay
-- forma de acreditarlo ante la Agencia.

alter table public.lectores add column if not exists consentimiento_fecha timestamptz;
alter table public.lectores add column if not exists consentimiento_version text;
-- Autorización del apoderado, obligatoria para lectores menores de 18 años
alter table public.lectores add column if not exists es_menor boolean not null default false;
alter table public.lectores add column if not exists apoderado_nombre text;
alter table public.lectores add column if not exists apoderado_rut text;


-- D.2 DERECHO DE ACCESO Y PORTABILIDAD (artículos sobre derechos ARCO)
/**
 * Entrega todos los datos personales que la biblioteca tiene sobre un lector,
 * en formato estructurado. Cubre el derecho de acceso y el de portabilidad:
 * el titular puede pedirlo y debe recibirlo en un formato reutilizable.
 */
create or replace function public.exportar_datos_lector(p_rut text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_lector public.lectores;
  v_resultado jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede exportar datos de un titular.' using errcode = 'P0001';
  end if;

  select * into v_lector from public.lectores where rut = p_rut;
  if v_lector.id is null then
    raise exception 'No existe un lector con ese RUT.' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'generado_en', now(),
    'fundamento', 'Solicitud de acceso y portabilidad, Ley 21.719',
    'responsable', 'Ilustre Municipalidad de Futrono — Biblioteca Pública Municipal',
    'datos_personales', jsonb_build_object(
      'nombre', v_lector.nombre,
      'rut', v_lector.rut,
      'email', v_lector.email,
      'telefono', v_lector.telefono,
      'fecha_registro', v_lector.created_at,
      'consentimiento_fecha', v_lector.consentimiento_fecha,
      'consentimiento_version', v_lector.consentimiento_version,
      'es_menor', v_lector.es_menor,
      'apoderado_nombre', v_lector.apoderado_nombre,
      'bloqueado', v_lector.bloqueado_manual,
      'motivo_bloqueo', v_lector.motivo_bloqueo
    ),
    'historial_prestamos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'libro', l.titulo, 'autor', l.autor,
        'fecha_prestamo', p.fecha_prestamo,
        'fecha_devolucion_esperada', p.fecha_devolucion_esperada,
        'fecha_devolucion_real', p.fecha_devolucion_real,
        'estado', p.estado, 'renovaciones', p.renovaciones
      ) order by p.fecha_prestamo desc)
      from public.prestamos p join public.libros l on l.id = p.libro_id
      where p.lector_id = v_lector.id
    ), '[]'::jsonb)
  ) into v_resultado;

  return v_resultado;
end;
$$;

grant execute on function public.exportar_datos_lector(text) to authenticated;


-- D.3 DERECHO DE CANCELACIÓN (supresión)
/**
 * Elimina los datos personales de un lector conservando el registro
 * estadístico del préstamo.
 *
 * Se anonimiza en vez de borrar la fila completa porque las dos obligaciones
 * conviven: la Ley 21.719 da derecho a la supresión de los datos personales,
 * pero la Municipalidad debe conservar registros de su gestión (Ley 20.285 de
 * Transparencia y normas de rendición). Anonimizar satisface ambas: desaparece
 * la persona identificable, permanece el hecho estadístico.
 *
 * No se puede anonimizar a alguien con préstamos activos: primero debe
 * devolver los libros.
 */
create or replace function public.anonimizar_lector(p_lector_id bigint, p_motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activos int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede anonimizar a un titular.' using errcode = 'P0001';
  end if;

  select count(*) into v_activos
  from public.prestamos where lector_id = p_lector_id and estado = 'activo';

  if v_activos > 0 then
    raise exception 'Este lector tiene % préstamo(s) activo(s). Debe devolverlos antes de suprimir sus datos.', v_activos
      using errcode = 'P0001';
  end if;

  update public.lectores
     set nombre = 'Lector anonimizado',
         -- El RUT se reemplaza por un identificador irreversible que mantiene
         -- la unicidad de la fila sin permitir reidentificar a la persona
         -- Identificador irreversible que preserva la unicidad de la fila.
         -- Se usa gen_random_uuid() en vez de digest() de pgcrypto: esa
         -- extensión vive en el esquema `extensions` de Supabase y no
         -- resolvería desde aquí, y un UUID aleatorio ya es irreversible.
         rut = 'ANON-' || replace(gen_random_uuid()::text, '-', ''),
         email = null,
         telefono = null,
         motivo_bloqueo = null,
         bloqueado_manual = false,
         apoderado_nombre = null,
         apoderado_rut = null,
         consentimiento_fecha = null,
         consentimiento_version = null
   where id = p_lector_id;

  insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_despues)
  values ('lectores', p_lector_id::text, 'UPDATE', auth.uid(),
          (select email from auth.users where id = auth.uid()),
          jsonb_build_object('operacion', 'anonimizacion', 'motivo', p_motivo, 'fundamento', 'Ley 21.719, derecho de supresión'));
end;
$$;

grant execute on function public.anonimizar_lector(bigint, text) to authenticated;


-- D.4 LIMITACIÓN TEMPORAL (conservación de datos)
/**
 * Anonimiza el historial de lectores sin actividad durante el plazo de
 * conservación definido en los parámetros. La ley exige no conservar datos
 * identificables más allá de lo necesario para la finalidad declarada.
 *
 * Devuelve cuántos titulares fueron anonimizados. Conviene ejecutarla una vez
 * al año, dejando constancia en la auditoría.
 */
create or replace function public.purgar_datos_antiguos()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anios int := public.parametro_int('retencion_prestamos_anios', 5);
  v_corte date := public.hoy_chile() - (v_anios * 365);
  v_lector record;
  v_total int := 0;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ejecutar la purga de datos.' using errcode = 'P0001';
  end if;

  for v_lector in
    select l.id from public.lectores l
    where l.rut not like 'ANON-%'
      and not exists (select 1 from public.prestamos p where p.lector_id = l.id and p.estado = 'activo')
      and coalesce((select max(p.fecha_prestamo) from public.prestamos p where p.lector_id = l.id),
                   l.created_at::date) < v_corte
  loop
    perform public.anonimizar_lector(v_lector.id, 'Purga automática por plazo de conservación (' || v_anios || ' años)');
    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;

grant execute on function public.purgar_datos_antiguos() to authenticated;


-- ============================================================================
-- E. CUMPLIMIENTO LEY 21.663 — evidencia para reporte de incidentes
-- ============================================================================
-- La ley obliga a los organismos del Estado, municipalidades incluidas, a
-- reportar incidentes: alerta temprana en 3 horas, informe inicial en 72 horas.
-- Sin evidencia consultable, ese plazo es imposible de cumplir.

/**
 * Extrae la actividad de un rango de fechas en formato de informe, para
 * adjuntar a un reporte al CSIRT Nacional o a la Agencia de Protección de
 * Datos ante una brecha.
 */
create or replace function public.evidencia_incidente(
  p_desde timestamptz,
  p_hasta timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede extraer evidencia de incidentes.' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'generado_en', now(),
    'rango_desde', p_desde,
    'rango_hasta', p_hasta,
    'total_movimientos', (select count(*) from public.auditoria where created_at between p_desde and p_hasta),
    'por_usuario', coalesce((
      select jsonb_agg(x) from (
        select usuario_email, count(*) as movimientos,
               count(*) filter (where accion = 'DELETE') as eliminaciones,
               min(created_at) as primero, max(created_at) as ultimo
        from public.auditoria
        where created_at between p_desde and p_hasta
        group by usuario_email order by count(*) desc
      ) x), '[]'::jsonb),
    'eliminaciones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'cuando', created_at, 'quien', usuario_email,
        'tabla', tabla, 'registro', registro_id
      ) order by created_at desc)
      from public.auditoria
      where accion = 'DELETE' and created_at between p_desde and p_hasta
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.evidencia_incidente(timestamptz, timestamptz) to authenticated;


-- ============================================================================
-- F. VERIFICACIÓN DE POLÍTICAS RLS
-- ============================================================================
/**
 * Revisa que las tablas con datos personales tengan RLS activo y políticas
 * definidas. Ocultar botones en la interfaz no protege nada: sin RLS,
 * cualquiera con la clave pública puede escribir desde la consola.
 */
create or replace function public.verificar_rls()
returns table (
  tabla text,
  rls_activo boolean,
  politicas int,
  diagnostico text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.relname::text,
    c.relrowsecurity,
    (select count(*)::int from pg_policies p where p.tablename = c.relname and p.schemaname = 'public'),
    case
      when not c.relrowsecurity then 'CRÍTICO: sin RLS, cualquiera puede leer y escribir esta tabla'
      when (select count(*) from pg_policies p where p.tablename = c.relname and p.schemaname = 'public') = 0
        then 'CRÍTICO: RLS activo pero sin políticas, la tabla queda inaccesible o abierta según el rol'
      else 'Correcto'
    end::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname in ('libros', 'lectores', 'prestamos', 'usuarios', 'auditoria', 'parametros')
  order by c.relrowsecurity, c.relname;
$$;

grant execute on function public.verificar_rls() to authenticated;


-- ============================================================================
-- G. SIN DEPENDENCIAS DE EXTENSIONES
-- ============================================================================
-- Esta migración no requiere ninguna extensión. Las versiones anteriores
-- dependían de pgcrypto (para digest) y unaccent (para la búsqueda); ambas se
-- reemplazaron por funciones del núcleo de PostgreSQL, porque en Supabase las
-- extensiones se instalan en el esquema `extensions` y no resolvían desde
-- funciones con search_path = public.
