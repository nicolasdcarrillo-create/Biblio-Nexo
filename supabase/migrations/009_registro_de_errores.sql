-- ADVERTENCIA: Este archivo es histórico y puede contener definiciones de funciones que han sido consolidadas.
-- NO ejecutar este archivo directamente en staging o producción para corregir funciones críticas.
-- Las definiciones autoritativas están en supabase/migrations/010_consolidacion.sql y se reaplican con 011_reaplicar_consolidacion.sql.
-- Si se necesita corregir funciones en la base de datos, usar 011_reaplicar_consolidacion.sql (idempotente) tras respaldar la BD.
-- ============================================================================
-- BiblioNexo — 009: Registro de errores
-- ============================================================================
-- Ejecutar DESPUÉS de la 008. Es idempotente.
--
-- El problema que resuelve: hasta ahora, si algo fallaba en el mesón un martes
-- por la tarde, nadie se enteraba salvo que alguien llamara por teléfono. No
-- había forma de saber si un error era aislado o llevaba semanas repitiéndose.
--
-- Por qué NO se usa un servicio externo tipo Sentry, que sería lo habitual:
--
--   1. La Política de Seguridad de Contenido bloquea los orígenes de terceros
--      a propósito, para cerrar el riesgo de cadena de suministro. Abrirla para
--      un servicio de monitoreo desharía parte de esa decisión.
--   2. Un informe de error arrastra la URL, el navegador y, con frecuencia,
--      fragmentos de lo que había en pantalla. En este sistema eso es el nombre
--      y el RUT de un vecino. Mandarlo a un servidor de otra empresa es una
--      transferencia de datos personales que habría que declarar y contratar
--      bajo la Ley 21.719.
--
-- Guardar los errores en la misma base de datos evita las dos cosas: no sale
-- nada del proyecto, y el responsable sigue siendo la Municipalidad.
-- ============================================================================


create table if not exists public.errores (
  id bigint generated always as identity primary key,
  ocurrido_en   timestamptz not null default now(),
  -- 'js' (fallo del navegador) u 'operacion' (una acción que no se completó)
  origen        text not null default 'js',
  mensaje       text not null,
  detalle       text,
  -- Dónde estaba la persona: vista y acción, no la URL completa
  vista         text,
  accion        text,
  usuario_id    uuid,
  usuario_email text,
  navegador     text,
  -- Cuántas veces se repitió el mismo error; evita que un fallo en bucle
  -- llene la tabla con miles de filas idénticas
  repeticiones  int not null default 1,
  visto         boolean not null default false
);

create index if not exists errores_fecha_idx on public.errores (ocurrido_en desc);
create index if not exists errores_huella_idx on public.errores (mensaje, vista);

comment on table public.errores is
  'Bitácora técnica de fallos. No debe contener datos personales de lectores: '
  'quien registra recorta el mensaje y nunca envía el contenido de la pantalla.';


-- ----------------------------------------------------------------------------
-- Registrar un error
-- ----------------------------------------------------------------------------
/**
 * Guarda un fallo. Si el mismo mensaje ya se registró en la misma vista dentro
 * de la última hora, suma una repetición en vez de crear una fila nueva.
 *
 * Es SECURITY DEFINER porque debe funcionar incluso cuando lo que falló fue,
 * justamente, un permiso. Un registro de errores que no puede escribir cuando
 * hay problemas de permisos no sirve para nada.
 *
 * Los textos se recortan: un mensaje de error puede traer un volcado enorme, y
 * el objetivo es saber qué falló, no reconstruir la sesión completa.
 */
create or replace function public.registrar_error(
  p_mensaje   text,
  p_origen    text default 'js',
  p_detalle   text default null,
  p_vista     text default null,
  p_accion    text default null,
  p_navegador text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mensaje text := left(coalesce(nullif(btrim(p_mensaje), ''), 'Error sin mensaje'), 500);
  v_vista   text := left(coalesce(p_vista, ''), 60);
  v_email   text;
  v_id      bigint;
begin
  -- Sin sesión no se registra: si no, la llave anónima permitiría a cualquiera
  -- llenar la tabla desde fuera.
  if auth.uid() is null then
    return;
  end if;

  begin
    select email into v_email from auth.users where id = auth.uid();
  exception when others then
    v_email := null;
  end;

  select id into v_id
  from public.errores
  where mensaje = v_mensaje
    and coalesce(vista, '') = v_vista
    and ocurrido_en > now() - interval '1 hour'
  order by ocurrido_en desc
  limit 1;

  if v_id is not null then
    update public.errores
       set repeticiones = repeticiones + 1,
           ocurrido_en  = now()
     where id = v_id;
  else
    insert into public.errores (origen, mensaje, detalle, vista, accion, usuario_id, usuario_email, navegador)
    values (
      left(coalesce(p_origen, 'js'), 20),
      v_mensaje,
      left(coalesce(p_detalle, ''), 2000),
      nullif(v_vista, ''),
      left(coalesce(p_accion, ''), 80),
      auth.uid(),
      v_email,
      left(coalesce(p_navegador, ''), 200)
    );
  end if;
end;
$$;

grant execute on function public.registrar_error(text, text, text, text, text, text) to authenticated;


-- ----------------------------------------------------------------------------
-- Consultar y limpiar (solo administradores)
-- ----------------------------------------------------------------------------
create or replace function public.listar_errores(p_limite int default 100, p_solo_nuevos boolean default false)
returns table (
  id bigint,
  ocurrido_en timestamptz,
  origen text,
  mensaje text,
  detalle text,
  vista text,
  accion text,
  usuario_email text,
  navegador text,
  repeticiones int,
  visto boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver el registro de errores.' using errcode = 'P0001';
  end if;

  return query
    select e.id, e.ocurrido_en, e.origen, e.mensaje, e.detalle, e.vista, e.accion,
           e.usuario_email, e.navegador, e.repeticiones, e.visto
    from public.errores e
    where (not p_solo_nuevos or not e.visto)
    order by e.ocurrido_en desc
    limit least(coalesce(p_limite, 100), 500);
end;
$$;

grant execute on function public.listar_errores(int, boolean) to authenticated;


/** Resumen para el panel: cuántos fallos hay y desde cuándo. */
create or replace function public.resumen_errores()
returns table (
  sin_revisar int,
  ultimas_24h int,
  total int,
  mas_reciente timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver el registro de errores.' using errcode = 'P0001';
  end if;

  return query
    select
      count(*) filter (where not visto)::int,
      count(*) filter (where ocurrido_en > now() - interval '24 hours')::int,
      count(*)::int,
      max(ocurrido_en)
    from public.errores;
end;
$$;

grant execute on function public.resumen_errores() to authenticated;


/** Marca un error como revisado, o todos si no se indica cuál. */
create or replace function public.marcar_error_visto(p_id bigint default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede marcar errores.' using errcode = 'P0001';
  end if;

  if p_id is null then
    update public.errores set visto = true where not visto;
  else
    update public.errores set visto = true where id = p_id;
  end if;
end;
$$;

grant execute on function public.marcar_error_visto(bigint) to authenticated;


/**
 * Borra los errores más antiguos que el plazo indicado.
 * La bitácora técnica no tiene por qué conservarse indefinidamente, y menos si
 * en algún momento arrastra algo que no debería.
 */
create or replace function public.purgar_errores(p_dias int default 90)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borrados int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede purgar el registro.' using errcode = 'P0001';
  end if;

  delete from public.errores where ocurrido_en < now() - (greatest(coalesce(p_dias, 90), 1) || ' days')::interval;
  get diagnostics v_borrados = row_count;
  return v_borrados;
end;
$$;

grant execute on function public.purgar_errores(int) to authenticated;


-- ----------------------------------------------------------------------------
-- Políticas
-- ----------------------------------------------------------------------------
-- Todo pasa por las funciones de arriba. La tabla queda cerrada a la vía
-- directa: escribir sin control permitiría llenarla, y leer sin control
-- expondría los mensajes de fallo a cualquiera del personal.

alter table public.errores enable row level security;

drop policy if exists "errores lectura admin"  on public.errores;
drop policy if exists "errores borrado admin"  on public.errores;

create policy "errores lectura admin" on public.errores
  for select to authenticated using (public.es_admin());
create policy "errores borrado admin" on public.errores
  for delete to authenticated using (public.es_admin());

grant select, delete on public.errores to authenticated;


-- La verificación de RLS pasa a cubrir también esta tabla.
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
    and c.relname in ('libros', 'lectores', 'prestamos', 'usuarios', 'auditoria', 'parametros', 'errores')
  order by c.relrowsecurity, c.relname;
$$;

grant execute on function public.verificar_rls() to authenticated;
