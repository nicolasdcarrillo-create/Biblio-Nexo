-- ============================================================================
-- 018: Respaldo automático — extensiones, bitácora y tarea programada
-- ============================================================================
--
-- Hasta ahora el respaldo era 100% manual: alguien entraba al panel de
-- Supabase y apretaba el botón (ver `pendientes-checklist.md`, "Asignar,
-- por nombre, quién aprieta el botón de respaldo"). Esta migración prepara
-- el lado de base de datos de la automatización real:
--
--   1. Habilita `pg_cron` (programa la tarea) y `pg_net` (permite que esa
--      tarea llame por HTTP a un Edge Function) — ambas ya disponibles en
--      este proyecto Supabase, solo faltaba activarlas.
--   2. Crea `public.respaldos_log`, una bitácora de cada corrida (éxito o
--      falla, archivo generado, tamaño) que llena el Edge Function
--      `respaldo-automatico` — nunca se escribe a mano.
--   3. Crea un secreto ALEATORIO nuevo en Vault (`cron_respaldo_secret`),
--      generado aquí mismo con `gen_random_bytes`. Esto NO es ni toca la
--      service_role key del proyecto — es un secreto propio, exclusivo para
--      que `pg_cron` pruebe su identidad ante el Edge Function sin exponer
--      ninguna credencial más sensible.
--   4. Crea `public.verificar_secreto_cron()`, una función puente: el
--      esquema `vault` no está expuesto por PostgREST (a propósito), así que
--      el Edge Function no puede leer `vault.decrypted_secrets` directo por
--      la API REST — probado en vivo, devolvía 401 siempre. Esta función
--      SECURITY DEFINER es el puente: el Edge Function la llama por RPC (con
--      la service_role key) y ella sí puede leer el secreto desde dentro de
--      la base de datos.
--   5. Programa la tarea `respaldo-automatico-diario`: todos los días a las
--      07:00 UTC (~03:00-04:00 hora de Chile, según horario de verano),
--      llama al Edge Function por HTTP con ese secreto en el header
--      `x-cron-secret`.
--
-- El bucket de Storage `respaldos` y el propio Edge Function se crean fuera
-- de las migraciones (Storage Admin API / `deploy_edge_function`), porque no
-- son objetos de esquema de Postgres.
--
-- Los pasos 1, 3 y 5 dependen de piezas propias de Supabase (`pg_cron`,
-- `pg_net`, el esquema `vault`) que no existen en un Postgres genérico —
-- entre ellos, el usado por `pruebas/probar-migraciones.py` para revisar que
-- las migraciones se puedan aplicar en orden desde cero. Van cada uno en su
-- propio bloque `do $$ ... exception when others then raise notice ... $$`
-- para que, si faltan, la migración avise y siga en vez de abortar: en la
-- producción real de este proyecto (Supabase) las tres piezas existen y todo
-- queda funcionando; en un Postgres sin ellas, `public.respaldos_log` y
-- `public.verificar_secreto_cron()` igual quedan creadas, listas para cuando
-- sí estén disponibles.
--
-- Idempotente: puede ejecutarse más de una vez sin duplicar el secreto ni la
-- tarea programada.
-- ============================================================================

do $$
begin
  execute 'create extension if not exists pg_cron';
exception when others then
  raise notice 'pg_cron no está disponible en este entorno (%). El respaldo automático no quedará programado aquí; en producción (Supabase) sí está disponible.', sqlerrm;
end;
$$;

do $$
begin
  execute 'create extension if not exists pg_net';
exception when others then
  raise notice 'pg_net no está disponible en este entorno (%). El respaldo automático no podrá llamar al Edge Function aquí; en producción (Supabase) sí está disponible.', sqlerrm;
end;
$$;

-- ── Bitácora de respaldos ──────────────────────────────────────────────────
create table if not exists public.respaldos_log (
  id bigint generated always as identity primary key,
  ejecutado_en timestamptz not null default now(),
  ok boolean not null,
  archivo text,
  bytes integer,
  mensaje text
);

comment on table public.respaldos_log is
  'Bitácora de cada corrida del respaldo automático. La llena únicamente el Edge Function respaldo-automatico (con la service_role key, que evita RLS); nunca se escribe a mano.';

alter table public.respaldos_log enable row level security;

drop policy if exists "admin_lee_respaldos_log" on public.respaldos_log;
create policy "admin_lee_respaldos_log"
  on public.respaldos_log
  for select
  to authenticated
  using (public.es_admin());

-- Sin política de insert/update/delete para `authenticated` a propósito:
-- solo el Edge Function (service_role, que salta RLS) escribe aquí.

-- ── Secreto compartido para que pg_cron autentique su llamada ─────────────
-- Un secreto NUEVO y aleatorio, no la service_role key del proyecto.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cron_respaldo_secret') then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'cron_respaldo_secret',
      'Secreto compartido entre pg_cron y el Edge Function respaldo-automatico. No es la service_role key.'
    );
  end if;
exception when others then
  raise notice 'No se pudo crear el secreto en Vault en este entorno (%). El esquema vault es propio de Supabase; en producción sí está disponible.', sqlerrm;
end;
$$;

-- ── Función puente para verificar el secreto desde el Edge Function ───────
-- Se crea siempre, aunque el esquema `vault` no exista todavía en este
-- entorno: PL/pgSQL no valida los nombres que usa el cuerpo de la función
-- contra el catálogo al crearla, solo al ejecutarla — así que definirla aquí
-- es seguro incluso sin `vault`, y ya queda lista para cuando sí esté.
drop function if exists public.verificar_secreto_cron(text);
create or replace function public.verificar_secreto_cron(p_secreto text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guardado text;
begin
  select decrypted_secret into v_guardado
  from vault.decrypted_secrets
  where name = 'cron_respaldo_secret';

  return v_guardado is not null and v_guardado = p_secreto;
end;
$$;

-- Solo el service_role (el Edge Function) debe poder llamarla: nunca se
-- otorga a authenticated ni a anon, para que nadie pueda usarla como
-- oráculo de fuerza bruta sobre el secreto.
revoke all on function public.verificar_secreto_cron(text) from public;
revoke all on function public.verificar_secreto_cron(text) from authenticated;
revoke all on function public.verificar_secreto_cron(text) from anon;

-- ── Tarea programada ────────────────────────────────────────────────────────
do $$
begin
  perform cron.schedule(
    'respaldo-automatico-diario',
    '0 7 * * *',
    $cron$
    select net.http_post(
      url := 'https://vcngmgzxjoorjhcgqzpk.supabase.co/functions/v1/respaldo-automatico',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_respaldo_secret')
      ),
      body := '{}'::jsonb
    );
    $cron$
  );
exception when others then
  raise notice 'No se pudo programar la tarea de respaldo automático en este entorno (%). Revisa que pg_cron y pg_net estén habilitados; en producción (Supabase) lo están.', sqlerrm;
end;
$$;
