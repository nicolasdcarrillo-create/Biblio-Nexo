# Configuración de Supabase, paso a paso

Sigue los pasos **en orden**. Cada uno depende del anterior.
Tiempo estimado: 40 minutos.

---

## Paso 0 · Antes de empezar

Verifica el tipo de tus columnas. De esto depende que las funciones funcionen.
En **SQL Editor**, ejecuta:

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('libros','lectores','prestamos','usuarios')
order by table_name, ordinal_position;
```

Las migraciones se probaron contra los dos casos posibles (`text` + `bigserial`
y `varchar` + `serial`), así que cualquiera de los dos funciona. Solo guarda el
resultado por si algo falla después.

**Haz un respaldo antes de continuar:** Database → Backups → Download.

---

## Paso 1 · Ejecutar las migraciones

En **SQL Editor**, abre cada archivo de `supabase/migrations/`, pega su
contenido y ejecútalo. **Uno a la vez y en este orden:**

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `001_prestamos_atomicos.sql` | Préstamos y devoluciones sin condición de carrera |
| 2 | `002_generos_ubicacion_limite.sql` | Género, ubicación, límite de préstamos |
| 3 | `003_rol_admin_y_contacto.sql` | Rol de administrador y función `es_admin()` |
| 4 | `004_reportes_portadas_zona_horaria.sql` | Fechas de préstamo, portadas, horario de Chile |
| 5 | `005_renovaciones_auditoria_busqueda.sql` | Renovaciones, auditoría, búsqueda sin acentos |
| 6 | `006_bloqueo_inventario_admin.sql` | Bloqueo de lectores, inventario, administración |
| 7 | `007_correcciones_y_cumplimiento_legal.sql` | Correcciones críticas y cumplimiento legal |
| 8 | `008_perfiles_y_permisos_librero.sql` | **Corrige el rol librero**, políticas RLS y perfiles del personal |
| 9 | `009_registro_de_errores.sql` | Bitácora técnica de fallos, en la propia base de datos |
| 10 | `010_consolidacion.sql` | **Única definición viva de las 33 funciones** |
| 11 | `011_marcas_de_sincronizacion.sql` | Columna `actualizado_en` y disparadores, para sincronizar sin conexión solo lo que cambió |
| 12 | `012_permisos_auth_users.sql` | Permisos sobre `auth.users` que necesitan `mi_perfil()`, `listar_personal()` y otras |
| 13 | `013_politicas_usuarios.sql` | Políticas RLS: autoprovisión de la propia fila en `usuarios`, solo admins cambian roles |

> Desde la versión 10 las migraciones **no se copian y pegan**: se aplican con
> `supabase db push`. Ver [MIGRACIONES.md](MIGRACIONES.md), que explica por qué el
> copiar-y-pegar fue la causa raíz del fallo del rol librero.

**Antes de ejecutar la 003**, ábrela y cambia el correo por el del
administrador real. Aparece en una línea así:

```sql
where email = 'nicolasd.carrillo@gmail.com';
```

Ese usuario debe haber iniciado sesión al menos una vez, o la consulta no
insertará nada.

### Reglas importantes

- **No saltes ninguna.** Cada una depende de las anteriores.
- **No vuelvas atrás.** Las migraciones 5, 6 y 7 redefinen las mismas
  funciones: reejecutar la 005 después de la 007 revierte las correcciones.
  PostgreSQL te avisará con un error, que es la salida segura.
- **Reejecutar la 007 sí es seguro** y es la forma de reparar si algo quedó a
  medias.

### Verificación

```sql
select routine_name from information_schema.routines
where routine_schema = 'public' order by routine_name;
```

Deben aparecer las 18: `ajustar_copias`, `anonimizar_lector`, `asignar_rol`,
`bloquear_lector`, `buscar_libros`, `consultar_libro`, `corregir_inventario`,
`devolver_prestamo`, `es_admin`, `estado_lector`, `evidencia_incidente`,
`exportar_datos_lector`, `hoy_chile`, `listar_personal`, `parametro_int`,
`prestar_libro`, `purgar_datos_antiguos`, `registrar_auditoria`,
`renovar_prestamo`, `revisar_inventario`, `sin_acentos`, `verificar_rls`.

---

## Paso 2 · Políticas RLS

**Desde la versión 008, este paso ya no es manual.** Las políticas se aplican
solas al ejecutar `008_perfiles_y_permisos_librero.sql`, junto con el resto de
las migraciones.

Antes estaban escritas aquí para copiar y pegar, y eso era un problema: un paso
manual que hay que recordar es un paso que en algún momento no se hace, y
nadie se entera hasta que algo falla.

### Qué queda permitido

| Tabla | Consultar | Agregar | Editar | Eliminar |
|---|---|---|---|---|
| `libros` | personal | personal | admin | admin |
| `lectores` | personal | personal | admin | admin |
| `prestamos` | personal | *solo por función* | *solo por función* | admin |
| `usuarios` | su propio perfil, o admin | admin | admin | admin |

Los préstamos no se escriben nunca de forma directa. Pasan por
`prestar_libro`, `devolver_prestamo` y `renovar_prestamo`, que son las que
aplican el control de stock, el límite por lector y el bloqueo por atraso.

El librero puede corregir el nombre, el correo y el teléfono de un lector a
través de `actualizar_contacto_lector`, sin abrir la tabla a escritura libre y
sin poder tocar el RUT.

### Por qué esto importa más de lo que parece

Hasta la versión 007 había un fallo que dejaba al librero sin poder trabajar, y
que era difícil de ver porque en parte era silencioso.

Las funciones de circulación corrían con los permisos de quien las llamaba
(sin `security definer`), y las políticas de arriba no permiten que un librero
escriba en `libros`. Además, `prestamos` no tenía ninguna política de INSERT ni
de UPDATE, para nadie.

El resultado, con una cuenta de librero:

- **Prestar** fallaba con un error visible de RLS.
- **Devolver** y **renovar** no fallaban: RLS convierte un UPDATE sin política
  en cero filas afectadas, sin error. La pantalla decía «Devolución
  registrada», el aviso salía en verde, y en la base de datos no cambiaba nada.
  El libro quedaba prestado para siempre y el stock nunca volvía.

La migración 008 corrige las dos mitades: declara las funciones
`security definer` con un control de acceso explícito adentro, y trae las
políticas consigo.

### Verificación automática

```sql
select * from public.verificar_rls();          -- las 6 tablas: "Correcto"
select * from public.verificar_circulacion();  -- las 9 funciones: "Correcto"
```

Ambas también se ven dentro del sistema, en **Administración → Cumplimiento**.

### Verificación manual (la que de verdad importa)

Ninguna consulta reemplaza esto:

1. Crea una cuenta de prueba y déjala con rol `librero`.
2. Inicia sesión con ella.
3. **Presta un libro y devuélvelo.** Confirma en la tabla `libros` que el
   `stock` bajó al prestar y volvió al número anterior al devolver. Si el
   aviso sale en verde pero el número no se mueve, falta la migración 008.
4. Abre la consola del navegador (F12) e intenta borrar un libro:

```js
const { error } = await window.supabase
  .createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  .from('libros').delete().eq('id', 1);
console.log(error ? 'BLOQUEADO correctamente' : 'FALLA: el librero pudo borrar');
```

Si no aparece un error, faltan políticas.

---

## Paso 3 · Autenticación

En **Authentication → URL Configuration**:

- **Site URL**: la dirección real donde publicarás el sistema.
  Ejemplo: `https://biblioteca.futrono.cl`
- **Redirect URLs**: agrega la misma dirección.

Sin esto, el enlace de recuperación de contraseña y el retorno de Google llegan
rotos.

En **Authentication → Providers → Google** (opcional):
habilítalo si quieres el botón "Continuar con Google". Necesitas un ID y secreto
de cliente desde Google Cloud Console, con la URL de retorno que Supabase te
indique.

En **Authentication → Providers → Email**:
sube la longitud mínima de contraseña a 12 caracteres. Es un sistema del Estado
que trata datos personales.

---

## Paso 4 · Crear el personal

En **Authentication → Users → Add user**, crea una cuenta por cada persona.
**No compartan cuentas**: la bitácora de auditoría registra quién hizo cada
cosa, y con cuentas compartidas ese registro pierde todo valor.

Luego, dentro del sistema, en **Administración → Personal**, asigna el rol de
cada una. Todas empiezan como `librero`.

Pídele a cada persona que entre a **Mi perfil** y complete su nombre y su
cargo. La bitácora de auditoría registra quién hizo cada cosa, y ese registro
vale bastante más cuando dice un nombre en vez de una dirección de correo.

---

## Paso 5 · Datos de la biblioteca

En **Administración → Cumplimiento → Parámetros del sistema** ajusta los
valores según la política de la biblioteca:

| Parámetro | Predeterminado | Qué controla |
|---|---|---|
| `max_prestamos_por_lector` | 3 | Préstamos simultáneos |
| `max_renovaciones` | 2 | Renovaciones por préstamo |
| `dias_prestamo` | 7 | Duración del préstamo |
| `dias_aviso_previo` | 3 | Cuándo se avisa antes de vencer |
| `retencion_prestamos_anios` | 5 | Conservación de datos personales |

Y en `js/config.js`, corrige la sección `BIBLIOTECA` con la dirección y el
teléfono reales: aparecen al final de cada aviso que se envía a los lectores.

---

## Paso 6 · Publicar con HTTPS

La cámara del Mesón **no funciona sin certificado**: los navegadores solo dan
acceso a la cámara en sitios con HTTPS. Vercel lo da gratis.

Sube la carpeta completa, incluida `vendor/`.

### Las cabeceras de seguridad ya vienen listas

El proyecto trae `vercel.json` con la configuración lista. Se copia con el
resto y funciona solo.

### Por qué hacen falta si la CSP ya está en el `<meta>`

Porque hay directivas que **el navegador ignora cuando llegan por `<meta>`**:

- `frame-ancestors` — impide que alguien monte el sistema dentro de un marco en
  otro sitio y superponga botones falsos. Con la sesión ya abierta en el mesón,
  ese ataque no necesita la contraseña.
- `sandbox`, `report-uri`, `report-to` — mismo caso.

Tenerlas escritas en el `<meta>` es **peor** que omitirlas: dan la impresión de
una protección que no existe, y el navegador lo reclama en la consola:

> The Content Security Policy directive 'frame-ancestors' is ignored when
> delivered via a `<meta>` element.

Por eso el `<meta>` de `index.html` ya no la incluye, y va solo en estos
archivos.

### GitHub Pages

No permite definir cabeceras. Si publicas ahí, `js/arranque.js` trae un respaldo
en JavaScript que detecta si la página quedó dentro de un marco ajeno y se niega
a mostrar contenido. Es menos sólido que la cabecera — un marco con el atributo
`sandbox` puede impedir la salida — así que si tienes la opción, prefiere
Vercel.

### Comprobar que quedaron activas

Abre la consola del navegador (F12), pestaña **Network**, recarga, y pincha el
documento principal. En **Response Headers** deben aparecer
`content-security-policy` y `x-frame-options`.

O desde la terminal:

```bash
curl -sI https://tu-sitio.cl | grep -i "content-security-policy\|x-frame-options"
```

Si no aparecen, el archivo de cabeceras no se subió o el servidor no lo está
leyendo.

## Paso 7 · Respaldos

El plan gratuito de Supabase **pausa los proyectos inactivos** tras una semana
sin uso. Para una biblioteca en operación eso significa que un lunes en la
mañana el sistema no responde. Evalúa el plan de pago.

Define además quién descarga el respaldo y cada cuánto:
**Administración → Reportes → Respaldo completo** genera un archivo JSON con
todo. Guárdalo fuera de Supabase.

---

## Paso 8 · Comprobación final

Recorre esta lista con el sistema publicado:

- [ ] Ingreso con correo y contraseña
- [ ] Recuperar contraseña: llega el correo y el enlace permite cambiarla
- [ ] El administrador ve la sección Administración; un librero, no
- [ ] Administración → Cumplimiento: las seis tablas dicen "Correcto"
- [ ] Agregar un libro y un lector
- [ ] Mesón: escanear un código muestra el libro
- [ ] Prestar: pide el RUT y muestra la situación del lector antes de confirmar
- [ ] Prestar a un RUT no registrado ofrece registrarlo
- [ ] Un lector con libro atrasado no puede llevar otro
- [ ] Devolver un libro libera el bloqueo
- [ ] Renovar extiende el plazo; un préstamo atrasado no se puede renovar
- [ ] Avisar abre WhatsApp y correo con el mensaje redactado
- [ ] Reportes: los cuatro períodos, exportar CSV e imprimir
- [ ] Respaldo completo descarga el archivo
- [ ] La cámara del escáner se activa (confirma que hay HTTPS)

---

## Si algo falla

| Mensaje | Causa | Solución |
|---|---|---|
| "Falta ejecutar la migración N" | Esa migración no se aplicó | Ejecútala en SQL Editor |
| "cannot change return type of existing function" | Se reejecutó una migración anterior | Vuelve a ejecutar solo la 007 |
| "structure of query does not match function result type" | Tipos de columna distintos | Reejecuta la 007, que trae los cast |
| El enlace del correo no funciona | Falta el Site URL | Paso 3 |
| La cámara no se activa | El sitio está en HTTP | Paso 6 |
| Un librero puede borrar | Faltan políticas RLS | Paso 2 |
| Todo deja de guardarse | Suele ser la auditoría | Reejecuta la 007 |

---

## Verificar antes de publicar

Desde la carpeta del proyecto:

```bash
# Comportamiento e interfaz (92 pruebas)
npm install jsdom && node pruebas/probar-vistas.mjs

# Contraste de color
node pruebas/probar-contraste.mjs

# Migraciones contra un PostgreSQL real (72 pruebas)
pip install pgserver --break-system-packages
python3 pruebas/probar-migraciones.py
```

Las tres deben terminar sin fallas.
