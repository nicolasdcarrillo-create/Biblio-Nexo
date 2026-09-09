-- ============================================================================
-- BiblioNexo — 003: Rol de administrador y datos de contacto obligatorios
-- ============================================================================
-- Ejecutar DESPUÉS de 001 y 002.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) EL ROL DE ADMINISTRADOR
-- ----------------------------------------------------------------------------
-- El problema: al iniciar sesión con el correo de administrador, el sistema
-- mostraba la interfaz de "librero". La causa es que el rol se lee de la tabla
-- `usuarios`, y si esa fila no existe, la aplicación cae al rol de menor
-- privilegio.
--
-- El archivo js/config.js ahora tiene un respaldo por correo (ADMIN_EMAILS)
-- para que no quedes bloqueado, PERO eso solo cambia lo que se ve en pantalla:
-- cualquiera puede editar ese archivo desde su navegador. La única barrera
-- real son las políticas RLS, y esas leen la tabla `usuarios`.
--
-- Por eso hay que crear la fila. Reemplaza el correo por el tuyo y ejecuta:

insert into public.usuarios (id, email, rol)
select id, email, 'admin'
from auth.users
where email = 'nicolasd.carrillo@gmail.com'
on conflict (id) do update set rol = 'admin';

-- Verifica que quedó bien:
--   select u.email, u.rol from public.usuarios u;
--
-- Nota: el usuario debe haber iniciado sesión al menos una vez para existir
-- en auth.users. Si la consulta no inserta nada, ese es el motivo.

-- ----------------------------------------------------------------------------
-- 2) FUNCIÓN AUXILIAR PARA LAS POLÍTICAS RLS
-- ----------------------------------------------------------------------------
-- Permite escribir políticas legibles, por ejemplo:
--   create policy "solo admin borra libros" on public.libros
--     for delete using (public.es_admin());
--
-- Se declara SECURITY DEFINER a propósito: necesita leer la tabla `usuarios`
-- sin quedar atrapada en la política RLS de esa misma tabla (recursión infinita).

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid() and rol = 'admin'
  );
$$;

grant execute on function public.es_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- 3) CONTACTO OBLIGATORIO EN LECTORES
-- ----------------------------------------------------------------------------
-- Sin correo ni teléfono no se puede avisar a un lector que su préstamo venció,
-- así que ahora la aplicación los exige. Para que la base de datos lo respalde:
--
-- PRIMERO revisa si hay lectores antiguos sin estos datos:
--   select id, nombre, rut, email, telefono
--   from public.lectores
--   where email is null or telefono is null;
--
-- Completa esas filas y RECIÉN AHÍ descomenta las dos líneas siguientes.
-- Si las ejecutas con filas incompletas, fallarán.

-- alter table public.lectores alter column email set not null;
-- alter table public.lectores alter column telefono set not null;

-- Evita lectores duplicados por RUT (si aún no tienes esta restricción):
create unique index if not exists lectores_rut_unico on public.lectores (rut);
