-- ============================================================================
-- BiblioNexo — 021: Papelera de libros eliminados (deshacer un borrado)
-- ============================================================================
-- Ejecutar DESPUÉS de la 020. Es idempotente: se puede correr dos veces.
--
-- Pedido que siguió al de la 020 ("permitir eliminar si no hay préstamos
-- activos"): poder deshacer un `eliminar_libro()` hecho sin querer, desde
-- una pestaña nueva "Eliminados" en Administración.
--
-- Este archivo NO agrega ninguna tabla ni columna nueva — no hizo falta.
-- `registrar_auditoria()` (migración 005) ya guarda una foto completa de
-- cada libro (`to_jsonb(old)`, con TODAS sus columnas) justo antes de
-- borrarlo, en `auditoria.datos_antes`, porque `libros` tiene el disparador
-- de auditoría conectado desde siempre (mismo motivo por el que ya se podía
-- reconstruir el "antes" de cualquier UPDATE). Las dos funciones nuevas
-- (`listar_libros_eliminados()` y `restaurar_libro()`, declaradas en
-- `010_consolidacion.sql`, no aquí — sigue la regla de ese archivo) solo
-- leen esa foto para reconstruir el libro.
--
-- Lo único que agrega este archivo es un índice: sin él,
-- `listar_libros_eliminados()` y `restaurar_libro()` recorrerían toda
-- `auditoria` para encontrar las filas de `libros`/`prestamos` que
-- necesitan. A la escala de esta biblioteca (cientos de movimientos) no
-- sería un problema real todavía, pero `auditoria` solo crece — nunca se
-- purga — así que conviene resolverlo ahora.
-- ============================================================================


create index if not exists auditoria_tabla_registro_idx
  on public.auditoria (tabla, registro_id, created_at desc);

comment on index public.auditoria_tabla_registro_idx is
  'Soporta listar_libros_eliminados() y restaurar_libro() (010_consolidacion.sql, '
  '021_papelera_libros.sql): buscan por (tabla, registro_id) y necesitan la más '
  'reciente primero.';


-- ============================================================================
-- QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO
-- ============================================================================
--   -- El índice quedó creado:
--   select indexname from pg_indexes
--    where tablename = 'auditoria' and indexname = 'auditoria_tabla_registro_idx';
--       → una fila
--
--   -- listar_libros_eliminados() y restaurar_libro() existen y con el
--   -- definer correcto:
--   select * from public.verificar_definiciones()
--    where nombre in ('listar_libros_eliminados', 'restaurar_libro');
--       → dos filas, estado = 'Correcto'
--
--   -- Dentro de una transacción que se revierte: eliminar un libro con
--   -- historial ya devuelto y volver a restaurarlo deja todo como estaba,
--   -- incluyendo el préstamo reenganchado:
--   begin;
--     select eliminar_libro(<id de un libro con historial devuelto>);
--     select * from listar_libros_eliminados(); -- debe aparecer
--     select restaurar_libro(<el mismo id>);
--     select libro_id, libro_titulo_archivado from prestamos
--      where id in (select id from prestamos where libro_id = <el mismo id>);
--         → libro_id de vuelta al valor original, libro_titulo_archivado en null
--     select * from listar_libros_eliminados(); -- ya no debe aparecer
--   rollback;
--
--   -- La consolidación sigue intacta:
--   select * from public.verificar_definiciones() where estado <> 'Correcto';
--       → sin filas
-- ============================================================================
