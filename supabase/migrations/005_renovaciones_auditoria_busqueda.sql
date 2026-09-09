-- ============================================================================
-- BiblioNexo — 005: Renovaciones, auditoría y búsqueda sin acentos
-- ============================================================================
-- Ejecutar DESPUÉS de 001, 002, 003 y 004.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) RENOVACIÓN DE PRÉSTAMOS
-- ----------------------------------------------------------------------------
-- Es la operación más común de una biblioteca después de prestar y devolver,
-- y hasta ahora no existía: la única salida era devolver y volver a prestar,
-- lo que ensucia las estadísticas.

alter table public.prestamos add column if not exists renovaciones int not null default 0;

create or replace function public.renovar_prestamo(
  p_prestamo_id bigint
)
returns table (
  nueva_fecha date,
  renovaciones_usadas int
)
language plpgsql
set search_path = public
as $$
declare
  v_estado text;
  v_vence date;
  v_renovaciones int;
  v_nueva date;
  -- Máximo de renovaciones por préstamo. Debe coincidir con
  -- CONFIG.MAX_RENOVACIONES en js/config.js
  v_limite constant int := 2;
  v_dias constant int := 7;
begin
  select estado, fecha_devolucion_esperada, renovaciones
    into v_estado, v_vence, v_renovaciones
  from public.prestamos
  where id = p_prestamo_id
  for update;

  if v_estado is null then
    raise exception 'Préstamo no encontrado.' using errcode = 'P0001';
  end if;
  if v_estado <> 'activo' then
    raise exception 'Solo se pueden renovar préstamos activos.' using errcode = 'P0001';
  end if;
  if v_renovaciones >= v_limite then
    raise exception 'Este préstamo ya se renovó % veces, el máximo permitido.', v_limite using errcode = 'P0001';
  end if;
  -- Política habitual: un préstamo atrasado se devuelve, no se renueva.
  if v_vence < public.hoy_chile() then
    raise exception 'El préstamo está atrasado. Debe devolverse antes de volver a prestarlo.' using errcode = 'P0001';
  end if;

  -- Se extiende desde la fecha de vencimiento, no desde hoy, para que
  -- renovar antes de tiempo no regale días extra.
  v_nueva := v_vence + v_dias;

  update public.prestamos
     set fecha_devolucion_esperada = v_nueva,
         renovaciones = renovaciones + 1
   where id = p_prestamo_id;

  return query select v_nueva, v_renovaciones + 1;
end;
$$;

grant execute on function public.renovar_prestamo(bigint) to authenticated;

-- ----------------------------------------------------------------------------
-- 2) REGISTRO DE AUDITORÍA
-- ----------------------------------------------------------------------------
-- Deja constancia de quién creó, modificó o eliminó cada registro. Para una
-- institución municipal esto importa: permite responder "¿quién borró este
-- libro del catálogo?".
--
-- Se implementa con triggers y no desde la aplicación a propósito: así queda
-- registrado incluso si alguien escribe directamente en la base de datos.

create table if not exists public.auditoria (
  id bigserial primary key,
  tabla text not null,
  registro_id text,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id uuid,
  usuario_email text,
  datos_antes jsonb,
  datos_despues jsonb,
  created_at timestamptz not null default now()
);

create index if not exists auditoria_created_at_idx on public.auditoria (created_at desc);
create index if not exists auditoria_tabla_idx on public.auditoria (tabla);

-- El registro va dentro de un bloque de excepción a propósito.
--
-- Es un trigger AFTER ... FOR EACH ROW: si su inserción falla (por una política
-- RLS, un permiso, o porque alguien renombró la tabla), la transacción completa
-- se revierte y deja de poderse crear, editar o eliminar cualquier libro,
-- lector o préstamo. La bitácora nunca debe impedir la operación real; si no se
-- puede registrar, se deja una advertencia y la operación continúa.
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
    -- auth.email() puede no existir según la versión; se resuelve de forma segura
    begin
      select email into v_email from auth.users where id = auth.uid();
    exception when others then
      v_email := null;
    end;

    v_id := coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id'));

    insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_antes, datos_despues)
    values (
      tg_table_name,
      v_id,
      tg_op,
      auth.uid(),
      v_email,
      case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  exception when others then
    raise warning 'No se pudo registrar la auditoría de % en %: %', tg_op, tg_table_name, sqlerrm;
  end;

  return coalesce(new, old);
end;
$$;

-- Se recrean para que la migración se pueda ejecutar más de una vez sin error
drop trigger if exists auditoria_libros on public.libros;
create trigger auditoria_libros
  after insert or update or delete on public.libros
  for each row execute function public.registrar_auditoria();

drop trigger if exists auditoria_lectores on public.lectores;
create trigger auditoria_lectores
  after insert or update or delete on public.lectores
  for each row execute function public.registrar_auditoria();

drop trigger if exists auditoria_prestamos on public.prestamos;
create trigger auditoria_prestamos
  after insert or update or delete on public.prestamos
  for each row execute function public.registrar_auditoria();

-- La auditoría se lee, nunca se modifica desde la aplicación
alter table public.auditoria enable row level security;

drop policy if exists "auditoria solo lectura admin" on public.auditoria;
create policy "auditoria solo lectura admin" on public.auditoria
  for select using (public.es_admin());

-- Sin esta política, RLS bloquearía la inserción del trigger
drop policy if exists "auditoria insercion por trigger" on public.auditoria;
create policy "auditoria insercion por trigger" on public.auditoria
  for insert with check (true);

-- ----------------------------------------------------------------------------
-- 3) BÚSQUEDA SIN ACENTOS
-- ----------------------------------------------------------------------------
-- Sin esto, buscar "Neruda" no encuentra "Nerudá" y viceversa, lo que en
-- catálogos en español ocurre constantemente.
--
-- Se resuelve con translate() en vez de la extensión unaccent, por tres razones:
--   1. No depende de que la extensión esté instalada. La versión anterior
--      hacía fallar TODA esta migración si unaccent no estaba disponible.
--   2. En Supabase las extensiones se instalan en el esquema `extensions`, no
--      en `public`, así que una llamada a public.unaccent() podía no resolver.
--   3. translate() es IMMUTABLE por definición, requisito para usarla en un
--      índice. La función unaccent de un solo argumento no lo es.
-- Para el español el resultado es equivalente.

create or replace function public.sin_acentos(txt text)
returns text
language sql
immutable
parallel safe
as $$
  select translate(
    lower(coalesce(txt, '')),
    'áàâäãåéèêëíìîïóòôöõúùûüýñçÁÀÂÄÃÅÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÝÑÇ',
    'aaaaaaeeeeiiiiooooouuuuyncaaaaaaeeeeiiiiooooouuuuync'
  );
$$;

grant execute on function public.sin_acentos(text) to authenticated;

-- Índice para que la búsqueda sea rápida aunque el catálogo crezca
create index if not exists libros_busqueda_idx
  on public.libros (public.sin_acentos(titulo), public.sin_acentos(autor));

/**
 * Busca libros ignorando acentos y mayúsculas, con paginación.
 * Devuelve además el total de coincidencias, para poder mostrar
 * "página 2 de 7" sin hacer una segunda consulta.
 */
create or replace function public.buscar_libros(
  p_busqueda text default '',
  p_limite int default 50,
  p_desplazamiento int default 0
)
returns table (
  id bigint,
  isbn text,
  titulo text,
  autor text,
  genero text,
  ubicacion text,
  portada_url text,
  stock int,
  total_coincidencias bigint
)
language sql
stable
set search_path = public
as $$
  with filtrados as (
    select l.*
    from public.libros l
    where p_busqueda is null
       or p_busqueda = ''
       or public.sin_acentos(l.titulo) like '%' || public.sin_acentos(p_busqueda) || '%'
       or public.sin_acentos(l.autor)  like '%' || public.sin_acentos(p_busqueda) || '%'
       or l.isbn like '%' || p_busqueda || '%'
  )
  select f.id, f.isbn, f.titulo, f.autor, f.genero, f.ubicacion, f.portada_url, f.stock,
         (select count(*) from filtrados) as total_coincidencias
  from filtrados f
  order by f.titulo
  limit p_limite offset p_desplazamiento;
$$;

grant execute on function public.buscar_libros(text, int, int) to authenticated;
