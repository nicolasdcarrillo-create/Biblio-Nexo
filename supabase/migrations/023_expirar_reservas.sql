-- ============================================================================
-- 023: Expiración automática de reservas apartadas
-- ============================================================================
-- Un ejemplar "apartado" (022_reservas.sql) se guarda para quien encabeza la
-- fila de espera durante `horas_retiro_reserva` (48 por omisión). Si esa
-- persona no lo retira a tiempo, alguien tiene que liberarlo — o pasarlo al
-- siguiente en la fila, o devolverlo a stock general — sin que el personal
-- tenga que acordarse de revisarlo a mano todos los días.
--
-- `expirar_reservas_vencidas()` (010_consolidacion.sql) ya hace el trabajo;
-- esta migración solo agrega el disparador automático, con el MISMO patrón
-- que 018_respaldo_automatico.sql: un secreto propio en Vault, una función
-- puente para verificarlo, y una tarea de pg_cron que llama al Edge Function
-- por HTTP con ese secreto en un header.
--
-- Un secreto PROPIO y NUEVO, no `cron_respaldo_secret` de la 018: así, si
-- alguno de los dos algún día se filtra o hay que rotarlo, el otro cron no
-- se ve afectado — cada tarea automática se autentica con su propio secreto,
-- sin compartir superficie.
--
-- Sin tabla de bitácora propia (a diferencia de `respaldos_log` en la 018):
-- cada reserva que vence ya queda para siempre en `public.reservas` con
-- `estado = 'expirada'` y `atendida_en` con la fecha — esa tabla ES el
-- registro de lo que pasó, no hace falta duplicarlo en otro lado.
--
-- ── Secreto compartido para que pg_cron autentique su llamada ─────────────
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cron_reservas_secret') then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'cron_reservas_secret',
      'Secreto compartido entre pg_cron y el Edge Function expirar-reservas. No es la service_role key.'
    );
  end if;
exception when others then
  raise notice 'No se pudo crear el secreto en Vault en este entorno (%). El esquema vault es propio de Supabase; en producción sí está disponible.', sqlerrm;
end;
$$;

-- ── Función puente para verificar el secreto desde el Edge Function ───────
-- Se crea siempre, aunque el esquema `vault` no exista todavía en este
-- entorno: PL/pgSQL no valida los nombres que usa el cuerpo de la función
-- contra el catálogo al crearla, solo al ejecutarla (mismo motivo
-- documentado en 014_enlaces_escaneo_remoto.sql y en la sección RESERVAS de
-- 010_consolidacion.sql).
drop function if exists public.verificar_secreto_cron_reservas(text);
create or replace function public.verificar_secreto_cron_reservas(p_secreto text)
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
  where name = 'cron_reservas_secret';

  return v_guardado is not null and v_guardado = p_secreto;
end;
$$;

-- Solo el service_role (el Edge Function) debe poder llamarla: nunca se
-- otorga a authenticated ni a anon, para que nadie pueda usarla como
-- oráculo de fuerza bruta sobre el secreto.
revoke all on function public.verificar_secreto_cron_reservas(text) from public;
revoke all on function public.verificar_secreto_cron_reservas(text) from authenticated;
revoke all on function public.verificar_secreto_cron_reservas(text) from anon;

-- ── Tarea programada ────────────────────────────────────────────────────────
-- Cada hora, no una vez al día como el respaldo: el plazo de retiro se mide
-- en horas (`horas_retiro_reserva`, 48 por omisión) y alguien más podría
-- estar esperando ese mismo ejemplar — revisarlo solo una vez al día dejaría
-- un ejemplar apartado sin uso hasta 23 horas de más después de vencido.
do $$
begin
  perform cron.schedule(
    'expirar-reservas-por-hora',
    '0 * * * *',
    $cron$
    select net.http_post(
      url := 'https://vcngmgzxjoorjhcgqzpk.supabase.co/functions/v1/expirar-reservas',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_reservas_secret')
      ),
      body := '{}'::jsonb
    );
    $cron$
  );
exception when others then
  raise notice 'No se pudo programar la tarea de expiración de reservas en este entorno (%). Revisa que pg_cron y pg_net estén habilitados; en producción (Supabase) lo están.', sqlerrm;
end;
$$;
