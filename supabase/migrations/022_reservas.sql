-- ============================================================================
-- 022: Reservas de libros
-- ============================================================================
-- Poder reservar un título sin ejemplares disponibles, con lista de espera.
--
-- El diseño:
--
--   · Una fila por reserva, con estado: 'activa' (en la fila de espera),
--     'apartada' (se liberó un ejemplar y está guardado para esta persona,
--     con plazo para retirarlo), 'cumplida' (se convirtió en préstamo),
--     'cancelada' o 'expirada' (el plazo de retiro venció sin que lo
--     retiraran).
--   · Cuando se devuelve un libro con fila de espera, `devolver_prestamo()`
--     (010_consolidacion.sql) NO libera el ejemplar a cualquiera: la reserva
--     más antigua pasa a 'apartada' y el ejemplar se queda fuera de `stock`
--     hasta que se retire o venza el plazo. Así `libros.stock` sigue
--     significando exactamente lo mismo que siempre — "disponible para
--     cualquiera ahora mismo" — sin tener que tocar `buscar_libros()`,
--     `consultar_libro()` ni ninguna otra consulta que ya lo lee.
--   · Esto agrega un tercer estado al balance de ejemplares, que antes solo
--     distinguía "en stock" de "prestado". `revisar_inventario()` y
--     `corregir_inventario()` se actualizan para conocerlo (ver
--     010_consolidacion.sql) — si no, cualquier ejemplar apartado se vería
--     como una discrepancia de inventario, y "Corregir" lo liberaría a
--     cualquiera sin querer, rompiendo la reserva en silencio.
--
-- Esta migración solo crea la TABLA y el parámetro. Las funciones que la
-- usan viven, como todas, en 010_consolidacion.sql — se agregaron ahí aunque
-- esta tabla todavía no existiera, porque PL/pgSQL no valida los objetos
-- referenciados en el cuerpo de una función hasta que se ejecuta, no cuando
-- se crea (mismo motivo documentado en 014_enlaces_escaneo_remoto.sql).
create table if not exists public.reservas (
  id                bigint generated always as identity primary key,
  libro_id          bigint not null references public.libros(id) on delete cascade,
  lector_id         bigint not null references public.lectores(id) on delete cascade,
  estado            text not null default 'activa'
                       check (estado in ('activa', 'apartada', 'cumplida', 'cancelada', 'expirada')),
  creado_en         timestamptz not null default now(),
  apartada_en       timestamptz,
  vence_apartado_en timestamptz,
  atendida_en       timestamptz,
  atendida_por      uuid references auth.users(id) on delete set null
);

comment on table public.reservas is
  'Lista de espera por título. Una fila "apartada" representa un ejemplar '
  'físicamente en la biblioteca pero descontado de libros.stock mientras '
  'espera que lo retire quien lo reservó.';

-- No puede haber dos reservas del mismo lector para el mismo libro
-- simultáneamente vigentes (activa o apartada) — evita que alguien acumule
-- posiciones duplicadas en la misma fila.
create unique index if not exists reservas_lector_libro_vigente_idx
  on public.reservas (libro_id, lector_id)
  where estado in ('activa', 'apartada');

-- Para encontrar rápido "la reserva activa más antigua de este libro"
-- (siguiente en la fila) y "las apartadas cuyo plazo ya venció".
create index if not exists reservas_libro_estado_creado_idx
  on public.reservas (libro_id, estado, creado_en);
create index if not exists reservas_vence_apartado_idx
  on public.reservas (vence_apartado_en)
  where estado = 'apartada';

alter table public.reservas enable row level security;
-- Sin políticas a propósito, mismo patrón que enlaces_escaneo_remoto: todo
-- el acceso pasa por reservar_libro, cancelar_reserva, retirar_reserva,
-- listar_reservas y expirar_reservas_vencidas (010_consolidacion.sql), que
-- son SECURITY DEFINER y validan por su cuenta quién puede hacer qué.

insert into public.parametros (clave, valor, descripcion) values
  ('horas_retiro_reserva', '48', 'Horas que se guarda un ejemplar apartado antes de pasar al siguiente de la fila de espera')
on conflict (clave) do nothing;
