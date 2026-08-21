# Lista de pendientes — BiblioNexo

Checklist de trabajo, no documentación permanente del proyecto (esa vive en
`PROMPT-produccion.md` y `ESTADO.md`, dentro del repo). Pensada para ir
tachando a medida que se resuelve cada cosa.

Última actualización: 21 de agosto de 2026, más tarde el mismo día — los
dos últimos pendientes de "Ahora" quedaron resueltos.

---

## 🔴 Urgente — falta este paso tuyo

- [ ] **Subir `supabase/migrations/016_eliminar_politica_redundante_usuarios.sql`.**
      Ya está **aplicada en producción** (se hizo directo con la conexión de
      Supabase de esta sesión, no falta ningún paso en la base) — el
      `git add`/`commit`/`push` es solo para que el repositorio quede tan al
      día como la base. Junto con `PROMPT-produccion.md`, `ESTADO.md` y este
      archivo.

---

## 🟠 Ahora — barato y con impacto real

Sin pendientes en esta categoría — los dos últimos (la política RLS y el
`migration repair`) quedaron resueltos hoy, ver ✅ abajo.

---

## 🟡 Después — más esfuerzo, sigue siendo importante

- [ ] **Fase 2: integración con Aleph 500** — el siguiente bloque de trabajo
      real, cuando decidas empezarlo (`PROMPT-produccion.md` §7).
- [ ] `verificar_politicas()` — RLS y grants bajo el mismo patrón que ya
      existe para funciones (`verificar_definiciones()`).
- [ ] **Terminar de dividir `ui-base.js`** (todavía 2900 líneas). Candidatas
      concretas encontradas en la auditoría: las secciones internas
      CATÁLOGO y ADMINISTRACIÓN, que se solapan con lo que ya existe en
      `js/vistas/`. Es un refactor de verdad — mejor como su propia ronda,
      con tiempo para probar cada vista después de moverla.
- [ ] Dividir `js/modules/db.js` (~840 líneas en un solo objeto) por
      dominio (préstamos, lectores, libros, reportes), si sigue creciendo —
      menos urgente que lo de arriba, hoy es cohesivo tal como está.
- [ ] Script de verificación estático de clases de Tailwind no compiladas
      (ítem 12, recomendado pero no construido — evita el build step. Mismo
      espíritu que `pruebas/verificar_llamadas_rpc.py`, nuevo de hoy).
- [ ] Corregir dos bugs preexistentes y silenciosos de clases Tailwind ya
      encontrados (cosméticos, no urgentes): `mx-auto` en los círculos
      numerados de `escaneo-remoto.js`, y `hover:bg-rose-100` en el botón de
      cerrar sesión de `perfil.js`.
- [ ] (Nuevo, visto en el run #36) La CI avisa que `actions/setup-node@v4`
      con `node-version: '20'` está deprecado y GitHub está forzando
      Node 24 por su cuenta — no rompe nada hoy, pero conviene subir el
      número a mano antes de que GitHub deje de dar ese aviso y simplemente
      falle.

---

## ⚫ No es código, pero bloquea el cierre del proyecto

- [ ] Asignar, por nombre, quién aprieta el botón de respaldo de Supabase.
- [ ] Designar Delegado de Protección de Datos y Encargado de
      Ciberseguridad, y firmar el encargo de tratamiento — **antes del 1 de
      diciembre de 2026** (Ley 21.719).
- [ ] Cifrado de disco y bloqueo de sesión en el equipo del mesón — urgente
      desde la Fase 1.2, sin resolver todavía. Ver `CUMPLIMIENTO-LEGAL.md` §9 bis.

---

## ✅ Ya verificado en esta ronda (referencia, no acción)

- [x] CI #33 en verde — Fases 1.2, 1.3 y 1.4 subidas y confirmadas.
- [x] CI #32 en verde — ítems 11, 12 y 13 ("pulido, no urgente").
- [x] Fase 1 completa (1.1 a 1.4): funcionamiento sin conexión.
- [x] Hueco de seguridad en `deshacer_libro_remoto()` corregido y probado
      (136 comprobaciones en `probar-migraciones.py`, dos escenarios de
      esquema).
- [x] Commit `82d2f6a` (corrección de seguridad) subido y en verde en la CI
      — run #34, 46 segundos. Confirmado.
- [x] Commit `0a6abdc` (Fases 1.2-1.4) subido y en verde en la CI — run #33.
- [x] Commit de los ítems 11, 12 y 13 subido y en verde en la CI — run #32
      (falló una vez por caché de módulos, corregido y confirmado en el
      reintento).
- [x] `probar-vistas.mjs`, `probar-migraciones.py` y
      `probar-escaneo-remoto.mjs` enganchadas a
      `.github/workflows/pruebas.yml` — corren solas en cada envío desde
      hoy. Probadas en verde en este equipo antes de subir (falta la
      confirmación en la CI real, ver 🔴 arriba).
- [x] Prueba intermitente encontrada y corregida en `probar-vistas.mjs`:
      calculaba "hoy" con la fecha UTC del runner en vez de la de Chile, y
      dos comprobaciones fallaban solas varias horas al día. Se encontró
      justo al intentar enganchar la suite a CI.
- [x] `pruebas/verificar_llamadas_rpc.py` — chequeo nuevo, sin base de
      datos, que cruza cada llamada RPC del JS contra la firma vigente en
      las migraciones. Probado a propósito contra el error real que ya se
      cometió una vez (los parámetros de más en `deshacer_libro_remoto`) —
      lo detecta.
- [x] `CACHE_VERSION` subido a `v4` en `sw.js` (la corrección de seguridad
      de ayer cambió una firma de RPC sin subir el número de versión).
- [x] CI alineada a `postgres:17` en `base-de-datos` y `reconstruccion`
      (producción corre 17.6.1) — confirmado en verde, run #36.
- [x] Commit `ecbde20` (el `.github/workflows/pruebas.yml` que había quedado
      afuera del commit anterior por la protección de escritura en `.github`)
      subido a mano y confirmado: los 5 jobs corren, todos en verde —
      `consolidacion` (7s), `interfaz` (19s), `migraciones` (10s, nuevo),
      `base-de-datos` en PostgreSQL 17 (32s), `reconstruccion` en
      PostgreSQL 17 (49s). Run #36, 53 segundos en total.
- [x] `migration repair` de 012, 013 y 014 — verificado en vivo contra
      producción: ya estaban registradas, no hacía falta ningún repair. Se
      resolvió en algún momento entre el 6 de agosto y hoy, sin quedar
      anotado en ninguna sesión.
- [x] Política RLS redundante `"Lectura de roles propia"` en `usuarios` —
      eliminada. Confirmado en vivo que era subconjunto exacto de "usuarios
      ve su perfil" antes de tocarla, y confirmado después que `pg_policies`
      bajó de 5 a 4 filas. Migración 016 aplicada directo a producción con
      permiso explícito (ver 🔴 arriba para subir el archivo al repo).

## 🔵 Pendiente de verificación manual (no bloquea nada, pero nadie lo hizo)

- [ ] Confirmar en un celular real que el ícono nuevo (512×512) se ve bien —
      nadie lo verificó todavía fuera de la vista previa.
- [ ] Probar en producción, con un enlace real, escanear un libro nuevo y
      uno existente, y usar "Deshacer" en ambos — solo se probó simulado.
