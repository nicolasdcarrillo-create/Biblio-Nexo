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
