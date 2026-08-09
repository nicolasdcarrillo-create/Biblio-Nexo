# Estado de la auditoría en curso

Sesión de corrección de hallazgos de la auditoría técnica. No es documentación
permanente del proyecto — se borra o se vacía cuando esta ronda de trabajo
termine. Mientras tanto, es el punto de partida para retomar mañana.

**Fecha**: 2026-08-09 (última sesión)
**Último commit**: `80a48f3` — "pruebas: deja probar-vistas.mjs corriendo de verdad (tmpdir + Windows)"
**Working tree**: limpio. Rama `main`, 3 commits por delante de `origin/main` (sin pushear).

---

## Completados esta sesión

1. **`pruebas/verificar_consolidacion.py`** — se fuerza UTF-8 en stdout al
   inicio (con guarda `hasattr`), porque en consolas Windows/cp1252 el script
   terminaba las 36 comprobaciones sin ningún problema real y aun así moría
   con `UnicodeEncodeError` al imprimir el separador de cierre, devolviendo
   código 1 como si algo hubiera fallado. Confirmado: ahora sale con código 0
   en esta consola, sin tocar ninguna comprobación lógica. — commit `409df10`.

2. **`pruebas/probar-vistas.mjs`, RAIZ** — dejó de depender de
   `path.resolve('biblionexo')` (una subcarpeta literal que no existe en este
   checkout) y ahora se deriva de `import.meta.url`, así corre desde
   cualquier directorio. — commit `105826c`.

3. **`pruebas/probar-vistas.mjs`, tmpdir + Windows** — dos defectos que
   estaban enmascarados por el de arriba:
   - el directorio temporal cambió de `path.resolve('.tmp-pruebas')`
     (caía dentro de `RAIZ` y `fs.cpSync` fallaba al copiarse dentro de sí
     mismo) a `fs.mkdtempSync(path.join(os.tmpdir(), 'biblionexo-pruebas-'))`,
     fuera del repo;
   - los `import()` dinámicos ahora pasan por `pathToFileURL()`, porque en
     Windows una ruta cruda (`C:\...`) se interpretaba como URL con esquema
     `c:` y el loader de ESM la rechazaba;
   - la limpieza del temporal quedó en `try/finally` (sin reindentar el
     cuerpo de ~650 líneas, para no inflar el diff).
   Resultado: la suite corre de verdad. **91 pasadas, 1 fallida.**
   — commit `80a48f3`.

4. **Clasificación del único fallo** de `probar-vistas.mjs` (hecha, no
   aplicada todavía): "los avisos se anuncian al lector de pantalla" es
   **(B) prueba desactualizada** — busca `<div id="toast-container">` en
   `js/modules/ui.js`, que quedó reducido a 17 líneas de ensamblaje cuando
   `UIManager` se repartió en `js/modules/ui-base.js` + `js/vistas/*.js`. El
   comportamiento real ya es correcto (`role="status"` + `aria-live="polite"`
   están en los tres lugares donde `ui-base.js` crea el contenedor, y en
   `index.html:88`). Cero hallazgos (A) — ningún bug real de RUT, RLS,
   consentimiento ni mesón en esta corrida.

---

## En curso — qué falta para cerrarlo

**Paso 2 del plan de corrección** (reparar y enganchar `probar-vistas.mjs`).
Falta, en orden:

1. Tu decisión sobre cómo corregir el fallo (B): ¿cambio mínimo de una línea
   (`js/modules/ui.js` → `js/modules/ui-base.js` en la prueba), o lo amplío
   para además revisar `js/vistas/*.js` por si algún día crean su propio
   contenedor de avisos? Pregunta abierta, sin responder.
2. Aplicar esa corrección y volver a correr `probar-vistas.mjs` hasta que dé
   92/92 (verde).
3. Enganchar `probar-vistas.mjs` a `.github/workflows/pruebas.yml`, junto a
   los otros tres trabajos.
4. Actualizar `pruebas/LEEME.md`: hoy documenta la invocación vieja ("Desde
   la carpeta que contiene `biblionexo/`"), que ya no aplica.
5. Commit de esta corrección, con diff mostrado antes de aplicarlo (como en
   los pasos anteriores).

---

## Pendientes (sin empezar), en el orden acordado

- **C — `probar_librero.py` en entorno aislado.** Crear `.venv` con
  `python -m venv .venv`, instalar ahí `pgserver` y `psycopg[binary]` (nunca
  en el Python del sistema), correr las 90 comprobaciones de permisos del rol
  librero contra PostgreSQL real. Si algo falla: explicar el permiso/política
  RLS en juego y esperar visto bueno antes de tocar código — no corregir a
  ciegas. Agregar `.venv/` a `.gitignore` si no está.
- **D — cerrar el conteo de `probar-vistas.mjs`.** Una vez aplicada la
  corrección del fallo (B), confirmar que queda en 92/92 y dejarlo asentado
  (esto es continuación directa del paso "en curso" de arriba, no un punto
  nuevo — lo separo solo porque lo nombraste aparte).
- **E — diagnóstico offline/PWA (sin implementar).** Revisar `README.md`,
  `CLAUDE.md`, el PRD y cualquier documento del repo buscando dónde se
  promete comportamiento offline / offline-first / instalación como app —
  recordatorio: el repo hoy no tiene `sw.js` ni `manifest.json`. Entregar dos
  opciones con costo real: (a) reincorporar Service Worker + manifest, o (b)
  corregir la documentación para que refleje lo que el sistema hace hoy. Sin
  implementar ninguna.
- **A — "caja de rutas"**: mencionado en el encargo de hoy, pero no
  corresponde a nada que se haya establecido en esta sesión. No le inventé
  contenido. Precísalo mañana antes de que lo trabaje.
- **B — "checklist de migraciones"**: mismo caso — no aparece en el historial
  de esta sesión. Lo más cercano que sí existe es la regla "no tocar ninguna
  función RPC de `supabase/migrations/` sin avisar antes" (ver Decisiones más
  abajo), pero eso ya está cubierto ahí, no parece ser esto. Precísalo mañana.

---

## Decisiones ya tomadas (no reabrir)

- **`probar-vistas.mjs` se conserva.** Cubre terreno (RUT, accesibilidad WCAG,
  ciclo completo del mesón, cumplimiento Ley 21.719, paginación, exportación)
  que ninguna otra suite prueba. No se evalúa borrarla.
- **No tocar `js/config.js` / `ADMIN_EMAILS`.** Es un respaldo client-side
  deliberado y ya documentado (ver `js/modules/auth.js` y
  `js/vistas/dashboard.js`), no una fuga.
- **No tocar los colores/tipografías del sistema de diseño** de `CLAUDE.md`
  ("Patrimonio de Futrono").
- **Ninguna función RPC de `supabase/migrations/` se toca sin aviso previo**,
  aunque una prueba la señale.
- **Un commit por paso**, con diff mostrado antes de aplicarlo — seguir con
  ese formato mañana.

---

## Roto o a medio arreglar — dicho explícitamente

- `pruebas/probar-vistas.mjs` **corre pero no está verde**: 1 de 92
  comprobaciones falla (clasificada como B, ver arriba). No está enganchada a
  `.github/workflows/pruebas.yml` todavía.
- `pruebas/LEEME.md` sigue documentando la invocación vieja de
  `probar-vistas.mjs` ("Desde la carpeta que contiene `biblionexo/`"), que ya
  no es cierta desde el commit `105826c`. No se corrigió todavía — depende del
  paso "En curso" de arriba.
- `pruebas/probar_librero.py` no se ha corrido en esta ronda: sigue siendo
  "requiere verificación manual" desde el informe original de la auditoría.
- El diagnóstico offline/PWA (paso E) no se empezó: sigue siendo cierto que
  no hay `sw.js` ni `manifest.json`, y no se ha revisado todavía qué
  documentos del repo prometen lo contrario.
