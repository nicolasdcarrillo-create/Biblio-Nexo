-- ============================================================================
-- 017: Plazo de préstamo configurable por libro
-- ============================================================================
--
-- Hasta ahora `dias_prestamo` era un único parámetro global (tabla
-- `parametros`, leído por `parametro_int('dias_prestamo', 7)`): todo el
-- catálogo se prestaba por el mismo número de días, sin distinguir una
-- revista de un libro, ni permitir que material de referencia no circule.
--
-- Esta migración agrega UNA columna nueva a `libros`, no una tabla de tipos
-- de material aparte — se evaluó y se descartó esa alternativa porque el
-- catálogo real no tiene (todavía) una taxonomía de tipos que lo justifique;
-- una columna opcional por libro resuelve el caso real sin imponer una
-- categorización que nadie pidió.
--
-- Semántica de `dias_prestamo_override`:
--   NULL → usa el parámetro global `dias_prestamo` (comportamiento actual,
--          sin cambios para el 100% del catálogo que no fija nada distinto).
--   0    → material de referencia: no circula. `prestar_libro()` rechaza el
--          préstamo con un mensaje claro en vez de un error genérico.
--   > 0  → plazo propio de este libro, en días, reemplazando al global.
--
-- Los cambios de comportamiento en `prestar_libro()`, `renovar_prestamo()` y
-- `buscar_libros()` que leen/devuelven esta columna van editados
-- directamente en `010_consolidacion.sql`, según la regla ya establecida en
-- este proyecto ("los cambios a funciones van en la 010, nunca en un archivo
-- nuevo"). Como esas tres funciones necesitan la columna para existir, la
-- propia 010_consolidacion.sql declara esta misma sentencia (idempotente)
-- una segunda vez, ANTES de esas funciones — así una instalación desde cero
-- no falla al crear `buscar_libros()` (función SQL, validada contra el
-- catálogo al crearse) por faltar una columna que, en el orden de archivos,
-- todavía no se había agregado. Ver la nota al principio de
-- `010_consolidacion.sql`, sección "EXCEPCIÓN: una columna...".
--
-- Esta migración es la que documenta, con su propio número, cuándo y por qué
-- se agregó la columna — es la fuente de verdad histórica del cambio de
-- esquema, aunque `010_consolidacion.sql` la repita para poder aplicarse
-- sola. Aplicarla dos veces no hace nada la segunda vez.
-- ============================================================================

alter table public.libros
  add column if not exists dias_prestamo_override integer null;

alter table public.libros
  drop constraint if exists libros_dias_prestamo_override_check;

alter table public.libros
  add constraint libros_dias_prestamo_override_check
  check (dias_prestamo_override is null or dias_prestamo_override >= 0);

comment on column public.libros.dias_prestamo_override is
  'Plazo de préstamo en días específico de este libro. NULL = usa el parámetro global dias_prestamo. 0 = material de referencia, no circula.';
