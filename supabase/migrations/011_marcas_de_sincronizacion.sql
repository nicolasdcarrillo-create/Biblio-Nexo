-- ============================================================================
-- BiblioNexo — 011: Marcas de sincronización para el trabajo sin conexión
-- ============================================================================
-- Ejecutar DESPUÉS de la 010. Es idempotente: se puede correr dos veces.
--
-- El problema que resuelve: en Futrono la conexión se cae. Para que la
-- biblioteca pueda seguir atendiendo, el equipo del mesón necesita una copia
-- local del catálogo. Pero descargarlo entero cada vez que se abre el sistema
-- es inviable con el enlace que hay.
--
-- La solución es pedir solo lo que cambió: "dame los libros modificados desde
-- las 09:14 de hoy". Para eso hace falta que cada fila diga cuándo cambió por
-- última vez, y hoy no lo dice. `lectores` tiene `created_at` desde la 004, que
-- es la fecha de alta y nunca se mueve; `libros` no tiene ni eso.
--
-- Esto es un cambio de ESQUEMA (columnas, índices, disparadores), por eso va en
-- un archivo nuevo. La función `marcar_actualizacion()` que usan los
-- disparadores está en la 010, donde manda la regla de la consolidación.
--
-- Lo que este archivo NO hace, y hay que decidir aparte:
--
--   · No registra los borrados, y eso tiene consecuencias legales. Ver la nota
--     al pie: no es solo una molestia de catálogo.
--   · No decide QUÉ lectores se replican al equipo del mesón. Eso se define en
--     el código de la aplicación y tiene consecuencias legales: ver
--     CUMPLIMIENTO-LEGAL.md, secciones 4 y 9.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. La columna, en las dos tablas que se replican
-- ----------------------------------------------------------------------------
-- Se agrega en tres pasos en vez de uno solo con `not null default now()`.
-- Ese atajo pondría la misma hora a todas las filas existentes, y entonces la
-- primera sincronización tendría que traerlas todas de golpe. Rellenando desde
-- `created_at`, donde exista, la marca refleja algo real desde el primer día.
--
-- Los tres pasos son idempotentes: al reejecutar, ninguna fila tiene el valor
-- en nulo, así que el UPDATE no toca nada.

alter table public.libros   add column if not exists actualizado_en timestamptz;
alter table public.lectores add column if not exists actualizado_en timestamptz;

-- El rellenado pregunta antes de usar `created_at`, y no es exceso de cautela:
-- `lectores` la tiene desde la 004, pero `libros` NO la tiene en ninguna
-- migración. Aparece en `pruebas/00_base_supabase.sql`, que reconstruye lo que
-- se creó a mano desde la interfaz de Supabase, así que una consulta directa a
-- `libros.created_at` pasa en las pruebas y falla en producción.
--
-- Se usa `execute` a propósito: con SQL dinámico la columna se resuelve al
-- ejecutar, no al analizar el bloque, así que la rama no tomada nunca se mira.
do $relleno$
declare
  v_tabla text;
begin
  foreach v_tabla in array array['libros', 'lectores'] loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = v_tabla
        and column_name = 'created_at'
    ) then
      execute format(
        'update public.%I set actualizado_en = coalesce(created_at, now()) '
        'where actualizado_en is null', v_tabla);
    else
      execute format(
        'update public.%I set actualizado_en = now() '
        'where actualizado_en is null', v_tabla);
    end if;
  end loop;
end;
$relleno$;

alter table public.libros   alter column actualizado_en set default now();
alter table public.lectores alter column actualizado_en set default now();

alter table public.libros   alter column actualizado_en set not null;
alter table public.lectores alter column actualizado_en set not null;


-- ----------------------------------------------------------------------------
-- 2. Los índices
-- ----------------------------------------------------------------------------
-- Toda sincronización es la misma consulta: `where actualizado_en > $1`. Sin
-- índice, cada una recorre la tabla completa. Con el catálogo real cargado eso
-- se nota, y se nota justamente en el momento en que vuelve la conexión y todo
-- el mundo está esperando.

create index if not exists libros_actualizado_idx   on public.libros   (actualizado_en);
create index if not exists lectores_actualizado_idx on public.lectores (actualizado_en);


-- ----------------------------------------------------------------------------
-- 3. Los disparadores
-- ----------------------------------------------------------------------------
-- BEFORE, no AFTER: la función modifica la fila que se está por escribir, y eso
-- solo se puede hacer antes de guardarla.
--
-- Convive con los disparadores de auditoría, que son AFTER y quedan conectados
-- a estas mismas dos tablas. El orden importa y es el correcto: primero se pone
-- la marca, después la auditoría fotografía la fila ya marcada.
--
-- Efecto secundario aceptado: desde ahora, toda entrada de auditoría sobre
-- `libros` o `lectores` mostrará que `actualizado_en` cambió. Es ruido en el
-- historial, a cambio de que la sincronización sea confiable.

drop trigger if exists marcar_actualizacion_libros on public.libros;
create trigger marcar_actualizacion_libros
  before insert or update on public.libros
  for each row execute function public.marcar_actualizacion();

drop trigger if exists marcar_actualizacion_lectores on public.lectores;
create trigger marcar_actualizacion_lectores
  before insert or update on public.lectores
  for each row execute function public.marcar_actualizacion();


-- ----------------------------------------------------------------------------
-- 4. Para qué existe cada cosa, escrito en la propia base de datos
-- ----------------------------------------------------------------------------
comment on column public.libros.actualizado_en is
  'Última modificación de la fila. La mantiene el disparador marcar_actualizacion. '
  'La usa la sincronización del mesón para pedir solo lo que cambió. '
  'No la escribas a mano: el disparador la sobrescribe.';

comment on column public.lectores.actualizado_en is
  'Última modificación de la fila. La mantiene el disparador marcar_actualizacion. '
  'La usa la sincronización del mesón para pedir solo lo que cambió. '
  'No la escribas a mano: el disparador la sobrescribe.';


-- ============================================================================
-- QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO
-- ============================================================================
--   -- Las dos columnas existen y están llenas:
--   select count(*) filter (where actualizado_en is null) from public.libros;
--   select count(*) filter (where actualizado_en is null) from public.lectores;
--       → cero en ambos casos
--
--   -- El disparador mueve la marca cuando algo cambia de verdad:
--   select actualizado_en from public.libros where id = 1;
--   update public.libros set titulo = titulo || ' ' where id = 1;
--   select actualizado_en from public.libros where id = 1;
--       → la segunda consulta da una hora posterior
--
--   -- Y NO la mueve cuando no cambia nada:
--   select actualizado_en from public.libros where id = 1;
--   update public.libros set titulo = titulo where id = 1;
--   select actualizado_en from public.libros where id = 1;
--       → la misma hora en ambas
--
--   -- La consolidación sigue intacta:
--   select * from public.verificar_definiciones() where estado <> 'Correcto';
--       → sin filas
-- ============================================================================
--
-- NOTA AL PIE — los borrados, y por qué esto no puede quedar así
--
-- Una sincronización por marca temporal no puede transmitir una fila que ya no
-- existe: no queda nada que traiga la fecha. La forma habitual de resolverlo es
-- una tabla de lápidas donde un disparador AFTER DELETE anote el id y la hora,
-- y que el mesón consulte junto con los cambios.
--
-- Con los libros el efecto es una molestia: un ejemplar eliminado sobrevive en
-- la copia local hasta la siguiente descarga completa del catálogo.
--
-- Con los lectores NO es una molestia. Los lectores sí se borran de verdad:
-- `db.eliminarLector` hace un DELETE (js/modules/db.js), hay botón Eliminar para
-- el administrador en la vista de lectores, y la política "lectores borrado
-- admin" de la 008 lo permite. La anonimización convive con el borrado, no lo
-- reemplaza.
--
-- Entonces: si una persona ejerce su derecho de supresión y el administrador
-- borra su ficha, sus datos personales —nombre, RUT, correo, teléfono— siguen
-- en el disco del equipo del mesón, y nada los va a sacar de ahí. El servidor
-- cumplió la solicitud; el equipo del mesón no se enteró.
--
-- Por eso la tabla de lápidas no es opcional, es un requisito de cumplimiento,
-- y la purga del almacén local de la Fase 1.2 debe eliminar de la copia local a
-- todo lector que ya no esté en el servidor. Queda anotado como riesgo abierto
-- en CUMPLIMIENTO-LEGAL.md.
-- ============================================================================
