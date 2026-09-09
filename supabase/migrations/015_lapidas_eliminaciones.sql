-- ============================================================================
-- BiblioNexo — 015: Lápidas para las eliminaciones (Fase 1.2, requisito legal)
-- ============================================================================
-- Ejecutar DESPUÉS de la 014. Es idempotente: se puede correr dos veces.
--
-- Por qué existe este archivo: CUMPLIMIENTO-LEGAL.md, sección "9 bis", deja
-- anotado un riesgo abierto exactamente en este punto: para que el mesón
-- pueda atender sin conexión hace falta una copia local (IndexedDB) de parte
-- del catálogo y del padrón de lectores. La sincronización por marca temporal
-- de la migración 011 transmite altas y modificaciones, pero NO puede
-- transmitir un borrado — la fila ya no existe, no queda nada que traiga la
-- fecha.
--
-- Con lectores esto no es una molestia menor: los lectores se borran de
-- verdad (`db.eliminarLector`, política "lectores borrado admin" de la 008).
-- Si una persona ejerce su derecho de supresión y el administrador borra su
-- ficha, sin esta tabla su nombre, RUT, correo y teléfono seguirían en el
-- disco del equipo del mesón indefinidamente — el municipio habría
-- respondido la solicitud sin dejar de tratar el dato.
--
-- La solución, ya elegida en la 011: una tabla de lápidas donde un disparador
-- AFTER DELETE anota qué se borró y cuándo, y que el mesón consulta junto con
-- los cambios en cada sincronización, para purgar de la copia local a todo lo
-- que ya no esté en el servidor. Este archivo la crea, tanto para `lectores`
-- (obligatorio, es el requisito legal) como para `libros` (opcional, evita
-- que un ejemplar eliminado sobreviva en el catálogo local hasta la próxima
-- descarga completa).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. La tabla
-- ----------------------------------------------------------------------------
-- Una sola tabla para ambos orígenes, distinguidos por "tabla" — no hace falta
-- una tabla por cada una: lo único que se necesita para purgar la copia local
-- es saber QUÉ se borró, DE DÓNDE y CUÁNDO. Nunca se guarda ningún dato de la
-- fila borrada, solo su identificador: la lápida no reintroduce el problema
-- que resuelve.

create table if not exists public.elementos_eliminados (
  tabla        text        not null check (tabla in ('libros', 'lectores')),
  id           bigint      not null,
  eliminado_en timestamptz not null default now(),
  primary key (tabla, id)
);

comment on table public.elementos_eliminados is
  'Lápidas: qué fila se borró, de qué tabla y cuándo. Las llena solo el '
  'disparador registrar_eliminacion(); nunca se escribe a mano. La usa la '
  'sincronización del mesón (Fase 1.2) para purgar de la copia local en '
  'IndexedDB todo lo que ya no exista en el servidor — obligatorio para '
  'lectores, por el derecho de supresión (CUMPLIMIENTO-LEGAL.md, sección 9 bis).';

create index if not exists elementos_eliminados_por_fecha
  on public.elementos_eliminados (tabla, eliminado_en);

alter table public.elementos_eliminados enable row level security;

-- Sin límite de crecimiento por ahora: a las cantidades de esta biblioteca
-- (cientos de lectores, no millones), una lápida por fila borrada durante
-- años no es un problema real de espacio. Si algún día lo fuera, se purgan
-- las lápidas con más de N días — pero no antes de que el mesón que estuvo
-- más tiempo sin conectarse alcance a sincronizar, o esa purga volvería a
-- abrir el mismo problema que esta tabla resuelve.


-- ----------------------------------------------------------------------------
-- 2. El disparador
-- ----------------------------------------------------------------------------
-- AFTER DELETE, no BEFORE: hace falta que la fila ya no exista para que la
-- lápida sea la verdad. `security definer` porque quien borra un lector es un
-- administrador con permiso para eso, pero no necesariamente con permiso de
-- ESCRITURA directa sobre esta tabla — igual que con la auditoría (migración
-- 005), la lápida se registra pase lo que pase, sin depender de qué grants
-- tenga la sesión que hizo el borrado.
--
-- `on conflict do nothing`: aunque en la práctica un id borrado no vuelve a
-- existir (las tablas usan `generated always as identity`), no cuesta nada
-- ser explícito sobre qué pasa si la lápida ya estuviera puesta.
--
-- Igual que la auditoría: si esto llegara a fallar, se avisa con un WARNING
-- y el borrado real de todas formas se completa. Una lápida que no se pudo
-- escribir es un problema de sincronización a resolver; nunca un motivo para
-- impedir que el administrador borre lo que tiene derecho a borrar.

create or replace function public.registrar_eliminacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.elementos_eliminados (tabla, id, eliminado_en)
    values (tg_table_name, old.id, now())
    on conflict (tabla, id) do update set eliminado_en = excluded.eliminado_en;
  exception when others then
    raise warning 'No se pudo registrar la lápida de % en %: %', old.id, tg_table_name, sqlerrm;
  end;

  return old;
end;
$$;

drop trigger if exists lapida_libros on public.libros;
create trigger lapida_libros
  after delete on public.libros
  for each row execute function public.registrar_eliminacion();

drop trigger if exists lapida_lectores on public.lectores;
create trigger lapida_lectores
  after delete on public.lectores
  for each row execute function public.registrar_eliminacion();


-- ----------------------------------------------------------------------------
-- 3. Lectura: el mismo criterio que ya protege a "lectores" y "libros"
-- ----------------------------------------------------------------------------
-- Sin sesión de personal, nadie lee esto: aunque una lápida no trae ningún
-- dato personal (solo un id numérico y una fecha), los ids son enumerables y
-- no hay motivo para exponer siquiera el ritmo de altas y bajas de la
-- biblioteca a quien no tiene sesión. No se otorga insert/update/delete a
-- "authenticated": la única vía de escritura es el disparador, con sus
-- propios privilegios de "security definer".

drop policy if exists "elementos_eliminados lectura personal" on public.elementos_eliminados;
create policy "elementos_eliminados lectura personal" on public.elementos_eliminados
  for select to authenticated using (public.es_personal());

-- Se otorga a "anon" igual que a "libros" y "lectores" (ver el esquema base):
-- el grant de tabla no es la protección real, es la RLS de arriba. Sin
-- sesión, la política "to authenticated" simplemente no aplica y la consulta
-- vuelve vacía — ni siquiera un error que confirme que la tabla existe.
grant select on public.elementos_eliminados to anon, authenticated;


-- ============================================================================
-- QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO
-- ============================================================================
--   -- Borrar un lector de prueba dentro de una transacción que se revierte,
--   -- y comprobar que la lápida quedó puesta:
--   begin;
--     delete from public.lectores where id = <id de prueba>;
--     select * from public.elementos_eliminados where tabla = 'lectores' and id = <id de prueba>;
--         → una fila, con eliminado_en de hace unos segundos
--   rollback;
--
--   -- La consolidación sigue intacta (esta migración no toca ninguna función
--   -- del manifiesto):
--   select * from public.verificar_definiciones() where estado <> 'Correcto';
--       → sin filas
-- ============================================================================
