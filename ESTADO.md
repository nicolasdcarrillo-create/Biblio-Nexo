# Estado de la sesión en curso

No es documentación permanente del proyecto — se borra o se vacía cuando esta
ronda de trabajo termine. Mientras tanto, es el punto de partida para
retomar mañana. El detalle completo de lo de hoy (con el porqué de cada
cosa) está en `PROMPT-produccion.md`, sección 13 (Fase 1.2) y sección 12
(Fase 1.1 y lo de ayer).

**Fecha**: 2026-08-20
**Working tree**: revisar con `git status` — hay cambios sin confirmar
(`git add`/`git commit`/`git push`) correspondientes a la Fase 1.2, recién
sincronizados a este equipo pero todavía no subidos.

---

## Completado hoy: Fase 1.2 — Persistencia local en IndexedDB

Alcance: exactamente lo que pide `PROMPT-produccion.md` §7 (1.2) — ni más ni
menos. Ninguna pantalla lee todavía de este almacén; eso es trabajo de la
Fase 1.3, cuando de verdad haga falta operar sin conexión.

- **`js/modules/persistencia.js`** (nuevo): clase `PersistentStorage` sobre
  IndexedDB. Catálogo completo, con delta sync por `actualizado_en`
  (migración 011, ya existía). Lectores **nunca en bloque** — solo por dos
  vías acotadas (consultado por RUT en el mesón, o con préstamo activo ahora
  mismo), con purga automática a los 30 días sin actividad.
- **`supabase/migrations/015_lapidas_eliminaciones.sql`** (nueva, schema):
  tabla `elementos_eliminados` + disparador `AFTER DELETE` en `libros` y
  `lectores`, con RLS (`es_personal()`). Sin esto, el derecho de supresión no
  llegaría a la copia local del mesón — un lector borrado en el servidor
  seguiría con sus datos en el disco indefinidamente. Exigido por
  `CUMPLIMIENTO-LEGAL.md` §9 bis, no una decisión libre.
- **`supabase/migrations/010_consolidacion.sql`** (editada, no nueva —
  regla del proyecto): `verificar_rls()` ahora también revisa
  `elementos_eliminados` (7 → 8 tablas).
- **`js/modules/db.js`**: `estadoLector()` guarda el resultado en el almacén
  local (una de las dos vías de entrada de lectores).
- **`js/main.js`**: arranca `persistencia.sincronizarTodo()` al iniciar
  sesión, cada 5 minutos mientras la pestaña siga abierta, y al recuperar la
  conexión. Nunca bloquea nada — cada paso atrapa sus propios errores.
- **`sw.js`**: precarga también `persistencia.js` (si no, se rompería el
  import en el arranque sin conexión).

**Pruebas nuevas o ampliadas**, las siete corriendo en verde ahora mismo:
- `pruebas/probar-persistencia.mjs` (nueva, 25 comprobaciones, IndexedDB en
  memoria con `fake-indexeddb`): las cuatro reglas de privacidad, una por
  una — catálogo completo, lectores nunca en bloque, lápidas purgan la copia
  local, purga por antigüedad.
- `pruebas/probar-interfaz.mjs`: +8 comprobaciones (90 → 98) — el enganche
  (sw.js precarga persistencia.js, db.js y main.js lo importan donde
  correspondía), no la lógica interna.
- `pruebas/probar_librero.py`: +7 comprobaciones (97 → 105; 78 → 84 en
  Windows sin tzdata) — la única suite que cambia de ROL de Postgres de
  verdad (`set role authenticated`/`anon`), así que es la que de verdad
  prueba que un anónimo no ve ninguna lápida y el personal sí.
- `pruebas/probar-migraciones.py`: +6 comprobaciones (114 → 120) — que
  borrar un lector o un libro deja lápida, en los dos escenarios de esquema.

**CI**: `pruebas/probar-persistencia.mjs` quedó enganchada al job `interfaz`
de `.github/workflows/pruebas.yml` de una vez (instala `fake-indexeddb`
junto con `jsdom`, en el mismo comando — ver la nota en
`pruebas/LEEME.md` sobre por qué deben instalarse juntas sin
`package.json`). No se dejó como una suite nueva sin conectar: sería repetir
el mismo hallazgo #1 de la lista de prioridades.

**Riesgo documentado, no corregido, no es del código**: el disco del equipo
del mesón sigue sin cifrar (`CUMPLIMIENTO-LEGAL.md` §9 bis ya lo señala como
pendiente de la organización). Sin cifrado de disco y bloqueo de sesión del
sistema operativo, cualquiera con acceso físico alcanza la copia local
mientras no se haya purgado (hasta 30 días para un lector sin actividad).

---

## Cómo verificar la Fase 1.2

1. `git add` / `git commit` / `git push` de los archivos de abajo.
2. `node pruebas/probar-persistencia.mjs` → 25 comprobaciones correctas.
3. `python3 pruebas/probar_librero.py` → 105 comprobaciones correctas (o 84
   + 13 omitidas en Windows sin tzdata — normal, ver `pruebas/LEEME.md`).
4. `python3 pruebas/probar-migraciones.py` → 120 comprobaciones correctas.
5. `node pruebas/probar-interfaz.mjs` → 98 comprobaciones correctas.
6. En Supabase (SQL Editor o CLI), aplicar `015_lapidas_eliminaciones.sql` —
   es idempotente, se puede correr más de una vez sin problema. Confirmar
   con `select * from public.verificar_rls() where tabla =
   'elementos_eliminados';` → `rls_activo = true`, `politicas >= 1`,
   `diagnostico = 'Correcto'`.
7. Ya en producción, con sesión iniciada: dejar pasar unos segundos y
   revisar en las herramientas de desarrollador (Application → IndexedDB →
   `biblionexo-local`) que aparecen los almacenes `libros`, `lectores` y
   `meta`, con datos adentro.

---

## Archivos para subir en esta ronda (Fase 1.2)

Nuevos: `supabase/migrations/015_lapidas_eliminaciones.sql`,
`js/modules/persistencia.js`, `pruebas/probar-persistencia.mjs`.

Modificados: `supabase/migrations/010_consolidacion.sql`, `js/modules/db.js`,
`js/main.js`, `sw.js`, `pruebas/probar-interfaz.mjs`,
`pruebas/probar-migraciones.py`, `pruebas/probar_librero.py`,
`pruebas/LEEME.md`, `.github/workflows/pruebas.yml`, `PROMPT-produccion.md`,
este archivo.

---

## Lista de prioridades (detalle completo en PROMPT-produccion.md §12)

**Ahora — barato y con impacto real**
1. Enganchar `probar-vistas.mjs` y `probar-migraciones.py` a
   `.github/workflows/pruebas.yml` (`probar-persistencia.mjs` ya quedó
   enganchada hoy; `probar-escaneo-remoto.mjs` sigue pendiente también).
2. Decidir qué hacer con la política RLS "de más" en `usuarios`.
3. `migration repair` para las migraciones 012, 013 y 014 (requiere
   aprobación antes de tocar producción).
4. Alinear CI a `postgres:17` en los trabajos `base-de-datos` y
   `reconstruccion`.

**Después — más esfuerzo, sigue siendo importante**
5. Fase 1: **faltan 1.3 (cola de sincronización) y 1.4 (indicador de
   conexión)**. Sin ellas, todavía no se puede prestar ni devolver sin
   conexión — solo abrir la app y tener el catálogo/lectores replicados para
   consulta. El criterio de aceptación completo de la Fase 1 sigue sin
   cumplirse.
6. `verificar_politicas()`: RLS y grants bajo el mismo patrón que
   `verificar_definiciones()`.
7. Terminar de partir `ui.js`/`ui-base.js`.

**No es código, pero bloquea el cierre del proyecto igual**
8. Asignar, por nombre, quién aprieta el botón de respaldo de Supabase.
9. Designar Delegado de Protección de Datos y Encargado de Ciberseguridad,
   firmar el encargo de tratamiento — antes del 1 de diciembre de 2026.
10. **Cifrado de disco y bloqueo de sesión en el equipo del mesón** — ahora
    más urgente que antes: desde hoy ese disco de verdad guarda una copia
    (acotada, purgada) de datos de lectores. Ver `CUMPLIMIENTO-LEGAL.md`
    §9 bis.

**Pulido, no urgente**
11. Portada del libro y lista de lo escaneado (con "deshacer") en el
    escaneo remoto.
12. Evaluar si conviene sumar el Tailwind CLI como paso de build.
13. Conseguir un ícono de 512×512 real para `manifest.json` (hoy solo tiene
    el de 192×192).

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
  proyecto antes de usarla.**
- **El ícono de la app no se inventa ni se escala desde el de 192×192.**
- **El service worker nunca cachea nada que no sea del mismo origen ni nada
  que no sea GET.**
- **La copia local de lectores nunca es un volcado completo del padrón**
  (nueva, de hoy) — solo consultados o con préstamo activo, con purga por
  antigüedad y por lápida de borrado. Ver `js/modules/persistencia.js` y
  `CUMPLIMIENTO-LEGAL.md` §9 bis antes de tocar esa lógica.
- **Cambios de esquema (tablas, columnas, índices) van en una migración
  numerada nueva; cambios a funciones ya consolidadas van directo en la 010**
  (nueva, de hoy — es la regla que ya regía, aplicada con
  `015_lapidas_eliminaciones.sql` + la edición de `verificar_rls()` en la
  010, cada cosa en el archivo que correspondía).
