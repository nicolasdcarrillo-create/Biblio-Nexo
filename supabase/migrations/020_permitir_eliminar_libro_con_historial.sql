-- ============================================================================
-- BiblioNexo — 020: Permitir eliminar un libro con historial ya cerrado
-- ============================================================================
-- Ejecutar DESPUÉS de la 019. Es idempotente: se puede correr dos veces.
--
-- El bug que motivó esto: al intentar eliminar "La mujer justa" (2 copias en
-- catálogo, 0 préstamos activos, 1 préstamo ya devuelto) el panel mostraba
-- "No se puede eliminar. Revise si el libro tiene préstamos activos." — un
-- mensaje falso, porque no había ningún préstamo activo. La causa real:
-- `prestamos.libro_id` tenía una llave foránea hacia `libros(id)` sin
-- `on delete` explícito (`on delete restrict` en producción, confirmado con
-- `pg_get_constraintdef`; ni siquiera está declarada en ningún archivo de
-- este repo — se creó a mano en algún momento antes de que existiera la
-- disciplina de migraciones, la misma clase de deriva que ya se encontró
-- antes con una política RLS de `usuarios`). Esa llave rechaza el borrado si
-- el libro tiene CUALQUIER fila en `prestamos`, sin importar si el préstamo
-- sigue activo o ya se devolvió hace tiempo — y `db.eliminarLibro()`
-- convertía cualquier error de ese `delete` directo en el mismo mensaje
-- genérico, sin distinguir un caso del otro.
--
-- La solución: seguir bloqueando el borrado cuando SÍ hay un préstamo activo
-- (con el mensaje correcto esta vez), pero permitirlo cuando el libro solo
-- tiene historial ya cerrado — archivando el título y autor en cada
-- préstamo devuelto antes de borrar, para que un reporte de un período
-- pasado no quede con una fila vacía donde antes había un libro. Ver
-- `eliminar_libro()`, declarada en `010_consolidacion.sql` (no aquí — sigue
-- la regla de ese archivo: las funciones nuevas de uso general se declaran
-- ahí, nunca en su propia migración).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Columnas de archivo en `prestamos`
-- ----------------------------------------------------------------------------
-- Ya están declaradas también en 010_consolidacion.sql (bloque EXCEPCIÓN, al
-- principio del archivo) porque `eliminar_libro()` las necesita y una
-- instalación desde cero aplica la 010 antes que esta migración. Repetidas
-- aquí porque esta es la migración que de verdad documenta cuándo y por qué
-- se agregaron — igual que se hizo con `dias_prestamo_override` en la 017.
alter table public.prestamos
  add column if not exists libro_titulo_archivado text;

alter table public.prestamos
  add column if not exists libro_autor_archivado text;

comment on column public.prestamos.libro_titulo_archivado is
  'Copia del título del libro, solo se llena cuando el libro se elimina del catálogo (ver eliminar_libro()). Mientras el libro exista, los reportes usan el título en vivo vía libro_id → libros.titulo.';
comment on column public.prestamos.libro_autor_archivado is
  'Igual que libro_titulo_archivado, pero el autor.';


-- ----------------------------------------------------------------------------
-- 2. La llave foránea deja de bloquear el borrado
-- ----------------------------------------------------------------------------
-- `on delete set null`, no `cascade`: al borrar el libro, el préstamo NO se
-- borra (sería perder el registro de que ese préstamo existió) — solo pierde
-- la referencia al libro, que ya no existe. `eliminar_libro()` archiva el
-- título y autor ANTES de este paso, así que el reporte histórico sigue
-- siendo legible aunque `libro_id` quede en null.
--
-- Nombre de la restricción confirmado en producción con `pg_get_constraintdef`
-- antes de escribir esto: `prestamos_libro_id_fkey` (el mismo nombre que
-- Postgres genera automáticamente para una referencia declarada inline, así
-- que también es el nombre correcto en una base nueva creada desde
-- pruebas/00_base_supabase.sql).
alter table public.prestamos
  drop constraint if exists prestamos_libro_id_fkey;

alter table public.prestamos
  add constraint prestamos_libro_id_fkey
  foreign key (libro_id) references public.libros(id) on delete set null;


-- ============================================================================
-- QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO
-- ============================================================================
--   -- Confirmar que la llave foránea quedó con on delete set null:
--   select conname, pg_get_constraintdef(oid)
--     from pg_constraint
--    where conrelid = 'public.prestamos'::regclass and contype = 'f';
--       → prestamos_libro_id_fkey: FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE SET NULL
--
--   -- eliminar_libro() existe y con el definer correcto:
--   select * from public.verificar_definiciones() where nombre = 'eliminar_libro';
--       → estado = 'Correcto'
--
--   -- Dentro de una transacción que se revierte: un libro con historial YA
--   -- DEVUELTO (sin préstamos activos) se puede eliminar, y el título queda
--   -- archivado en el préstamo:
--   begin;
--     select eliminar_libro(<id de un libro con historial devuelto>);
--     select libro_id, libro_titulo_archivado from prestamos where libro_titulo_archivado is not null;
--         → libro_id en null, libro_titulo_archivado con el título de antes
--   rollback;
--
--   -- Un libro CON un préstamo activo sigue rechazándose, con el motivo
--   -- correcto esta vez:
--   select eliminar_libro(<id de un libro con un préstamo activo>);
--       → error: "No se puede eliminar: tiene 1 préstamo(s) activo(s)."
--
--   -- La consolidación sigue intacta:
--   select * from public.verificar_definiciones() where estado <> 'Correcto';
--       → sin filas
-- ============================================================================
