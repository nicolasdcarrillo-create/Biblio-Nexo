-- ============================================================================
-- BiblioNexo — 013: Políticas de autoprovisión y cambio de rol en usuarios
-- ============================================================================
-- Numerada después de la 012, pero sin depender de ella: estas políticas no
-- usan auth.users ni sus permisos, solo van después por orden de archivo.
-- Es idempotente: DROP POLICY IF EXISTS antes de cada CREATE, se puede
-- correr dos veces sin problema.
--
-- Estas dos políticas ya están activas en producción desde el 26 de julio
-- (migración remota 20260726153034, aplicada directo sobre la base, sin
-- archivo local hasta ahora). Este archivo las trae al repositorio: es una
-- reconciliación, no un cambio de comportamiento. Copiadas verbatim desde
-- `supabase_migrations.schema_migrations` en producción, no reconstruidas de
-- memoria.
--
-- Qué resuelven:
--
--   INSERT "Autoprovisionar fila propia como librero" — cualquier persona
--   autenticada puede crear SU PROPIA fila en `usuarios`, pero solo con
--   rol 'librero'. Nadie puede autoasignarse 'admin' por esta vía: el
--   `with check` fija el rol en la propia política, no lo deja a elección
--   de quien inserta.
--
--   UPDATE "Solo admins cambian roles" — cambiar cualquier fila de
--   `usuarios` (incluida la propia) exige ya ser admin. Se solapa con
--   "usuarios admin gestiona" (008/010, `for all using (es_admin())`), que
--   ya cubre UPDATE para admins; se incorpora tal cual estaba en producción
--   en vez de asumir que el solape la vuelve prescindible.
--
-- Lo que este archivo NO incluye: la siembra de las dos cuentas de usuario
-- que traía la migración remota. Eso es dato de arranque puntual de un
-- momento específico, no esquema — no pertenece a una migración.
-- ============================================================================

drop policy if exists "Autoprovisionar fila propia como librero" on public.usuarios;
create policy "Autoprovisionar fila propia como librero"
on public.usuarios
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and rol = 'librero'
);

drop policy if exists "Solo admins cambian roles" on public.usuarios;
create policy "Solo admins cambian roles"
on public.usuarios
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());
