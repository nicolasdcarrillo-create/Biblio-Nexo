# Estado de la sesión en curso

No es documentación permanente del proyecto — se borra o se vacía cuando esta
ronda de trabajo termine. Mientras tanto, es el punto de partida para
retomar mañana. El detalle completo de lo de hoy (con el porqué de cada
cosa) está en `PROMPT-produccion.md`, sección 12.

**Fecha**: 2026-08-19 (última sesión)
**Working tree**: revisar con `git status` — hay cambios sin confirmar
(`git add`/`git commit`/`git push`) correspondientes a la Fase 1.1, recién
sincronizados a este equipo pero todavía no subidos.

---

## Completado esta sesión

1. **Escaneo remoto sin sesión: cámara arreglada, dos bugs distintos.**
   (Ver el detalle en la sección anterior de este archivo, o en
   `PROMPT-produccion.md` §12 — no se repite aquí.) Confirmado en un celular
   real; commit `a2009aa` ya subido.

2. **Fase 1.1 — Funcionamiento sin conexión: cascarón de la app precargado.**
   Alcance deliberadamente acotado: SOLO 1.1 (service worker + manifest +
   precarga del cascarón), no 1.2/1.3/1.4 — siguiendo la regla del propio
   `PROMPT-produccion.md` de no encadenar fases sin confirmación.

   - **`sw.js`** (nuevo, en la raíz): precarga el cascarón (HTML, CSS, JS
     propio, fuentes, Tailwind/FontAwesome compilados) para que la app pueda
     ABRIR sin conexión. Cache-first para `/vendor/*`; network-first (con
     reserva en caché) para todo lo demás del mismo origen; ignora por
     completo lo que no sea GET y lo que no sea del mismo origen (Supabase,
     Open Library nunca se cachean, para no servir datos de préstamos
     desactualizados sin que nadie lo note). Deliberadamente NO precarga
     `html5-qrcode.min.js`, `chart.umd.js` ni `qrcode.min.js` — siguen
     cargándose bajo demanda, como ya funcionaba.
   - **`manifest.json`** (nuevo): nombre, colores de Patrimonio de Futrono,
     `display: standalone`. Trae solo el ícono de 192×192 que ya existía —
     **falta uno de 512×512**, a propósito no se inventó ni se escaló (se
     vería borroso); pendiente de que la biblioteca lo entregue.
   - **`index.html`**: agrega `<link rel="manifest">` y `<meta
     name="theme-color">`.
   - **`js/main.js`**: registra el service worker después del evento `load`
     (no compite por ancho de banda con el arranque) y nunca bloquea el
     inicio de sesión si el registro falla — solo lo deja en el registro de
     errores propio.
   - **`vercel.json`**: `Cache-Control: no-cache, must-revalidate` para
     `/sw.js` y `/manifest.json` (crítico para `sw.js`: si quedara con caché
     larga, un cambio nuevo podría tardar en llegar a los navegadores).
   - **33 comprobaciones nuevas** en `pruebas/probar-interfaz.mjs` (58 → 90):
     estructura del service worker, contenido del manifest, que index.html
     los enlace, que main.js registre sin bloquear, y que los tres archivos
     pesados sigan fuera de la precarga.

   **Qué falta todavía de "funcionamiento sin conexión" completo — NO se
   tocó, es a propósito**: el cascarón abre sin conexión, pero *ninguna*
   operación real (iniciar sesión, prestar, devolver) funciona todavía sin
   internet — eso es Fase 1.2 (IndexedDB) y 1.3 (cola de sincronización),
   sin empezar. El criterio de aceptación completo de la Fase 1 ("prestar un
   libro en modo avión, que se sincronice solo al reconectar") sigue sin
   cumplirse.

3. **Conteos de pruebas y tabla de "qué ya está hecho" en
   `PROMPT-produccion.md` corregidos** — estaban desactualizados (56→58,
   90→98, faltaban tres suites completas en la lista). Ver sección 6 y la
   nueva sección 12 de ese documento. *(Pendiente: refrescar de nuevo con
   58→90 tras lo de hoy.)*

4. **Análisis de estado completo** entregado al usuario y guardado en el
   Proyecto de Claude (`claude/analisis-estado-2026-08-19.md`): checklist de
   lo implementado, lo que falta pulir, y sugerencias de funcionalidades
   nuevas.

---

## Cómo verificar la Fase 1.1 (antes de dar por cerrado este punto)

1. `git add` / `git commit` / `git push` de: `sw.js`, `manifest.json`,
   `index.html`, `js/main.js`, `vercel.json`,
   `pruebas/probar-interfaz.mjs`.
2. Ya en producción (Vercel), con el celular en modo avión: abrir
   `https://biblio-nexo-fuckingkrio.vercel.app/` una vez CON conexión
   (para que el service worker se instale y precargue el cascarón), después
   activar modo avión y volver a abrir la misma URL — debería mostrar el
   login o el panel, no un error de "sin conexión" del navegador.
   *(Todavía NO debe intentar prestar/devolver sin conexión — eso fallará
   hasta la Fase 1.2/1.3, como se explica arriba.)*
3. En las herramientas de desarrollador del navegador (F12 → Application →
   Service Workers) debería verse `sw.js` registrado y activo.
4. `node pruebas/probar-interfaz.mjs` → 90 comprobaciones correctas.

---

## Lista de prioridades (detalle completo en PROMPT-produccion.md §12)

**Ahora — barato y con impacto real**
1. Enganchar `probar-vistas.mjs`, `probar-migraciones.py` y
   `probar-escaneo-remoto.mjs` a `.github/workflows/pruebas.yml`.
2. Decidir qué hacer con la política RLS "de más" en `usuarios`.
3. `migration repair` para las migraciones 012, 013 y 014 (requiere
   aprobación antes de tocar producción).
4. Alinear CI a `postgres:17` en los trabajos `base-de-datos` y
   `reconstruccion`.

**Después — más esfuerzo, sigue siendo importante**
5. Fase 1 completa: funcionamiento sin conexión. **1.1 (service worker +
   manifest) recién quedó lista hoy — falta 1.2 (IndexedDB), 1.3 (cola de
   sincronización) y 1.4 (indicador de conexión).**
6. `verificar_politicas()`: RLS y grants bajo el mismo patrón que
   `verificar_definiciones()`.
7. Terminar de partir `ui.js`/`ui-base.js` (catálogo, usuarios, préstamos,
   escáner siguen mezclados en `ui-base.js`).

**No es código, pero bloquea el cierre del proyecto igual**
8. Asignar, por nombre, quién aprieta el botón de respaldo de Supabase.
9. Designar Delegado de Protección de Datos y Encargado de Ciberseguridad,
   firmar el encargo de tratamiento — antes del 1 de diciembre de 2026.

**Pulido, no urgente**
10. Portada del libro y lista de lo escaneado (con "deshacer") en el
    escaneo remoto.
11. Evaluar si conviene sumar el Tailwind CLI como paso de build, para que
    el hallazgo del bug de hoy (clases "invisibles" por no estar
    compiladas) deje de ser un riesgo permanente.
12. Conseguir un ícono de 512×512 de verdad para `manifest.json` (hoy solo
    tiene el de 192×192).

---

## Pendiente inmediato, antes de tocar cualquier otra cosa

- **Confirmar `git add`/`commit`/`push` de los 6 archivos de la Fase 1.1**
  (ver arriba) y verificar en un celular real, en modo avión, que el
  cascarón abre.
- **No seguir con la Fase 1.2 (IndexedDB) sin que el usuario lo pida
  explícitamente** — es la siguiente fase natural, pero el proyecto tiene
  la regla de no encadenar fases sin confirmación, y ya se siguió al pie de
  la letra para 1.1 (solo 1.1, nada de 1.2/1.3/1.4 todavía).

---

## Decisiones que siguen en pie (heredadas, no reabrir)

- **`probar-vistas.mjs` se conserva.** Cubre terreno que ninguna otra suite
  prueba.
- **No tocar `js/config.js` / `ADMIN_EMAILS`.** Respaldo client-side
  deliberado y documentado.
- **No tocar los colores/tipografías del sistema de diseño** de
  `CLAUDE.md`/`PROMPT-produccion.md` ("Patrimonio de Futrono").
- **Ninguna función RPC de `supabase/migrations/` se toca sin aviso
  previo.**
- **Cualquier clase de Tailwind nueva se verifica contra el resto del
  proyecto antes de usarla** (de la sesión anterior).
- **El ícono de la app no se inventa ni se escala desde el de 192×192** — se
  vería borroso. El de 512×512 lo tiene que entregar la biblioteca.
- **El service worker nunca cachea nada que no sea del mismo origen ni nada
  que no sea GET** — la cola de escrituras sin conexión es un diseño
  aparte (Fase 1.3), no algo para improvisar dentro de `sw.js`.
