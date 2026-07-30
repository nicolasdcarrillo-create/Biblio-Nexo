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

## Integración continua

`.github/workflows/pruebas.yml` corre cuatro trabajos en cada envío:

| Trabajo | Qué hace |
|---|---|
| `consolidacion` | Lee los archivos SQL, segundos |
| `interfaz` | DOM simulado con jsdom |
| `base-de-datos` | PostgreSQL 16 real, 66 comprobaciones |
| `reconstruccion` | Rehace la base con el CLI de Supabase desde cero |

El último es el más valioso: si la base se puede reconstruir desde los archivos,
los archivos son coherentes.
