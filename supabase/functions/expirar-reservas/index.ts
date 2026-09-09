// Edge Function: expirar-reservas
//
// La dispara pg_cron cada hora (migración 023_expirar_reservas.sql, tarea
// "expirar-reservas-por-hora"), pero también puede invocarse manualmente
// para probarla — en ambos casos exige el secreto compartido en el header
// `x-cron-secret`. Mismo patrón que respaldo-automatico (018/respaldo-automatico).
//
// Qué hace:
//   1. Verifica el secreto (guardado en Vault, NUNCA la service_role key,
//      y PROPIO de esta tarea — no el de respaldo-automatico) contra el que
//      mandó quien llama.
//   2. Llama a public.expirar_reservas_vencidas() (010_consolidacion.sql)
//      con la service_role key: marca 'expirada' cada reserva 'apartada'
//      cuyo plazo de retiro venció, y para cada una pasa el ejemplar al
//      siguiente en la fila de espera o lo devuelve a stock si nadie más
//      está esperando.
//
// No hay tabla de bitácora propia que escribir aquí: cada fila que cambia
// de estado queda registrada en public.reservas mismo (ver 023 para el
// porqué). La service_role key sale EXCLUSIVAMENTE de
// Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), la variable que Supabase
// inyecta automáticamente en el runtime — nunca se pide, nunca se
// hardcodea, nunca se expone al cliente.

import { createClient } from "jsr:@supabase/supabase-js@2";

function json(cuerpo: unknown, estado: number): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey);

  // ── Autenticación: secreto compartido guardado en Vault ──────────────────
  // Igual que respaldo-automatico, pero con SU PROPIO secreto
  // (cron_reservas_secret, no cron_respaldo_secret): así una rotación o una
  // filtración de uno no obliga a tocar el otro.
  const secretoRecibido = req.headers.get("x-cron-secret") ?? "";
  const { data: coincide, error: errSecreto } = await supabase.rpc("verificar_secreto_cron_reservas", {
    p_secreto: secretoRecibido,
  });

  if (errSecreto || coincide !== true) {
    return json({ error: "No autorizado." }, 401);
  }

  try {
    const { data: total, error: errExpirar } = await supabase.rpc("expirar_reservas_vencidas");
    if (errExpirar) throw new Error(errExpirar.message);

    return json({ ok: true, expiradas: total ?? 0 }, 200);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: mensaje }, 500);
  }
});
