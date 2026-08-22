// Edge Function: respaldo-automatico
//
// Reemplaza el "botón de respaldo de Supabase" que hasta ahora había que
// apretar a mano (ver pendientes-checklist.md). La dispara pg_cron todos los
// días (migración 018_respaldo_automatico.sql, tarea
// "respaldo-automatico-diario"), pero también puede invocarse manualmente
// para probarla — en ambos casos exige el secreto compartido en el header
// `x-cron-secret`.
//
// Qué hace:
//   1. Verifica el secreto (guardado en Vault, NUNCA la service_role key)
//      contra el que mandó quien llama.
//   2. Lee el contenido completo de las tablas del negocio.
//   3. Sube un JSON con fecha en el nombre al bucket de Storage "respaldos".
//   4. Registra el resultado (éxito o falla) en public.respaldos_log — la
//      única escritora de esa tabla, porque usa la service_role key que el
//      runtime de Edge Functions inyecta solo, nunca a mano ni de un secreto
//      pedido a quien use la app.
//
// La service_role key sale EXCLUSIVAMENTE de Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
// la variable que Supabase inyecta automáticamente en el runtime — nunca se
// pide, nunca se hardcodea, nunca se expone al cliente.

import { createClient } from "jsr:@supabase/supabase-js@2";

const TABLAS_A_RESPALDAR = [
  "usuarios",
  "libros",
  "lectores",
  "prestamos",
  "parametros",
  "auditoria",
  "errores",
  "enlaces_escaneo_remoto",
  "elementos_eliminados",
];

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
  // No es la service_role key. Es un secreto propio, generado al azar en la
  // migración 018, exclusivo para que pg_cron pruebe su identidad aquí.
  //
  // El esquema `vault` no está expuesto por PostgREST (por diseño, para que
  // nadie lo lea por la API REST), así que la comparación pasa por
  // `public.verificar_secreto_cron()`, una función SECURITY DEFINER sin
  // permisos de ejecución para `authenticated`/`anon` — solo el service_role
  // (este mismo Edge Function) puede llamarla.
  const secretoRecibido = req.headers.get("x-cron-secret") ?? "";
  const { data: coincide, error: errSecreto } = await supabase.rpc("verificar_secreto_cron", {
    p_secreto: secretoRecibido,
  });

  if (errSecreto || coincide !== true) {
    return json({ error: "No autorizado." }, 401);
  }

  const inicio = new Date();

  try {
    const respaldo: Record<string, unknown> = {};
    for (const tabla of TABLAS_A_RESPALDAR) {
      const { data, error } = await supabase.from(tabla).select("*");
      if (error) throw new Error(`Tabla ${tabla}: ${error.message}`);
      respaldo[tabla] = data;
    }

    const contenido = JSON.stringify({
      generado_en: inicio.toISOString(),
      tablas: respaldo,
    });

    const nombreArchivo = `respaldo-${inicio.toISOString().replace(/[:.]/g, "-")}.json`;
    const bytes = new TextEncoder().encode(contenido);

    const { error: errSubida } = await supabase.storage
      .from("respaldos")
      .upload(nombreArchivo, bytes, { contentType: "application/json" });
    if (errSubida) throw new Error(`Subida a Storage: ${errSubida.message}`);

    await supabase.from("respaldos_log").insert({
      ok: true,
      archivo: nombreArchivo,
      bytes: bytes.length,
      mensaje: null,
    });

    return json({ ok: true, archivo: nombreArchivo, bytes: bytes.length }, 200);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    await supabase.from("respaldos_log").insert({
      ok: false,
      archivo: null,
      bytes: null,
      mensaje,
    });
    return json({ ok: false, error: mensaje }, 500);
  }
});
