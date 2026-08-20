# Banco de pruebas

Ejecuta toda la aplicación en un navegador simulado, con la base de datos
reemplazada por datos de prueba. Sirve para detectar errores antes de publicar,
sin tocar tu proyecto real de Supabase.

## Cómo ejecutarlo

Desde la carpeta que contiene `biblionexo/`:

```bash
npm install jsdom
node biblionexo/pruebas/probar-vistas.mjs
```

Termina con código 0 si todo pasa, y 1 si algo falla.

## Qué revisa

- **Funciones puras**: validación de RUT chileno (incluido el dígito
  verificador K), normalización de teléfonos, cálculo de días de vencimiento
  sin corrimiento de zona horaria, y los cuatro rangos de reporte.
- **Seguridad**: que un título con `<script>` quede escapado y no se ejecute.
- **Vistas**: renderiza dashboard, reportes, catálogo, usuarios, préstamos y
  escáner, con ambos roles, y verifica que ninguna quede vacía ni muestre
  "undefined" o "NaN" en pantalla.
- **Casos límite**: libros sin ISBN ni autor, préstamos con relaciones nulas
  (datos huérfanos), lectores sin correo ni teléfono, listas vacías.
- **Modales**: que se abran, se cierren y deshabiliten las vías de contacto
  que no correspondan.
- **Exportación CSV**: que no lance errores y que escape correctamente las
  comillas dobles.
- **Gráficos**: que todos sean de anillo y que ninguno reciba valores negativos.

## Al agregar una vista nueva

Añade su nombre al arreglo de vistas dentro de la sección
`=== Vistas (render completo) ===` y quedará cubierta automáticamente.

---

## Pruebas agregadas en la versión 11

### `probar-interfaz.mjs` — la aplicación en un navegador simulado

Monta la interfaz real sobre un DOM (jsdom) con un Supabase falso, y comprueba
el arranque con rol librero, el menú que le corresponde, la vista Mi perfil, sus
validaciones, y que la cámara del mesón vuelva a encender tras apagarla.

---

## Pruebas agregadas para la Fase 1 (funcionamiento sin conexión)

### `probar-persistencia.mjs` — la copia local en IndexedDB (Fase 1.2)

Prueba `js/modules/persistencia.js` con IndexedDB en memoria (sin navegador)
y un Supabase falso propio. Cubre exactamente lo que exige
`CUMPLIMIENTO-LEGAL.md`, sección "9 bis": que el catálogo se replique entero
por delta, que los lectores NUNCA entren en bloque (solo consultados o con
préstamo activo), que una lápida de borrado del servidor purgue la copia
local (el derecho de supresión), y que un lector sin actividad se purgue solo
por antigüedad.

```bash
npm install jsdom fake-indexeddb --no-save
node pruebas/probar-persistencia.mjs
```

**Importante:** instala las dos juntas, en el mismo comando. Como este
proyecto no tiene `package.json` (a propósito, ver `.gitignore`), cada
`npm install <paquete>` sin uno recalcula todo `node_modules` desde cero y
puede desinstalar silenciosamente lo que ya tenías. Ya pasó una vez armando
esta prueba: instalar `fake-indexeddb` solo se llevó `jsdom` por delante.

### Sección 10 de `probar-interfaz.mjs` — el service worker y el manifest (Fase 1.1)

No es un archivo aparte: son comprobaciones estructurales agregadas a
`probar-interfaz.mjs` que verifican `sw.js` (los tres eventos del ciclo de
vida, caché versionada, qué precarga y qué NO precarga a propósito) y
`manifest.json` (JSON válido, campos obligatorios), sin necesitar un
navegador real para eso.

```bash
npm install jsdom
node pruebas/probar-interfaz.mjs
```

### `probar_librero.py` — la base de datos de verdad

Levanta un PostgreSQL local, ejecuta las ocho migraciones y prueba el sistema
con dos identidades reales (una admin y una librero), usando el mismo mecanismo
que usa Supabase para saber quién eres.

Lo importante: **primero reinstala las funciones como estaban antes de la
migración 008 y demuestra el fallo**, y recién después aplica la corrección y
verifica que el librero puede trabajar sin haber ganado permisos de más.

```bash
pip install pgserver "psycopg[binary]"
python3 pruebas/probar_librero.py
```

`00_base_supabase.sql` reconstruye lo que Supabase provee de fábrica (esquema
`auth`, roles `anon` y `authenticated`, `auth.uid()`) más las tablas base, para
que las migraciones se puedan ejecutar fuera de Supabase.

---

## Pruebas agregadas en la versión 13

### `verificar_consolidacion.py` — la regla de la consolidación

Lee los archivos SQL (no la base de datos) y falla si alguien vuelve a la
costumbre de redefinir una función en un archivo nuevo en vez de editar la 010.
Comprueba tres cosas:

- ninguna migración posterior a la 010 redefine funciones consolidadas
- el manifiesto cubre todas las funciones declaradas
- las 15 funciones que escriben son `security definer`

Esa última es la que habría atajado el fallo del librero en el momento de
escribirlo.

```bash
python3 pruebas/verificar_consolidacion.py
```

### `probar_librero.py` ahora corre en cualquier parte

Acepta `DATABASE_URL` para usar un PostgreSQL existente (así funciona en
integración continua), o levanta uno con `pgserver` si no se le indica nada.

```bash
# Con PostgreSQL propio
DATABASE_URL=postgresql://usuario:clave@localhost:5432/basededatos \
  python3 pruebas/probar_librero.py

# Sin instalar nada
pip install pgserver "psycopg[binary]" && python3 pruebas/probar_librero.py
```

Incluye un bloque nuevo que comprueba que `verificar_definiciones()` detecta las
tres formas de deriva y que reejecutar la 010 las repara.

### En Windows: preparar pgserver antes de la primera corrida

`pgserver` no trae `share/postgresql/timezone` en su paquete para Windows (el
porqué está en la sección siguiente). Antes de la primera corrida en Windows,
prepáralo:

    python pruebas/preparar_timezone_pgserver.py

Busca una instalación de PostgreSQL para Windows ya en el equipo y le copia la
carpeta de zonas horarias a `pgserver`. Si no encuentra ninguna, dice cómo
instalar una (`winget install PostgreSQL.PostgreSQL.17`) o cómo indicarle la
ruta con `--donante`. Es idempotente: correrlo de nuevo cuando ya está listo no
hace nada.

**Esa carpeta vive dentro de `site-packages`, no en este repositorio.**
Cualquier reinstalación de `pgserver` —`pip install --upgrade`, rehacer el
entorno virtual, un equipo nuevo— la borra sin avisar. Si `probar_librero.py`
vuelve a mostrar comprobaciones OMITIDAS después de haber corrido las 90, corre
este script de nuevo antes de sospechar de otra cosa.

### Limitación conocida: timezone en el entorno local de Windows

`pgserver`, el PostgreSQL embebido que usa `probar_librero.py` para no depender
de un servidor externo, no trae la carpeta `share/postgresql/timezone` en su
paquete para Windows. Sin ella, Postgres no resuelve ninguna zona horaria real
(cae a GMT), y `prestar_libro`, `renovar_prestamo`, `devolver_prestamo`,
`estado_lector` y `consultar_libro` la necesitan (todas llaman a
`hoy_chile()`, que hace `timezone('America/Santiago', now())`).

`probar_librero.py` lo detecta con una única comprobación al arrancar
(`select timezone('America/Santiago', now())`). Si falla exactamente por esa
causa, los 12 casos que dependen de esas cinco funciones se marcan OMITIDO,
no FALLO, con aviso explícito. Si la comprobación falla por cualquier otra
causa —conexión caída, esquema a medio aplicar— la suite se detiene con error
en vez de omitir: un entorno roto no es lo mismo que un entorno sin tzdata, y
tratarlo igual escondería un problema real. Si la comprobación pasa, las cinco
funciones corren igual que el resto de la suite, y cualquier fallo suyo cuenta
como FALLO real, sin excepción.

Importa especialmente porque son las mismas funciones donde ya ocurrió el
colapso silencioso del rol librero (ver `CLAUDE.md` y `MIGRACIONES.md`): sin
esta distinción, la única suite que las prueba contra PostgreSQL real —esta—
quedaría ciega justo ahí, pero solo en este paquete. En el trabajo
`base-de-datos` de `.github/workflows/pruebas.yml` este mismo script corre
contra la imagen oficial `postgres:16` (con tzdata completo de fábrica, a
diferencia de `pgserver`), así que ahí la comprobación pasa y las cinco
funciones se prueban de verdad, autenticadas: cada llamada pasa por
`como(LIBRERO, …)` o `como(ADMIN, …)` —el helper que hace
`set role authenticated` más `set_config('request.jwt.claim.sub', …)`, la
misma simulación de sesión que usa el resto del script. No hay, en el código,
un camino sin esa guarda para estas cinco funciones.

Mientras no se corra `preparar_timezone_pgserver.py` (sección anterior), un
resultado de `probar_librero.py` en Windows de 84 comprobaciones correctas,
0 con fallo y 13 omitidas es el esperado, no una regresión. (Antes de la
Fase 1.2 —lápidas de eliminación, migración 015— era 78 y 12: la sección
nueva agrega 7 comprobaciones, una de ellas sensible al mismo huso horario
que las demás omitidas en Windows.)

Al inspeccionar el paquete directamente (no en la salida de la suite), la
carencia se manifiesta como `could not open directory
".../pgserver/pginstall/share/postgresql/timezone"`. Es la pista útil para
quien tenga que depurar el paquete a mano.

## Integración continua

`.github/workflows/pruebas.yml` corre cuatro trabajos en cada envío:

| Trabajo | Qué hace |
|---|---|
| `consolidacion` | Lee los archivos SQL, segundos |
| `interfaz` | DOM simulado con jsdom (`probar-interfaz.mjs`) + IndexedDB en memoria con fake-indexeddb (`probar-persistencia.mjs`, Fase 1.2) |
| `base-de-datos` | PostgreSQL 16 real |
| `reconstruccion` | Rehace la base con el CLI de Supabase desde cero |

El último es el más valioso: si la base se puede reconstruir desde los archivos,
los archivos son coherentes.
