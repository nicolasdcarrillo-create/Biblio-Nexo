# Estado de la sesión en curso

No es documentación permanente del proyecto — se borra o se vacía cuando esta
ronda de trabajo termine. Mientras tanto, es el punto de partida para
retomar mañana. El detalle completo de hoy (con el porqué de cada cosa) está
en `PROMPT-produccion.md`, sección 18.

**Fecha**: 2026-08-21
**Working tree**: revisar con `git status` — hay cambios sin confirmar
(`git add`/`git commit`/`git push`) correspondientes al pulido de hoy.

---

## Completado hoy: pulido de la lista "Ahora" (a partir de una auditoría propia del proyecto)

1. **Las tres suites que faltaban, enganchadas a CI**: `probar-vistas.mjs`,
   `probar-migraciones.py` y `probar-escaneo-remoto.mjs` ya corren solas en
   cada envío, en `.github/workflows/pruebas.yml`.
2. **Prueba intermitente encontrada y corregida**: `probar-vistas.mjs`
   calculaba "hoy" con la fecha UTC del runner en vez de la de Chile, y dos
   comprobaciones fallaban solas varias horas al día. Corregido antes de
   enganchar la suite — si no, habría sido peor que no tenerla en CI.
3. **Chequeo nuevo, sin base de datos**: `pruebas/verificar_llamadas_rpc.py`
   cruza cada llamada RPC del JS contra la firma vigente en las migraciones.
   Verificado que detecta el caso real (el que motivó la corrección de
   seguridad de ayer) antes de darlo por bueno.
4. **`CACHE_VERSION` subió a `v4`** (la corrección de seguridad de ayer
   cambió la firma de un RPC que llama un archivo precargado, y el número de
   versión no había subido con eso) **y CI se alineó a `postgres:17`**
   (producción corre 17.6.1; CI corría contra 16 — pendiente documentado
   desde la sección 11 de `PROMPT-produccion.md`).

Todo verificado localmente antes de subir (ver el bloque de conteos en
`PROMPT-produccion.md` §18). Lo único sin verificar en este equipo es lo que
depende de un PostgreSQL real (`probar_librero.py`, `reconstruccion`) — este
entorno no tiene Docker disponible para levantar ese servicio.

**Qué NO se tocó, y por qué** (mismo detalle en `PROMPT-produccion.md` §18):
`migration repair` de 012-014 (necesita tu aprobación, toca producción), la
política RLS extra en `usuarios` (es tu decisión, no la de esta sesión), y
seguir dividiendo `ui-base.js`/`db.js` (identificado con detalle concreto,
pero es su propio refactor, no algo para apurar al final de esta ronda).

---

## Cómo verificar lo de hoy

1. `git add` / `git commit` / `git push` de los archivos de abajo.
2. Ver la CI en verde — ahora son 5 trabajos, no 4: `consolidacion`,
   `interfaz`, `migraciones` (nuevo), `base-de-datos`, `reconstruccion`. Los
   dos últimos corren contra PostgreSQL 17 por primera vez — es el cambio de
   esta ronda que no se pudo probar en este equipo, así que vale la pena
   mirarlos con más atención que de costumbre.
3. Nada de esto requiere ningún paso manual en la base de datos: no hay
   migración nueva ni cambio de firma de ninguna función.

---

## Archivos para subir en esta ronda (pulido)

Modificados: `.github/workflows/pruebas.yml`, `sw.js`,
`pruebas/probar-vistas.mjs`, `js/escaneo-remoto.js` (sin cambios de fondo:
quedó igual que antes, se usó solo para probar y revertir el chequeo nuevo),
`PROMPT-produccion.md`, `ESTADO.md`, `pruebas/LEEME.md`,
`pendientes-checklist.md`.

Nuevo: `pruebas/verificar_llamadas_rpc.py`.

Si `git status` muestra algo más que esto, probablemente sea de una ronda
anterior que todavía no se subió — revisa `PROMPT-produccion.md` antes de
asumir que es de hoy.

---

## Lista de prioridades (detalle completo en PROMPT-produccion.md §12 y §18)

**Ahora — barato y con impacto real**
1. ~~Enganchar `probar-vistas.mjs`, `probar-migraciones.py` y
   `probar-escaneo-remoto.mjs` a CI~~ — hecho hoy.
2. ~~Alinear CI a `postgres:17`~~ — hecho hoy, sin confirmar todavía (ver
   "Cómo verificar lo de hoy").
3. Decidir qué hacer con la política RLS "de más" en `usuarios`.
4. `migration repair` para las migraciones 012, 013 y 014 (requiere
   aprobación antes de tocar producción).

**Después — más esfuerzo, sigue siendo importante**
5. **Fase 2: integración con Aleph 500** — ver `PROMPT-produccion.md` §7,
   cuando se decida empezarlo.
6. `verificar_politicas()`: RLS y grants bajo el mismo patrón que
   `verificar_definiciones()`.
7. **Terminar de dividir `ui-base.js`** (2900 líneas): las secciones
   CATÁLOGO y ADMINISTRACIÓN son las candidatas concretas — se solapan con
   lo que ya existe en `js/vistas/`.
8. Dividir `js/modules/db.js` (~840 líneas en un solo objeto) por dominio,
   si sigue creciendo — de menor urgencia que el punto 7.
9. Script de verificación estático para clases de Tailwind no compiladas
   (ítem 12 de la ronda anterior). Dos ejemplos preexistentes ya
   encontrados y sin corregir: `mx-auto` en los círculos numerados de
   `escaneo-remoto.js` y `hover:bg-rose-100` en el botón de cerrar sesión de
   `perfil.js` (ambos puramente estéticos).

**No es código, pero bloquea el cierre del proyecto igual**
10. Asignar, por nombre, quién aprieta el botón de respaldo de Supabase.
11. Designar Delegado de Protección de Datos y Encargado de
    Ciberseguridad, firmar el encargo de tratamiento — antes del 1 de
    diciembre de 2026.
12. **Cifrado de disco y bloqueo de sesión en el equipo del mesón** —
    urgente desde la Fase 1.2, sin cambios. Ver `CUMPLIMIENTO-LEGAL.md` §9 bis.

**Pendiente de verificación manual (no bloquea nada, nadie lo hizo)**
13. Confirmar en un celular real que el ícono nuevo (512×512) se ve bien.
14. Probar en producción, con un enlace real: escanear un libro nuevo y uno
    existente, y usar "Deshacer" en ambos.

---

## Decisiones que siguen en pie (heredadas, no reabrir)

- **`probar-vistas.mjs` se conserva.** Cubre terreno que ninguna otra suite
  prueba. (Y desde hoy corre solo, en CI.)
- **No tocar `js/config.js` / `ADMIN_EMAILS`.** Respaldo client-side
  deliberado y documentado.
- **No tocar los colores/tipografías del sistema de diseño** de
  `CLAUDE.md`/`PROMPT-produccion.md` ("Patrimonio de Futrono").
- **Ninguna función RPC de `supabase/migrations/` se toca sin aviso
  previo.**
- **Cualquier clase de Tailwind nueva se verifica contra el resto del
  proyecto antes de usarla** — dos bugs silenciosos de este tipo, ya
  encontrados y sin corregir por no pedirse (ver punto 9 de la lista de
  prioridades).
- **El ícono de la app no se inventa ni se escala desde uno más chico.**
  Cerrado con un ícono real de 512×512, del usuario — no reabrir salvo que
  cambie el diseño de nuevo.
- **El service worker nunca cachea nada que no sea del mismo origen ni nada
  que no sea GET.**
- **`CACHE_VERSION` sube no solo cuando cambia la lista de `PRECACHE_URLS`,
  sino también cuando cambia la firma de un RPC que llama alguno de esos
  archivos** (nuevo, de hoy — ver punto 4 arriba, y el comentario de
  `sw.js`).
- **La copia local de lectores nunca es un volcado completo del padrón**
  (Fase 1.2) — solo consultados o con préstamo activo, con purga por
  antigüedad y por lápida de borrado. Ver `js/modules/persistencia.js` y
  `CUMPLIMIENTO-LEGAL.md` §9 bis antes de tocar esa lógica.
- **Cambios de esquema (tablas, columnas, índices) van en una migración
  numerada nueva; cambios a funciones ya consolidadas —o funciones nuevas—
  van directo en la 010.**
- **`estadoLector()` sin conexión nunca devuelve `existe:false` en un
  cache-miss** (Fase 1.3). Ver `estadoLectorSinConexion()` en `js/modules/db.js`.
- **La cola de sincronización nunca reimplementa la lógica de negocio de
  préstamo/devolución/renovación** (Fase 1.3): siempre repite la MISMA
  llamada RPC que se habría hecho con conexión.
- **"Sincronizando", en el indicador de conexión, es solo la cola de
  escrituras pendientes (`colaSync`), nunca la sincronización de catálogo**
  (Fase 1.4).
- **El indicador de conexión nunca depende solo del color** (Fase 1.4, por
  WCAG): cada estado trae su propio ícono y su propio texto.
- **`deshacer_libro_remoto()` nunca resta más ejemplares de los que siguen
  disponibles, y nunca elimina un libro con préstamos.**
- **`deshacer_libro_remoto()` nunca confía en `p_accion`/`p_cantidad` del
  cliente — no existen como parámetros**: deriva todo desde `auditoria`,
  comprobando que sea el MISMO enlace el que hizo la acción original. Si
  algún día se toca esta función de nuevo, no reintroducir esos parámetros
  — ver §17 de `PROMPT-produccion.md` para el porqué exacto.
- **Cualquier prueba que necesite "la fecha de hoy" usa `hoyEnChile()`
  (`js/modules/db.js`) o el mismo criterio a mano, nunca
  `new Date().toISOString()`** (nuevo, de hoy) — ver punto 2 de "Completado
  hoy" para el porqué: entre las 00:00 y las ~04:00 UTC, esa fecha va un día
  adelante de la fecha real en Chile.
- **Un cambio a `.github/workflows/pruebas.yml` que use un servicio de
  PostgreSQL real (`base-de-datos`, `reconstruccion`) no se puede probar en
  este entorno de trabajo** (nuevo, de hoy) — no hay Docker disponible aquí.
  Ese tipo de cambio se verifica en la CI real, después de subirlo, con más
  atención de la habitual mientras no haya confirmación.
