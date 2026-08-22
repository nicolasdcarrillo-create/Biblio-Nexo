-- Reproduce lo que Supabase provee de fábrica y lo que se creó desde su interfaz,
-- para poder ejecutar las migraciones 001–008 tal como llegarían al proyecto real.

create schema if not exists auth;

do $$ begin
  create role anon nologin;
exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin;
exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated;

-- Lo que Supabase hace de fábrica y que este arnés no reproducía hasta
-- ahora: CUALQUIER tabla nueva de `public` queda con acceso amplio
-- (select/insert/update/delete) para `anon` Y `authenticated` desde el
-- momento en que se crea, sin que ninguna migración tenga que pedirlo — RLS
-- es la única barrera real, nunca el GRANT (ver la nota larga en
-- `verificar_politicas()`, migración 010). Sin esto, las tablas que las
-- migraciones crean sin un `grant` explícito (`auditoria`, `parametros`,
-- `enlaces_escaneo_remoto`, `respaldos_log`) quedaban con CERO permisos para
-- `authenticated` en este Postgres de prueba, aunque en el proyecto real de
-- Supabase sí funcionan — una diferencia que `verificar_politicas()` habría
-- reportado como falla local, sin que hubiera ningún problema de verdad en
-- producción. Se declara ANTES de crear ninguna tabla: solo afecta a las que
-- se creen después, con esta misma sesión.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  last_sign_in_at timestamptz,
  created_at timestamptz default now()
);

-- auth.uid() de Supabase lee el JWT de la petición. Aquí se emula con una
-- variable de sesión, que es exactamente el mecanismo que usa PostgREST.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth to anon, authenticated;
grant select on auth.users to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tablas base (creadas originalmente desde la interfaz de Supabase)
-- ---------------------------------------------------------------------------
create table if not exists public.libros (
  id bigint generated always as identity primary key,
  isbn text unique,
  titulo text not null,
  autor text,
  stock int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.lectores (
  id bigint generated always as identity primary key,
  rut text,
  nombre text not null,
  email text,
  telefono text,
  created_at timestamptz default now()
);

create table if not exists public.prestamos (
  id bigint generated always as identity primary key,
  libro_id bigint references public.libros(id),
  lector_id bigint references public.lectores(id),
  fecha_devolucion_esperada date,
  fecha_devolucion_real date,
  estado text not null default 'activo',
  created_at timestamptz default now()
);

create table if not exists public.usuarios (
  id uuid primary key,
  email text,
  rol text not null default 'librero'
);

grant select, insert, update, delete on public.libros, public.lectores, public.prestamos, public.usuarios to authenticated;
grant select on public.libros, public.lectores, public.prestamos, public.usuarios to anon;

-- ---------------------------------------------------------------------------
-- Sustitutos de pgcrypto (esquema `extensions` de Supabase)
-- ---------------------------------------------------------------------------
-- Este PostgreSQL de prueba no trae la extensión real. Imitan la firma y el
-- comportamiento suficiente para validar el SQL de crear_enlace_escaneo(),
-- validar_enlace_escaneo() y agregar_libro_remoto() (010_consolidacion.sql);
-- en producción las reemplaza la extensión real. No son criptográficamente
-- fuertes — no hace falta para lo que prueban estos archivos.
create schema if not exists extensions;

create or replace function extensions.digest(texto text, algoritmo text)
returns bytea language sql immutable as $$ select decode(md5(texto), 'hex') $$;

create or replace function extensions.gen_random_bytes(n int)
returns bytea language sql volatile as $$
  select decode(string_agg(lpad(to_hex((random() * 255)::int), 2, '0'), ''), 'hex')
  from generate_series(1, n)
$$;
