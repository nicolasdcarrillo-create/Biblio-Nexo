-- ============================================================================
-- 014: Enlaces de escaneo remoto
-- ============================================================================
-- Tabla para el enlace de escaneo remoto sin sesión: un token de un solo
-- objetivo (agregar o reponer libros al catálogo), con vencimiento y
-- revocación, que NO requiere que quien lo abre inicie sesión en el sistema.
--
-- Por qué existe: hasta ahora, escanear desde el celular exigía iniciar
-- sesión con una cuenta del sistema (ver ui-base.js, showQrRemotoModal). Eso
-- es correcto para el personal, pero no sirve para prestarle el celular a
-- quien no tiene cuenta —un voluntario, un proveedor que trae libros nuevos—
-- sin entregarle una contraseña.
--
-- El diseño:
--
--   · El token NUNCA se guarda en texto plano, solo su huella SHA-256
--     (`token_hash`). Quien tenga acceso de lectura a esta tabla —incluido
--     un volcado completo de la base— no puede reconstruir un enlace válido.
--   · Vence solo (por defecto a las 4 horas, máximo 24 — ver
--     crear_enlace_escaneo en 010_consolidacion.sql) y se puede revocar
--     antes, desde Administración → Enlaces remotos, o por quien lo creó.
--   · Angosto a propósito: solo permite AGREGAR o REPONER libros (ver
--     agregar_libro_remoto). No da acceso a préstamos, lectores, ni a
--     ninguna otra función del sistema — aunque el enlace se filtrara, lo
--     máximo que permite es escribir entradas de catálogo.
--
-- Esta migración solo crea la TABLA. Las funciones que la usan viven, como
-- todas, en 010_consolidacion.sql — se agregaron ahí aunque esta tabla
-- todavía no existiera, porque PL/pgSQL no valida los objetos referenciados
-- en el cuerpo de una función hasta que se ejecuta, no cuando se crea. Es el
-- mismo motivo por el que 011, 012 y 013 pueden agregar columnas y políticas
-- que la 010 ya da por hechas.
create table if not exists public.enlaces_escaneo_remoto (
  id                bigint generated always as identity primary key,
  token_hash        text not null unique,
  creado_por        uuid references auth.users(id) on delete set null,
  creado_por_email  text not null,
  creado_en         timestamptz not null default now(),
  expira_en         timestamptz not null,
  revocado          boolean not null default false,
  revocado_en       timestamptz,
  usos              int not null default 0,
  ultimo_uso_en     timestamptz
);

comment on table public.enlaces_escaneo_remoto is
  'Enlaces temporales de escaneo remoto sin sesión. Solo el token en texto '
  'plano prueba identidad; aquí se guarda únicamente su huella SHA-256.';

-- Para listar_enlaces_escaneo() (más frecuente que buscar por token) y para
-- que revocar_enlace_escaneo() encuentre rápido los enlaces aún vigentes.
create index if not exists enlaces_escaneo_remoto_creado_en_idx
  on public.enlaces_escaneo_remoto (creado_en desc);

alter table public.enlaces_escaneo_remoto enable row level security;
-- Sin políticas a propósito: ni siquiera `authenticated` tiene acceso directo
-- a la tabla. Todo el acceso pasa por crear_enlace_escaneo,
-- validar_enlace_escaneo, agregar_libro_remoto, listar_enlaces_escaneo y
-- revocar_enlace_escaneo (010_consolidacion.sql), que son SECURITY DEFINER y
-- validan por su cuenta quién puede hacer qué. Con RLS activada y ninguna
-- política, ni siquiera un GRANT directo por error dejaría pasar nada.
