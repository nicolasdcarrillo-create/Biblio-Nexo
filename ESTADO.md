# Estado de la sesión en curso

No es documentación permanente del proyecto — se borra o se vacía cuando esta
ronda de trabajo termine. Mientras tanto, es el punto de partida para
retomar mañana. El detalle completo de hoy (con el porqué de cada cosa) está
en `PROMPT-produccion.md`.

**Fecha**: 2026-08-22
**Working tree**: revisar con `git status` — hay varios archivos nuevos y
editados sin confirmar. Todo ya está **aplicado y desplegado en producción**
(con la conexión de Supabase de esta sesión) — subir al repositorio es solo
para que quede tan al día como la base. Ver la lista completa en
`pendientes-checklist.md`, sección 🔴.

**Lo más reciente (sexta ronda del día)**: terminada la división de
`ui-base.js` (3035 → 1626 líneas) en cuatro vistas nuevas bajo
`js/vistas/`, el pendiente 🟡 que quedaba de la tercera ronda. Sin base de
datos de por medio — no hace falta aplicar nada a producción, solo
sincronizar el repositorio. De paso, corregidas dos verificaciones que
llevaban tiempo ciegas (`probar-contraste.mjs` y `probar-interfaz.mjs`),
lo que sacó a la luz 4 contrastes de color reales por debajo de WCAG AA,
también corregidos. Ver la sección "Sexta ronda del día" al final de este
archivo para el detalle técnico completo, o la entrada ✅ correspondiente
en `pendientes-checklist.md` para el resumen.

---

## Completado hoy: las tres mejoras de "Vista de administrador"

De `claude/sugerencias-mejora-2026-08-22.md`, sección 2 (🔧 Se puede
mejorar): plazo de préstamo global único, respaldo 100% manual, alta de
personal solo desde el panel de Supabase. Las tres implementadas y probadas
en vivo contra producción.

### 1. Plazo de préstamo por libro

Columna nueva `libros.dias_prestamo_override` (migración
`017_plazo_prestamo_por_libro.sql`): `NULL` = usa el parámetro global
`dias_prestamo` de siempre, `0` = material de referencia que no circula,
cualquier otro número = plazo propio de ese libro. `prestar_libro()`,
`renovar_prestamo()` y `buscar_libros()` (editadas en `010_consolidacion.sql`)
la usan.

**Detalle técnico importante para la próxima vez que una función consolidada
necesite una columna que agrega una migración nueva:** `010_consolidacion.sql`
se aplica ANTES que cualquier migración de número mayor en una instalación
desde cero (el orden es por nombre de archivo). Si la función editada en la
010 referencia una columna que solo agrega la 017, `pruebas/probar-migraciones.py`
falla al aplicar la propia 010 — se descubrió así, en vivo, esta ronda. La
resolución que se usó: la sentencia `alter table` (idempotente) queda
declarada dos veces, una al principio de `010_consolidacion.sql` (para que
funcione sola desde cero) y otra en `017_plazo_prestamo_por_libro.sql` (que
es la que de verdad documenta cuándo se agregó la columna). Ver la nota
"EXCEPCIÓN" al principio de la 010.

UI: campo nuevo en el modal "Editar libro" del Catálogo (vacío = plazo
general, `0` = no circula).

### 2. Respaldo automático real

`pg_cron` + `pg_net` (ambos ya disponibles en este proyecto Supabase, solo
faltaba habilitarlos) disparan el Edge Function `respaldo-automatico` todos
los días a las 07:00 UTC. Sube un JSON con todas las tablas del negocio al
bucket privado de Storage `respaldos` y deja constancia en
`public.respaldos_log` (éxito/falla, archivo, tamaño) — visible en
Administración → Cumplimiento.

Autenticación cron → Edge Function: un secreto ALEATORIO nuevo en Vault
(`cron_respaldo_secret`), generado en la propia migración — nunca la
service_role key del proyecto. El Edge Function lo verifica por RPC contra
`public.verificar_secreto_cron()`, no leyendo `vault.decrypted_secrets`
directo por PostgREST (probado en vivo: eso da 401 siempre, el esquema
`vault` no está expuesto por la API REST — de ahí la función puente).

Migración `018_respaldo_automatico.sql`: cada pieza que depende de algo
propio de Supabase (`pg_cron`, `pg_net`, Vault) va en su propio
`do $$ ... exception when others then raise notice ... $$`, para que en un
Postgres genérico (como el que usa `probar-migraciones.py`) la migración
avise y siga en vez de abortar. En producción (Supabase) las tres piezas
existen y todo queda funcionando — confirmado con una llamada real a
`net.http_post()` que subió un respaldo de 22 KB.

El bucket de Storage y el Edge Function se crearon fuera de las
migraciones (no son objetos de esquema de Postgres): el bucket con un
`insert into storage.buckets`, el Edge Function con
`mcp__Supabase__deploy_edge_function`. Su código fuente sí quedó guardado en
el repo, en `supabase/functions/respaldo-automatico/index.ts`, para que no
viva solo en el dashboard de Supabase.

El pendiente de `pendientes-checklist.md` ("asignar quién aprieta el botón")
ya no aplica: no hay botón que apretar.

### 3.1. Registro obligatorio al aceptar la invitación (agregado después)

El usuario pidió, tras ver el flujo funcionando, que aceptar la invitación no
deje entrar directo al panel con el perfil vacío: ahora pide nombre completo,
cargo (opcional) y una contraseña propia de al menos 12 caracteres antes de
mostrar cualquier otra pantalla.

Mecanismo: igual patrón que la recuperación de contraseña, que ya existía.
`esEnlaceDeInvitacion()` en `js/main.js` revisa el fragmento de la URL
(`#...type=invite...`) ANTES de consultar la sesión — si coincide, muestra
`renderCompletarInvitacion()` (nueva, en `js/modules/ui-base.js`) y no sigue
con el arranque normal. Ese formulario llama a `auth.actualizarPassword()`
(ya existía, la misma función de la recuperación) y a
`db.actualizarMiPerfil()` (RPC `actualizar_mi_perfil`, migración 008, la
misma que usa "Mi perfil" — sin esquema nuevo). Si guardar el nombre falla
por algún motivo, no deja a la persona sin poder entrar: la contraseña ya
quedó puesta, y completa el nombre después desde "Mi perfil" — el error
queda igual en el registro de errores.

`CACHE_VERSION` subido a `v6` en `sw.js` (pantalla nueva que antes no
existía). 106/106 en `pruebas/probar-vistas.mjs`, `verificar_llamadas_rpc.py`
en verde. No probado todavía con un enlace de correo real — ver 🔴 en
`pendientes-checklist.md`.

**Ajuste pedido después, mismo día**: la regla de contraseña bajó de 12
caracteres a 8, con la condición de que tenga al menos una mayúscula y un
número (la comprobación de que las dos contraseñas coincidan ya estaba desde
el principio, no era nueva). Cambio acotado a esta pantalla — el resto de la
app (recuperación de contraseña, cambio de contraseña desde Mi perfil) sigue
con sus propias reglas de antes, sin tocar. `CACHE_VERSION` subido a `v7`.

### 3. Invitación de personal por correo

Edge Function nuevo `invitar-personal` — recibe `{email, rol}`, comprueba
que quien llama sea administrador de verdad (RPC `mi_perfil()` con la propia
sesión de quien llama, no un campo que mande el cliente), manda la
invitación con `auth.admin.inviteUserByEmail` y asigna el rol en
`public.usuarios` — todo con la service_role key que el runtime de Edge
Functions inyecta solo (nunca pedida ni manejada por esta sesión, nunca
expuesta al cliente). Sin cambios de esquema.

UI: formulario nuevo en Administración → Personal. La descripción de esa
pestaña ya no dice "las cuentas se crean en Supabase, en Authentication →
Users" — ahora se invitan desde ahí mismo.

---

## Cómo verificar lo de hoy

1. `git add` / `commit` / `push` de todo lo listado en
   `pendientes-checklist.md` (migraciones 016 a 018, la edición a la 010,
   los dos Edge Functions, `db.js`/`ui-base.js`/`admin.js`, `sw.js`,
   `PROMPT-produccion.md`, `ESTADO.md`, este archivo).
2. Nada que aplicar en Supabase — todo ya está desplegado. Si quieres
   confirmar tú mismo:
   - `select * from public.verificar_definiciones() where estado <> 'Correcto';`
     (con sesión de administrador) → sin filas.
   - Editar un libro desde el Catálogo, ponerle `0` en "Plazo de préstamo
     propio", intentar prestarlo → debe rechazarlo con "es de referencia y
     no circula".
   - Administración → Cumplimiento → tarjeta "Respaldo automático" → debe
     mostrar al menos una corrida correcta (la de la prueba de esta ronda).
   - Administración → Personal → invitar una cuenta de prueba con tu propio
     correo (o uno que controles) y confirmar que llega la invitación.
3. `python3 pruebas/verificar_llamadas_rpc.py`,
   `python3 pruebas/verificar_consolidacion.py` y
   `python3 pruebas/probar-migraciones.py` — los tres en verde, confirmado
   en esta sesión (142/142 en el último).

---

## Archivos para subir en esta ronda

Nuevos:
- `supabase/migrations/017_plazo_prestamo_por_libro.sql`
- `supabase/migrations/018_respaldo_automatico.sql`
- `supabase/functions/respaldo-automatico/index.ts`
- `supabase/functions/invitar-personal/index.ts`

Editados:
- `supabase/migrations/010_consolidacion.sql`
- `js/modules/db.js`
- `js/modules/ui-base.js`
- `js/vistas/admin.js`
- `sw.js`
- `pendientes-checklist.md`, `PROMPT-produccion.md`, este archivo

Pendiente de la ronda anterior, seguía sin subir:
- `supabase/migrations/016_eliminar_politica_redundante_usuarios.sql`

---

## Cosas que cuesta descubrir solo (nuevo, de hoy)

- **Una función consolidada en la 010 no puede referenciar una columna que
  agrega una migración de número mayor** — se rompe la instalación desde
  cero. Ver "Detalle técnico" en la sección 1 de arriba.
- **El esquema `vault` no está expuesto por PostgREST.** Un Edge Function no
  puede leer `vault.decrypted_secrets` con `supabase.schema('vault').from(...)`
  — siempre da 401/error, aunque el secreto sea correcto. Hace falta una
  función SECURITY DEFINER en `public` como puente, llamada por RPC.
- **`pg_cron`, `pg_net` y el esquema `vault` no existen en el Postgres que usa
  `pruebas/probar-migraciones.py`** (es un Postgres genérico, no Supabase). Si
  una migración futura los necesita, hay que envolver cada pieza en su propio
  `do $$ ... exception when others then raise notice ... $$` para que la
  prueba local no reviente — en producción (Supabase) sí están disponibles.
- **Al aplicar una migración con `mcp__Supabase__apply_migration` (o
  cualquier vía que no sea el CLI), siempre revisar después cómo quedó
  registrada en `supabase_migrations.schema_migrations`** — puede no
  coincidir con el nombre del archivo local (esta ronda volvió a pasar, con
  la 017 y la 018, y se corrigió a mano).
- **El correo de `inviteUserByEmail` sale con la marca de Supabase por
  defecto, y — más importante — el servidor SMTP compartido de Supabase
  solo entrega esos correos a direcciones que ya son parte del "Team" de la
  organización en el Dashboard.** A cualquier otra dirección le falla en
  silencio (`Email address not authorized`). El usuario avisó del problema
  de marca al recibir el correo real (dos capturas de Gmail); investigado
  contra la documentación de Supabase (`auth-smtp`, `auth-email-templates`)
  esta misma ronda. Solución en dos partes, sin cambios de código, ambas
  documentadas con instrucciones completas en
  `supabase/plantilla-invitacion-email.md`: (1) cambiar el texto de la
  plantilla en Authentication → Email Templates, ya con los colores y
  tipografías reales de "Patrimonio de Futrono"; (2) conectar un SMTP
  propio (ej. Resend) para que deje de aplicar el límite de "solo al
  equipo" — requiere que BiblioNexo tenga un dominio propio, que hoy no
  tiene (el sitio vive en un subdominio de `vercel.app`). Pendiente de que
  el usuario decida y haga el paso 2 — no bloquea nada más.
  **Confirmado en vivo el mismo día**: al intentar invitar a
  `nikitoxdmxk@gmail.com` (que no es miembro del equipo de la organización
  de Supabase, la única persona ahí es `nicolasd.carrillo@gmail.com`) el
  formulario mostró "No se pudo enviar la invitación: Error sending invite
  email." — el mensaje genérico que da GoTrue cuando el SMTP compartido
  rechaza el envío, consistente con la restricción documentada. Invitar al
  propio correo del dueño de la organización sí debería seguir funcionando
  como prueba, pero cualquier persona nueva de verdad va a fallar hasta que
  se conecte el SMTP propio (ver Parte 2 de
  `supabase/plantilla-invitacion-email.md`).

---

## Segunda ronda del mismo día: SMTP propio + las tres de 🟠

El usuario terminó el SMTP propio (ya no queda ningún 🔴). A continuación,
las tres cosas de la categoría 🟠 elegidas explícitamente ("las tres cosas,
recomendado"):

### Hallazgo de seguridad: acceso total vía RLS en `libros`/`lectores`/`prestamos`

El más importante de los tres, y no estaba en el plan — apareció al
construir `verificar_politicas()` (punto siguiente). Producción tenía tres
políticas RLS (`"Acceso autenticado libros"`, `"Acceso autenticado
lectores"`, `"Acceso autenticado prestamos"`, las tres `cmd=ALL, roles=
{authenticated}, qual=true, with_check=true`) que ningún archivo de
migración local creaba — mismo origen probable que la política redundante
de `usuarios` resuelta el 16 de agosto (creada desde el panel de Supabase,
sin quedar registrada). Como Postgres combina las políticas RLS permisivas
con OR, estas tres anulaban en la práctica a las políticas admin-only ya
existentes: cualquier usuario autenticado (cualquier `librero`, no solo un
admin) podía leer, escribir y **borrar** cualquier fila de esas tres
tablas, sin que la interfaz lo mostrara pero sí disponible por API directa.
Sin evidencia de explotación en `auditoria`. Corregido con la migración
`019_eliminar_politicas_acceso_total.sql` (estilo y precedente de la 016),
aplicada a producción y verificada en vivo: `pg_policies` bajó de 5 a 4
políticas en cada tabla, `verificar_politicas()` reporta todo en verde.

### `verificar_politicas()`

Mismo patrón que `verificar_definiciones()`/`manifiesto_funciones()`, pero
para políticas RLS y `grant`s: `manifiesto_tablas_protegidas()` +
`manifiesto_politicas()` declaran lo esperado, `verificar_politicas()`
(admin-only, en `010_consolidacion.sql`) lo compara contra `pg_policies` e
`information_schema.role_table_grants` y reporta FALTA / COMANDO DISTINTO /
INESPERADA / CRÍTICO. De paso corrigió un descuido real en `verificar_rls()`:
llevaba dos migraciones (014 y 018) sin vigilar `enlaces_escaneo_remoto` ni
`respaldos_log`. También se cerró una brecha de fidelidad en el arnés de
pruebas local (`pruebas/00_base_supabase.sql` y el `esquema_base()` de
`pruebas/probar-migraciones.py`): no replicaban el `alter default
privileges` que Supabase aplica de fábrica sobre `anon`/`authenticated`, así
que tablas sin `grant` explícito (`auditoria`, `parametros`,
`enlaces_escaneo_remoto`, `respaldos_log`) daban falsos negativos en local.
`pruebas/probar-migraciones.py` en 148/148. Aplicado a producción y
verificado en vivo (impersonando a un admin con `set local
request.jwt.claim.sub`, porque el SQL Editor no tiene JWT propio).

**Nota sobre el registro de la migración**: `apply_migration` volvió a
registrar la 019 con un número de versión tipo timestamp en vez de `019`
(el mismo problema que ya había pasado con la 017 y la 018) — se corrigió a
mano en `supabase_migrations.schema_migrations`. También se descubrió que
los cambios a funciones ya existentes dentro de la 010 (como los de esta
ronda) NO deben generar una fila nueva en `schema_migrations` — solo las
migraciones que corresponden a un archivo local nuevo. Se había registrado
una fila de más por eso y se eliminó.

### Dos bugs cosméticos de Tailwind

`mx-auto` (círculos numerados de `escaneo-remoto.js`) y
`hover:bg-rose-100` (botón de cerrar sesión de `perfil.js`) — clases
usadas en el código pero nunca antes en el proyecto, así que no estaban en
`vendor/css/tailwind.css` (estático, no se recompila solo). Agregadas a
mano al CSS compilado.

### Node 20 → 24 en CI

Los dos `node-version: '20'` de `.github/workflows/pruebas.yml` (jobs
`interfaz` y el par `base-de-datos`/`reconstruccion`) subidos a `'24'` —
GitHub venía avisando que la 20 está deprecada en `actions/setup-node@v4`.

### CI en rojo tras el primer push: dos causas más, sin relación con lo anterior

Al subir el commit fallaron "Consolidación de funciones" y "Base de datos
(PostgreSQL 17)". Ninguna de las dos tiene que ver con las políticas RLS de
arriba:

1. **Las tres funciones nuevas no estaban en `manifiesto_funciones()`.**
   `verificar_consolidacion.py` exige que toda función declarada en la 010
   aparezca en el manifiesto que vigila `verificar_definiciones()` — se me
   pasó agregar `manifiesto_tablas_protegidas`, `manifiesto_politicas` y
   `verificar_politicas`. Corregido (41 → 44 funciones), aplicado a
   producción, y actualizados los dos conteos que quedaban fijos en
   `pruebas/probar_librero.py` (línea "el manifiesto cubre N funciones" y
   la de "un admin SÍ puede ver el autodiagnóstico").
2. **`deshacer_libro_remoto()` no existía en producción — hallazgo real,
   sin relación con nada de hoy.** Al corregir lo anterior, `verificar_definiciones()`
   contra producción (impersonando a un admin con `set local
   request.jwt.claim.sub`) mostró una función `FALTA`: `deshacer_libro_remoto`
   está en `010_consolidacion.sql` y en la prueba local (que instala desde
   cero y por eso nunca lo notó), pero en la base de datos REAL no existía
   — el botón "Deshacer" del escaneo remoto llevaba rota. Restaurada
   directamente en producción con el mismo cuerpo que tiene el archivo
   local; `verificar_definiciones()` vuelve a dar 44/44 en verde.
3. **De paso, dos comprobaciones de `pruebas/probar_librero.py` estaban mal
   escritas** — las descubrió el mismo arreglo de fidelidad del arnés
   (`alter default privileges`) de más arriba, que ahora deja que el
   anónimo local tenga los mismos GRANT de fábrica que en producción:
   - Esperaba que el anónimo NO pudiera leer `parametros`, pero esa tabla
     es pública a propósito desde la migración 007 (`using (true)`, sin
     restringir el rol — son valores de configuración, no datos
     personales). Se cambió por dos comprobaciones correctas: sí puede
     leer, no puede escribir.
   - Esperaba que leer `enlaces_escaneo_remoto` diera un error de permiso,
     pero con RLS activo y cero políticas Postgres no da error: deja pasar
     la consulta y la filtra a cero filas. Se corrigió la comprobación
     para pedir "vuelve vacía" en vez de "falla".

`pruebas/verificar_consolidacion.py`, `pruebas/verificar_llamadas_rpc.py`,
`pruebas/probar-migraciones.py` (148/148) y `pruebas/probar_librero.py`
(107/107, corrido localmente con `pgserver`) en verde, todo aplicado y
verificado en producción antes de este segundo push.

### Pendiente de esta ronda: sincronizar al repositorio

Todo lo de arriba está aplicado y verificado en producción, pero falta
subirlo al repositorio: `vendor/css/tailwind.css`,
`.github/workflows/pruebas.yml`, `supabase/migrations/010_consolidacion.sql`
(editado), `supabase/migrations/019_eliminar_politicas_acceso_total.sql`
(nuevo), `pruebas/00_base_supabase.sql`, `pruebas/probar-migraciones.py`,
`pruebas/probar_librero.py`, `pendientes-checklist.md`, este archivo.

---

## Completado hoy, tercera ronda: script de Tailwind + división de `db.js`

De los tres pendientes 🟡: el checker de clases de Tailwind, la división de
`js/modules/db.js`, y el plan (sin implementar todavía) para dividir
`ui-base.js`.

### Script de verificación estática de clases de Tailwind

`pruebas/verificar_clases_tailwind.py`, mismo espíritu que
`verificar_llamadas_rpc.py` (sin base de datos, sin navegador, sin build
step): extrae toda clase compilada de `vendor/css/*.css` y `css/*.css` con
una regex que entiende el escape de Tailwind (`.hover\:bg-rose-100:hover`,
`.mb-1\.5`), y toda clase usada en `class="..."`, `className=` y
`classList.add/remove/toggle(...)` en `js/**/*.js` y `*.html`. Reporta
cualquier clase usada que no esté compilada ni en la lista de excepciones
(clases usadas solo como marcador para delegación de eventos, como
`admin-tab-btn` — nunca aparecen en un CSS por diseño, y están documentadas
una por una en el propio script).

Punto delicado: el código genera algunas clases con interpolación
(`class="momento-${momento}"`, o un ternario multilínea dentro de
`${...}`). El script protege todo el contenido entre `${` y `}` (incluyendo
saltos de línea, no solo espacios) antes de partir por espacios en blanco, y
descarta cualquier token que todavía contenga `${` — así no genera falsos
positivos con fragmentos sueltos como `momento-` ni rompe un ternario largo
en basura.

**Al correrlo por primera vez encontró 26 clases más sin compilar** —
además de las 2 ya corregidas antes hoy (`mx-auto`,
`hover:bg-rose-100`) — repartidas en `perfil.js`, `ui-base.js`, `admin.js`,
`dashboard.js` y `escaneo-remoto.html`. Ninguna daba error: simplemente no
hacían nada. Se agregaron a mano a `vendor/css/tailwind.css`, con valores
tomados de Tailwind v3 por defecto (confirmado que el tema del proyecto no
está personalizado, comparando contra reglas ya compiladas equivalentes
como `max-w-lg` = 32rem o `w-8` = 2rem). Ya enganchado como paso nuevo del
job `consolidacion` en `.github/workflows/pruebas.yml`.

### `js/modules/db.js` dividido por dominio

Bajó de 1242 a 535 líneas. El resto se movió — sin cambiar ni una línea de
lógica, solo reubicando código — a 12 archivos nuevos bajo `js/modules/db/`:
`compartido.js` (lo común: `supabase`, `conTiempoLimite`, `hoyEnChile`,
`ESPERA`), y uno por dominio — `libros.js`, `lectores.js`, `prestamos.js`,
`administracion.js`, `personal.js`, `perfil.js`, `diagnostico.js`,
`errores-servidor.js`, `enlaces-escaneo.js`, `respaldos.js`,
`cumplimiento.js`, `reportes.js`.

Lo que se quedó físicamente en `db.js` no es arbitrario:
`pruebas/probar-interfaz.mjs` inspecciona el TEXTO LITERAL de ese archivo
con ~14 expresiones regulares (busca `class SyncQueue`, la cola de
sincronización sin conexión completa, y los métodos de circulación —
`registrarPrestamo`, `devolverPrestamo`, `renovarPrestamo`,
`consultarLibro`, `estadoLector` — con su llamada a `colaSync.encolar(...)`
o su fallback sin conexión a pocas líneas de distancia). Convertir `db.js`
en un archivo puente que solo reexporta habría roto esas comprobaciones en
silencio, así que ese código se dejó tal cual, en el mismo archivo.

La superficie pública no cambió ni un carácter: los 7 archivos que hacen
`import { db }`, `import { hoyEnChile }` o `import { colaSync }` desde
`js/modules/db.js` (`ui-base.js`, `estado-conexion.js`,
`js/vistas/{perfil,dashboard,admin,reportes}.js`, `main.js`) siguen
funcionando exactamente igual — `db` sigue siendo el mismo objeto con los
mismos métodos, ahora armado con spreads: `{ ...métodosDeCirculación,
...libros, ...lectores, ...prestamos, ...administracion, ...personal,
...perfil, ...diagnostico, ...erroresServidor, ...enlacesEscaneo,
...respaldos, ...cumplimiento, ...reportes }`.

`sw.js` actualizado: los 13 archivos nuevos agregados a `PRECACHE_URLS`
justo después de `/js/modules/db.js` (si no, la app sin conexión fallaría
al pedir un archivo que nunca se precargó), y `CACHE_VERSION` subida de
`v7` a `v8`.

Las 6 suites de pruebas JS (`probar-interfaz.mjs` 124/124, `probar-vistas.mjs`
106/106, `probar-escaneo-remoto.mjs` 13/13, `probar-persistencia.mjs`
37/37, `probar-sync-queue.mjs` 37/37, `probar-estado-conexion.mjs` 18/18) y
los 3 verificadores de Python (`verificar_consolidacion.py`,
`verificar_llamadas_rpc.py`, `verificar_clases_tailwind.py`) en verde.

### Plan para dividir `ui-base.js` (sin implementar todavía)

Pediste el plan primero, antes de tocar código — ver el mensaje de esta
conversación con el detalle. Queda como el único pendiente 🟡 de esta ronda.

### Pendiente de esta ronda: sincronizar al repositorio

`pruebas/verificar_clases_tailwind.py` (nuevo), `vendor/css/tailwind.css`
(editado, 26 clases más), `.github/workflows/pruebas.yml` (editado — de
nuevo con la protección de escritura del bridge, hay que copiarlo a mano),
`js/modules/db.js` (reescrito) y los 13 archivos nuevos bajo
`js/modules/db/`, `sw.js` (editado, `v8`), `pendientes-checklist.md`, este
archivo.

---

## Cuarta ronda del día: `eliminar_libro()` con historial

Reportaste, con dos capturas del panel, que "La mujer justa" (2 copias, 0
préstamos activos, 1 ya devuelto) rechazaba el borrado con el toast rojo
"No se puede eliminar. Revise si el libro tiene préstamos activos.".

### Diagnóstico

Confirmado contra producción que el libro no tenía ningún préstamo activo
(1 solo préstamo, ya devuelto) — el mensaje era falso. La causa real:
`prestamos.libro_id` tenía una llave foránea hacia `libros(id)` con
`ON DELETE RESTRICT` **en producción**, confirmado con
`pg_get_constraintdef`, sin estar declarada así en ningún archivo del
repo (`pruebas/00_base_supabase.sql` la declara sin `ON DELETE` explícito,
es decir `NO ACTION` — el mismo efecto bloqueante, pero tampoco coincide
con lo real). Misma clase de deriva que ya se encontró antes con una
política RLS de `usuarios` y con las tres políticas de acceso total de la
ronda anterior: algo creado a mano en algún momento, sin quedar en ningún
archivo ni documentado en ninguna sesión. Esa llave rechazaba el borrado
si el libro tenía **cualquier** fila en `prestamos`, sin importar si el
préstamo seguía activo o ya se había devuelto hace tiempo — y
`db.eliminarLibro()` convertía cualquier error de ese `delete` directo en
el mismo mensaje genérico, sin distinguir un caso del otro.

Te pregunté qué preferías: corregir solo el mensaje (rápido, pero el
problema de fondo — no poder eliminar libros con historial ya cerrado —
seguía ahí), o el cambio de fondo. Elegiste el cambio de fondo: **permitir
eliminar un libro si no tiene préstamos activos**, con la idea de que el
título y autor del historial ya devuelto no debían quedar en blanco en los
reportes de períodos pasados.

### Solución implementada

- **`eliminar_libro(p_libro_id bigint)`** — RPC nuevo, `SECURITY DEFINER`,
  declarado en `010_consolidacion.sql` (junto a `corregir_inventario()`,
  bajo "INVENTARIO Y BLOQUEOS") y registrado en `manifiesto_funciones()`
  (44 → 45 funciones). Exige administrador (`es_admin()`), bloquea con el
  mensaje correcto si hay préstamos con `estado = 'activo'`, y si no los
  hay: archiva `titulo`/`autor` en cada préstamo de ese libro (columnas
  nuevas `libro_titulo_archivado`/`libro_autor_archivado` en `prestamos`)
  y recién ahí borra el libro.
- **Columnas de archivo + la llave foránea** — migración nueva
  `020_permitir_eliminar_libro_con_historial.sql`: agrega
  `libro_titulo_archivado`/`libro_autor_archivado` a `prestamos`, y cambia
  `prestamos_libro_id_fkey` a `ON DELETE SET NULL` (no `CASCADE`: el
  préstamo no se borra, solo pierde la referencia a un libro que ya no
  existe — el título y autor ya quedaron archivados por `eliminar_libro()`
  antes de este paso). Las mismas dos columnas y el mismo cambio de llave
  quedan TAMBIÉN declarados en el bloque "EXCEPCIÓN" al principio de
  `010_consolidacion.sql` (mismo patrón que `dias_prestamo_override` en la
  017), porque `eliminar_libro()` los necesita y la 010 se aplica antes
  que la 020 en una instalación desde cero.
- **`js/modules/db/libros.js`** — `eliminarLibro()` ahora llama al RPC en
  vez de un `.delete()` directo, y distingue el error de la migración 020
  sin aplicar del error real que devuelva la función.
- **`js/modules/db/reportes.js`** — `obtenerReporte()` ahora pide también
  las columnas archivadas y, si el libro ya no existe (el join `libros(...)`
  vuelve `null`), rearma `{ titulo, autor }` con lo archivado — así ningún
  consumidor (el ranking "más prestados", el CSV de
  `js/vistas/reportes.js`) necesita saber que el libro se eliminó. Cuidado
  aparte: la clave del ranking pasó de `p.libros?.id` a
  `p.libros?.id ?? p.libros?.titulo`, porque dos libros eliminados
  distintos tendrían `id: null` los dos y se habrían juntado en una sola
  fila del ranking.
- **Pruebas**: 9 comprobaciones nuevas en `pruebas/probar_librero.py`
  (sección "10 bis"), 116/116 en total. Los dos conteos hardcodeados de
  "44 funciones" que ya habían roto una vez en la ronda anterior se
  revisaron y subieron a 45 a propósito, antes de dar el trabajo por
  terminado. `pruebas/probar-migraciones.py` también en verde (150/150).

### Verificado en vivo contra producción

- La migración 020 se aplicó con `apply_migration` (`{"success":true}`) y
  el `010_consolidacion.sql` completo con `execute_sql`.
- `pg_get_constraintdef` confirma `prestamos_libro_id_fkey: FOREIGN KEY
  (libro_id) REFERENCES libros(id) ON DELETE SET NULL`.
- `pg_proc` confirma `eliminar_libro(bigint)` existe con
  `prosecdef = true` (`SECURITY DEFINER`) y sin ninguna firma vieja
  duplicada.
- `verificar_definiciones()` y una prueba en vivo con `eliminar_libro()`
  en una transacción con rollback no se pudieron correr directo desde
  esta sesión — ambas exigen sesión de administrador real (`es_admin()`
  vía `auth.uid()`), que el editor SQL de Supabase no tiene. Se puede
  correr a mano desde el panel, ya con sesión de administrador, con las
  consultas que quedaron escritas en la propia migración 020, sección
  "QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO".

### Pendiente de esta ronda: sincronizar al repositorio

`js/modules/db/libros.js` (editado), `js/modules/db/reportes.js`
(editado), `pruebas/probar_librero.py` (editado),
`supabase/migrations/010_consolidacion.sql` (editado),
`supabase/migrations/020_permitir_eliminar_libro_con_historial.sql`
(nuevo), `pendientes-checklist.md`, este archivo.

---

## Quinta ronda del día: papelera de libros (`restaurar_libro()`)

Aclaraste el pedido real detrás de la ronda anterior: "la idea era eliminar
uno solo o que se pueda editar la cantidad y en la sección de administración
que me permita restaurar si se eliminó por accidente".

### Lo que ya existía y no hacía falta construir

Editar la cantidad de ejemplares de un libro **ya existe**: el modal "Editar
libro" del Catálogo tiene un campo "Ejemplares en total" que pasa por
`ajustar_copias()` — bajarlo de 2 a 1, por ejemplo, quita una copia sin
tocar el historial de préstamos. Se lo confirmé al usuario en vez de
construir un botón nuevo "quitar 1 copia" (opción que ofrecí y no eligió).

### Lo que sí hacía falta: restaurar un libro eliminado por accidente

Alcance acordado con el usuario (tres preguntas, una por decisión): el
campo de cantidad ya alcanza para copias sueltas: no hace falta un botón
nuevo; solo importa poder deshacer un libro eliminado POR COMPLETO (no una
reducción de cantidad); y la papelera va en una pestaña nueva de
Administración, no dentro de una que ya existía.

### Cómo se implementó

Sin ninguna tabla nueva de respaldo. La razón: `registrar_auditoria()`
(migración 005) ya guarda una foto COMPLETA de cada libro
(`to_jsonb(old)`, con todas sus columnas) justo antes de borrarlo, en
`auditoria.datos_antes`, porque `libros` tiene el disparador de auditoría
conectado desde siempre. Lo mismo pasa con el UPDATE que `eliminar_libro()`
hace sobre `prestamos` para archivar título/autor un instante antes de
borrar el libro: también queda una fila de auditoría con el `libro_id` de
antes de archivar.

- **`listar_libros_eliminados()`** (RPC nuevo, admin-only,
  `010_consolidacion.sql`): lee `auditoria` buscando el DELETE más reciente
  de cada libro que todavía no se restauró (no existe una fila viva con ese
  id), y reconstruye título/autor/ISBN/ejemplares desde `datos_antes`.
- **`restaurar_libro(p_libro_id)`** (RPC nuevo, admin-only): reinserta el
  libro en `libros` con el MISMO id (`insert ... overriding system value`,
  posible porque `id` es `generated always as identity` — no cualquier
  identity permite esto, pero el `overriding system value` explícito sí),
  usando los datos archivados en `auditoria`. El truco para reenganchar
  los préstamos correctos: dentro de una misma transacción, `now()` en
  Postgres devuelve siempre el MISMO valor (es el inicio de la
  transacción, no el de cada sentencia) — así que el `created_at` que
  quedó en la fila de auditoría del DELETE de `libros` es idéntico al de
  las filas de auditoría del UPDATE de `prestamos` que archivó su
  título/autor en esa misma llamada a `eliminar_libro()`. Cruzar por ese
  `created_at` exacto (además del `libro_id` archivado) identifica sin
  ambigüedad cuáles préstamos reenganchar — sin necesidad de ninguna
  columna ni tabla puente nueva, y sin riesgo de confundir dos libros
  distintos con el mismo título eliminados en momentos distintos.
- **`021_papelera_libros.sql`** (migración nueva): no agrega ninguna tabla
  ni columna — solo un índice (`auditoria_tabla_registro_idx` sobre
  `(tabla, registro_id, created_at desc)`) para que las dos funciones de
  arriba no tengan que recorrer toda `auditoria`, que solo crece y nunca se
  purga.
- **Administración → Eliminados** (pestaña nueva en `js/vistas/admin.js`):
  tabla de libros pendientes de restaurar, con título, autor, ISBN,
  ejemplares, cuándo y quién los eliminó, y un botón "Restaurar" por fila.
- **`js/modules/db/libros.js`**: `listarLibrosEliminados()` y
  `restaurarLibro(id)`, mismo patrón `esFuncionInexistente` que el resto de
  `db.*` (si falta la migración 021, la pantalla explica qué falta en vez
  de un error genérico).
- `manifiesto_funciones()` actualizado (45 → 47 funciones) —
  `pruebas/probar_librero.py` también actualizado (dos conteos
  hardcodeados, mismo cuidado que la ronda anterior tras el CI en rojo por
  este mismo tipo de olvido).
- `pruebas/verificar_clases_tailwind.py`: `restore-book-btn` (gancho de
  delegación de eventos del botón "Restaurar") agregado a la lista de
  excepciones documentadas, mismo patrón que `delete-book-btn` y el resto.
- `CACHE_VERSION` subida de `v8` a `v9` en `sw.js` (RPC nuevos en un
  archivo ya precacheado, `js/modules/db/libros.js`, y pestaña nueva en
  `admin.js`).

### Verificado

`pruebas/probar-migraciones.py` en verde (152/152),
`pruebas/probar_librero.py` en verde (128/128, 12 comprobaciones nuevas
sobre la papelera: permisos de admin vs. librero, que aparece en la lista
con los datos correctos, que restaurar reengancha el préstamo y limpia el
archivado, que ya no aparece en la lista tras restaurarse, y que restaurar
dos veces da un error claro sin duplicar el libro), las 6 suites de
pruebas JS y los 3 verificadores de Python en verde. Aplicado a producción
(migración 021 vía `apply_migration`, `010_consolidacion.sql` completo vía
`execute_sql`) y confirmado en vivo: `listar_libros_eliminados` y
`restaurar_libro` existen con `security definer`, el índice quedó creado,
y no hay ninguna función duplicada por firma.

### Pendiente de esta ronda: sincronizar al repositorio

`js/modules/db/libros.js` (editado), `js/vistas/admin.js` (editado),
`pruebas/probar_librero.py` (editado),
`pruebas/verificar_clases_tailwind.py` (editado), `sw.js` (editado, `v9`),
`supabase/migrations/010_consolidacion.sql` (editado),
`supabase/migrations/021_papelera_libros.sql` (nuevo),
`pendientes-checklist.md`, este archivo.

---

## Sexta ronda del día: dividida `ui-base.js` (el pendiente 🟡 de la tercera ronda)

Sin base de datos de por medio — solo JavaScript del cliente y dos scripts
de verificación. Ejecutado el plan que quedó pendiente de aprobación en la
tercera ronda, sin cambios respecto a lo planteado ahí.

### La división

`js/modules/ui-base.js` bajó de 3035 a 1626 líneas. Los ~1409 líneas que
salieron eran, en realidad, cuatro vistas distintas metidas dentro de un
bloque marcado internamente como "CATÁLOGO" (el marcador "ADMINISTRACIÓN"
que aparecía justo antes, en cambio, envolvía solo `_avisoMigracion()` — no
había nada de administración ahí, esa vista ya vivía en `admin.js` desde
antes; se le quitó el encabezado engañoso de paso). Mismo patrón que ya
usaban `admin.js`/`dashboard.js`/`perfil.js`/`reportes.js`: cada archivo
nuevo exporta un objeto plano de métodos, y `js/modules/ui.js` los mezcla
todos sobre `UIManager.prototype` con `Object.assign(...)` — `this.metodo()`
sigue funcionando igual sin importar en qué archivo físico quedó cada
método, porque todos terminan en el mismo prototipo.

Nuevos:
- **`js/vistas/catalogo.js`** (287 líneas): `renderCatalog`,
  `_renderBookRows`, `_bindCatalogRowEvents`, `showEditBookModal`,
  `promptCreateLoan`.
- **`js/vistas/lectores.js`** (233 líneas): `renderUsers`,
  `showEditUserModal`.
- **`js/vistas/prestamos.js`** (482 líneas): `renderLoans`,
  `showBulkNotifyModal`, más el flujo de circulación compartido —
  `flujoPrestamo`, `showConfirmarPrestamoModal`, `_resumenLector`,
  `showNuevoLectorModal`, `showLectorModal` — que también usan Catálogo
  (`promptCreateLoan`) y Mesón (`_bindFichaCirculacion`) para iniciar un
  préstamo, así que se quedaron juntos en vez de partir ese flujo en dos
  archivos.
- **`js/vistas/mostrador.js`** (474 líneas): `renderScannerView`,
  `_formularioAltaRapida`, `showQrRemotoModal`, `_fichaCirculacion`,
  `_bindFichaCirculacion`. Se llama "mostrador.js" y no "escaner.js" o
  "scanner.js" para no chocar con `js/modules/scanner.js` (el wrapper de la
  cámara, que esta vista importa).

Lo que se quedó en `ui-base.js` es justo lo transversal: constructor,
validaciones, widgets genéricos (incluida `_bindPaginacion`, compartida por
las tres vistas de tabla), navegación, pantallas de login/autenticación y
`_avisoMigracion`. Import de `db` se mantuvo (se usa en varios lugares que
no se movieron); `buscarPorIsbnExterno` y `generarSvgQr` se sacaron de
`ui-base.js` por quedar sin ningún uso ahí tras el movimiento (pasaron a
importarse en `mostrador.js`, que es donde de verdad se usan); `Scanner`
se quedó en `ui-base.js` porque `switchView()` (código transversal de
navegación) todavía llama a `Scanner.stop()` al salir de la vista Mesón.

`sw.js` actualizado con los 4 archivos nuevos en `PRECACHE_URLS` y
`CACHE_VERSION` de `v9` a `v10`.

### De paso: dos verificaciones que habían quedado ciegas

Ninguna de las dos es un bug de esta ronda — las dos vienen de la división
de `js/modules/db.js` de hace dos días, que dejó `js/modules/ui.js` como un
simple ensamblador de 17 líneas. El plan de esta ronda ya había anotado la
primera como sospecha; la segunda apareció al correr la batería completa
después de mover el código.

- **`pruebas/probar-contraste.mjs`** comparaba las clases de color
  descartadas contra `js/modules/ui.js` — desde la división de `db.js` ese
  archivo no tiene una sola clase de Tailwind, así que la comprobación
  llevaba tiempo dando "sin regresiones" sin revisar nada de verdad.
  Corregido para leer `ui-base.js` + cada archivo de `js/vistas/`. Al
  corregirlo aparecieron **3 usos reales de `text-stone-400` sobre fondo
  claro** (2.52:1, bajo el mínimo 4.5:1 de WCAG AA): dos en "Enlaces
  remotos" y uno en "Eliminados" (la pestaña de la ronda anterior) — los
  tres cambiados a `text-stone-500` (4.80:1). También se encontró que la
  excepción de esa misma comprobación para `glass-panel` estaba mal desde
  siempre: ese panel es vidrio CLARO (`rgba(255,255,255,0.86)` en
  `css/styles.css`), no oscuro — dejaba pasar un cuarto caso real en la
  pantalla de completar invitación ("Cargo (opcional)"), corregido igual a
  `text-stone-500`. Se reemplazó esa excepción por una más puntual
  (`current-user-sub`, el único caso legítimo de `stone-400` en el menú
  lateral oscuro que la comprobación línea por línea no alcanzaba a
  detectar de otra forma, porque el `id="sidebar"` que lo envuelve queda
  varias líneas más arriba).
- **`pruebas/probar-interfaz.mjs`** buscaba los cinco `r?.encolado` (los
  que distinguen "se guardó" de "quedó pendiente sin conexión" en cada
  acción de circulación) contando solo sobre `ui-base.js`. Tras la
  división quedan repartidos: 2 en `mostrador.js`, 3 en `prestamos.js`.
  Corregido para juntar `ui-base.js` con todo `js/vistas/` — pero solo
  para esa comprobación puntual; el resto de la sección (que sí revisa
  contenido que se quedó en `ui-base.js`, como `renderShell` y el
  indicador de conexión) se dejó igual.

### Verificado

Las 8 suites de pruebas JS (`probar-vistas.mjs` 106/106,
`probar-interfaz.mjs` 124/124, `probar-contraste.mjs`, `probar-escaneo-remoto.mjs`
13/13, `probar-estado-conexion.mjs` 18/18, `probar-persistencia.mjs` 37/37,
`probar-sync-queue.mjs` 37/37) y los 3 verificadores de Python
(`verificar_clases_tailwind.py`, `verificar_llamadas_rpc.py`,
`verificar_consolidacion.py`) en verde. Sin cambios de esquema — no hizo
falta correr `probar-migraciones.py` ni `probar_librero.py` (nada tocó
SQL). Se revisó a mano que ningún nombre de método quedara duplicado entre
`ui-base.js` y los cuatro archivos nuevos (el `Object.assign` sobrescribiría
uno con otro en silencio si eso pasara).

### Pendiente de esta ronda: sincronizar al repositorio

`js/modules/ui-base.js` (editado), `js/modules/ui.js` (editado),
`js/vistas/catalogo.js` (nuevo), `js/vistas/lectores.js` (nuevo),
`js/vistas/prestamos.js` (nuevo), `js/vistas/mostrador.js` (nuevo),
`js/vistas/admin.js` (editado, 3 clases de color), `sw.js` (editado, `v10`),
`pruebas/probar-contraste.mjs` (editado), `pruebas/probar-interfaz.mjs`
(editado), `pendientes-checklist.md`, este archivo.
