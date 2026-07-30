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
