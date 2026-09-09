# BiblioNexo — Puesta en marcha

Sistema de préstamos de la Biblioteca Pública Municipal de Futrono.

## 1. Ejecutar las migraciones

En Supabase → **SQL Editor**, ejecuta los archivos de `supabase/migrations/`
**en orden numérico**. Cada uno depende de los anteriores.

| Archivo | Qué hace |
|---|---|
| `001_prestamos_atomicos.sql` | Préstamos y devoluciones sin condición de carrera |
| `002_generos_ubicacion_limite.sql` | Género, ubicación y límite de préstamos |
| `003_rol_admin_y_contacto.sql` | Rol de administrador y función `es_admin()` |
| `004_reportes_portadas_zona_horaria.sql` | Fechas de préstamo, portadas, horario de Chile |
| `005_renovaciones_auditoria_busqueda.sql` | Renovaciones, auditoría, búsqueda sin acentos |
| `006_bloqueo_inventario_admin.sql` | Bloqueo de lectores, inventario, herramientas de administración |
| `007_correcciones_y_cumplimiento_legal.sql` | Correcciones críticas y cumplimiento de la Ley 21.719 |
| `008_perfiles_y_permisos_librero.sql` | **Corrige el rol librero**, políticas RLS versionadas y perfiles del personal |
| `009_registro_de_errores.sql` | Bitácora técnica de fallos, en la propia base de datos |
| `010_consolidacion.sql` | **Única definición viva de las 33 funciones**, con manifiesto verificable |
| `011_marcas_de_sincronizacion.sql` | Columna `actualizado_en` y disparadores, para sincronizar sin conexión solo lo que cambió |
| `012_permisos_auth_users.sql` | Permisos sobre `auth.users` que necesitan `mi_perfil()`, `listar_personal()` y otras |
| `013_politicas_usuarios.sql` | Políticas RLS: autoprovisión de la propia fila en `usuarios`, solo admins cambian roles |

> **Desde la 010, las funciones se modifican editando ese archivo, nunca agregando otro.**
> Para el esquema (tablas, columnas, índices) sí se agrega uno nuevo: `011_...`.
> Ver [MIGRACIONES.md](MIGRACIONES.md).

## Aplicar migraciones

```bash
supabase migration list --linked   # ver qué falta
supabase db push                   # aplicar lo pendiente
```

La primera vez hay que establecer la línea base, porque las 001-009 se aplicaron
a mano y el CLI no lo sabe:

```bash
supabase migration repair --status applied 001 002 003 004 005 006 007 008 009 --linked
```

## Pruebas

```bash
python3 pruebas/verificar_consolidacion.py   # regla de la consolidación
node pruebas/probar-interfaz.mjs             # interfaz sobre DOM simulado
python3 pruebas/probar_librero.py            # base de datos real
```

Las tres corren solas en cada envío al repositorio (`.github/workflows/pruebas.yml`).

En `003` hay que **cambiar el correo** por el del administrador real antes de
ejecutarlo.

Si abres una sección y aparece "Falta un paso en la base de datos", es que su
migración no se ha ejecutado. La aplicación no se rompe: te dice cuál falta.

## 2. Configurar la autenticación

En Supabase → **Authentication**:

- **URL Configuration** → fija el *Site URL* con la dirección real donde
  publicarás el sistema, y agrégala en *Redirect URLs*. Sin esto, el enlace de
  recuperación de contraseña y el retorno de Google llegan roto.
- **Providers** → habilita *Google* si quieres el botón "Continuar con Google".
- **Users** → crea aquí las cuentas del personal. Los roles se asignan después
  desde la aplicación, en Administración → Personal.

## 3. Publicar con HTTPS

Las cabeceras de seguridad ya vienen listas en `vercel.json`. Se copian con
el resto de la carpeta. Hacen falta porque `frame-ancestors` —la que impide
el clickjacking— el navegador la ignora si llega en un `<meta>`.


**Obligatorio para el lector de códigos.** Los navegadores solo permiten usar
la cámara en sitios con certificado. Vercel lo da sin costo. Si abres el
sistema por HTTP, el mesón te avisa en pantalla y puedes seguir escribiendo
los ISBN a mano.

## 4. Verificar las políticas RLS

**Esto no lo resuelve el código.** Ocultar un botón no impide nada: cualquiera
puede abrir la consola del navegador y llamar la función directamente. Lo único
que separa de verdad a un librero de un administrador son las políticas RLS.

Comprueba que existan políticas que exijan `es_admin()` para `DELETE` y
`UPDATE` en `libros` y `lectores`. Para probarlo de verdad: entra con una
cuenta de librero e intenta eliminar un libro desde la consola. Si lo logra,
faltan políticas.

## 5. Ajustar los datos de la biblioteca

En `js/config.js`, la sección `BIBLIOTECA` trae dirección y teléfono de
ejemplo. Se usan al final de cada aviso que se envía a los lectores, así que
conviene corregirlos antes de empezar.

## Cómo funciona el bloqueo

Un lector no puede llevar libros en tres situaciones:

1. **Tiene un libro atrasado.** Es automático y se levanta solo al devolverlo.
   Es la consecuencia que se le advierte en los avisos.
2. **Alcanzó el máximo de préstamos** (3 por defecto).
3. **Bloqueo administrativo**, aplicado a mano con un motivo escrito, desde
   Administración → Bloqueados.

El límite de préstamos y el de renovaciones están escritos **en dos lugares**:
en `js/config.js` y dentro de las funciones SQL. El que manda es el de SQL; el
de `config.js` solo se usa para mostrar el número en pantalla. Si cambias uno,
cambia el otro.

## Pruebas

```bash
npm install jsdom
node pruebas/probar-vistas.mjs
```

Ejecuta la aplicación completa contra datos de prueba y revisa que ninguna
vista se rompa. Conviene correrlo después de cada cambio.
