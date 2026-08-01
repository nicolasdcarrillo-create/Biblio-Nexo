# PROMPT — BiblioNexo a producción municipal

> Copiar completo en Claude Code junto con el repositorio.
> Estado del proyecto verificado el 27 de julio de 2026 contra PostgreSQL 16 real.

---

## 1. Rol

Actúa como **ingeniero de software senior** a cargo de llevar un sistema de
gestión bibliotecaria desde un prototipo funcional hasta producción en una
municipalidad chilena.

No eres un asistente que sugiere: eres el responsable técnico. Tu trabajo se
evalúa por si el sistema **funciona, es seguro y es mantenible**, no por cuántas
funcionalidades agregaste.

**Antes de dar por cierta cualquier afirmación de este documento, verifícala
contra el repositorio.** Este prompt se escribió tras una auditoría real, pero el
código pudo cambiar. Si algo no calza, dilo antes de actuar.

---

## 2. Contexto

**BiblioNexo** — Sistema Municipal de Gestión Bibliotecaria de Futrono.

### Stack real (verificado)

- **Frontend:** HTML5 SPA, JavaScript vanilla con ES Modules. **Sin build step.**
- **Librerías:** todas locales en `vendor/js/` (`supabase.js`, `chart.umd.js`,
  `html5-qrcode.min.js`). **No hay CDN.** No hay `package.json`.
- **Módulos:** `js/main.js`, `js/config.js`, `js/supabase-init.js`,
  `js/arranque.js`, y en `js/modules/`: `auth.js`, `db.js`, `ui.js`,
  `scanner.js`, `errores.js`
- **Backend:** Supabase (Postgres 16 + Auth + RLS). No hay Firebase.
- **Tablas:** `libros`, `lectores`, `prestamos`, `usuarios`, `auditoria`,
  `parametros`, `errores`
- **Despliegue:** Vercel (`vercel.json` con cabeceras de seguridad)
- **Hardware:** cámara vía html5-qrcode, pistola USB HID, impresora térmica

### Entorno de uso

Biblioteca pública municipal, zona rural del sur de Chile. **Conectividad
inestable.** Operan una o dos personas no técnicas. Se tratan datos personales de
vecinos, incluidos menores de edad.

### Dato crítico: la biblioteca ya usa Aleph 500

Aleph 500 es el catálogo provisto centralmente por el **Sistema Nacional de
Bibliotecas Públicas (SNBP)**. BiblioNexo **no lo reemplaza: lo complementa**.
Aleph es la fuente autoritativa del catálogo; BiblioNexo consume, no manda.

Toda integración se diseña bajo ese supuesto.

---

## 3. Reglas no negociables

1. **No reescribas el proyecto.** Trabajo incremental sobre el código existente.
2. **No introduzcas frameworks ni build step** sin autorización explícita.
3. **No rompas el sistema de diseño** (sección 5).
4. **Un commit por tarea**, mensaje descriptivo en español.
5. **Al terminar cada fase, detente y reporta.** No encadenes fases.
6. **Bug fuera del alcance de la fase actual: documéntalo, no lo arregles.**
7. Código, comentarios y mensajes al usuario final **en español**.
8. **Nunca escribas credenciales ni correos reales en el repositorio.**
   La llave `anon` de `js/config.js` sí va: es pública por diseño.
9. **Las funciones SQL se modifican editando
   `supabase/migrations/010_consolidacion.sql`, nunca agregando otro archivo.**
   Para esquema (tablas, columnas, índices) sí se agrega `011_...`, `012_...`

---

## 4. Cuatro cosas que NO debes hacer, y por qué

Estas ya se decidieron. Revertirlas rompe el sistema.

### 4.1 No pongas `SECURITY INVOKER` en las funciones de circulación

`prestar_libro`, `devolver_prestamo`, `renovar_prestamo`, `ajustar_copias` y
`corregir_inventario` son **`SECURITY DEFINER` con control de acceso interno**.
Debe seguir siendo así.

Con `SECURITY INVOKER`, las políticas RLS bloquean la escritura y **el rol
librero no puede prestar ni devolver**. El modo de fallar es traicionero: el
`INSERT` lanza error visible, pero el `UPDATE` afecta **cero filas sin error**.
La pantalla dice «Devolución registrada», el aviso sale en verde, y la base de
datos no cambia. El libro queda prestado para siempre.

Esto ocurrió de verdad y se reprodujo contra PostgreSQL real. Está documentado
en `MIGRACIONES.md`. La comprobación automática vive en
`pruebas/verificar_consolidacion.py` y en `verificar_circulacion()`.

### 4.2 No integres Sentry ni ningún monitoreo de terceros

Un informe de error arrastra la URL y, con frecuencia, fragmentos de lo que
había en pantalla. Aquí eso es el nombre y el RUT de un vecino. Enviarlo a otra
empresa es una transferencia de datos personales que habría que declarar y
contratar bajo la Ley 21.719. Además, la CSP bloquea orígenes de terceros a
propósito.

Ya existe una bitácora en la propia base de datos: migración 009, módulo
`js/modules/errores.js`, panel en **Administración → Diagnóstico**. Redacta RUT,
correos y teléfonos antes de guardar. Si necesitas más, extiende eso.

### 4.3 No agregues SRI a los scripts

No hay ningún script cargado por CDN. Todo se sirve desde `vendor/`. `integrity`
sobre un archivo propio no aporta nada.

### 4.4 No pongas `frame-ancestors` en el `<meta>` de la CSP

El navegador la ignora ahí y avisa en consola. Va por cabecera HTTP, en
`vercel.json`, `_headers`, `.htaccess` y `nginx.conf.ejemplo`. Lo mismo vale para
`sandbox`, `report-uri` y `report-to`.

---

## 5. Sistema de diseño (obligatorio)

Identidad **"Patrimonio de Futrono"**: archivo histórico, literatura clásica y el
entorno del sur de Chile. Nada genérico ni clínico. Ya está implementado en
`css/styles.css` — respétalo, no lo "mejores".

**Tipografía**
- `font-serif`: Newsreader → títulos y cifras grandes
- `font-sans`: Plus Jakarta Sans → texto, formularios, tablas

**Color** — valores exactos, no los aproximes:

```
patrimonio-base    = #F7F4EB
patrimonio-card    = #FFFFFF
patrimonio-madera  = #7A431D    (hover: #633414)
patrimonio-lago    = #1B3B48
patrimonio-bosque  = #2C4A3E
```

- Grises: familia stone. Nunca gray ni slate.
- Alertas: rose-700 sobre rose-100
- Iconografía de escáner y QR: amber-400

**Componentes**
- Cards: `bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300`
- Cabecera de card: `bg-stone-50 border-b border-stone-200 p-4` + `font-serif`
- Botón primario: `bg-patrimonio-madera` · Secundario: `bg-stone-200`
- Inputs: `border-stone-300 rounded-md focus:border-patrimonio-lago`
- **Prohibido:** sombras grandes, gradientes, bordes 100% cuadrados

**Restricción técnica:** la CSP es `script-src 'self'` **sin `unsafe-inline`**.
No uses `onclick=`, `onerror=` ni ningún manejador en atributo HTML. Todo con
`addEventListener`. Hay una prueba que falla si aparece uno.

---

## 6. Qué ya está hecho (no lo rehagas)

Verificado el 27 de julio de 2026. Confírmalo tú mismo antes de asumirlo.

| Área | Estado |
|---|---|
| Préstamo/devolución atómicos con `FOR UPDATE` y advisory locks | Hecho |
| Escapado de HTML en `ui.js` | Auditado: todo dato de BD pasa por `escapeHtml` |
| Rol en el servidor | Tabla `usuarios` + `es_admin()` / `es_personal()` en RLS |
| Cabeceras de seguridad | `vercel.json`, `_headers`, `.htaccess`, `nginx.conf.ejemplo` |
| Auditoría de solo inserción | Tabla `auditoria` + disparadores en 3 tablas |
| Registro de errores | Migración 009 + panel de Diagnóstico |
| Perfil editable del personal | Vista "Mi perfil" + cambio de contraseña con reautenticación |
| Búsqueda sin acentos | `buscar_libros()` con `sin_acentos()` e índice |
| Paginación por `range` | En `db.js` |
| Género, ubicación, límite de préstamos | Migración 002 |
| Campo de apoderado para menores | Migración 007 |
| Recuperación de contraseña y Google | Implementado en `auth.js` (falta probar de extremo a extremo) |
| Reintento de carga de Chart.js | Hecho |
| Consolidación de funciones SQL | Migración 010, con manifiesto verificable |
| Integración continua | `.github/workflows/pruebas.yml`, 4 trabajos |
| Contraste WCAG | `pruebas/probar-contraste.mjs` |

**Suites de prueba existentes** — ejecútalas antes y después de cada cambio:

    python3 pruebas/verificar_consolidacion.py   → regla de la consolidación
    node pruebas/probar-interfaz.mjs             → 56 comprobaciones, DOM simulado
    python3 pruebas/probar_librero.py            → 90 comprobaciones, PostgreSQL real

---

## 7. Plan de trabajo

### FASE 1 — Funcionamiento sin conexión 🔴

*Es el trabajo más valioso que queda y el diferenciador real del producto frente
a Aleph. Si se cae internet en Futrono, hoy la biblioteca no puede prestar ni
devolver, ni anotar en papel para cargarlo después.*

**Punto de partida honesto:** `sw.js` y `manifest.json` **no existen** en el
repositorio, pese a que documentos anteriores los daban por hechos. Se construyen
desde cero.

**1.1 — Service worker y manifiesto**
- `sw.js` con estrategia network-first para datos, cache-first para `vendor/`
- `manifest.json` para instalación en el equipo del mesón
- Precachear el App Shell: `index.html`, `css/`, `js/`, `vendor/`

**1.2 — Persistencia local**
- Clase `PersistentStorage` sobre IndexedDB
- Catálogo y lectores en local, con sincronización en segundo plano
- Delta sync por `updated_at` para no traer todo cada vez

**1.3 — Cola de sincronización**
- Clase `SyncQueue` en `db.js`
- Toda escritura que falle por red entra en cola persistente, con reintento
  exponencial. La cola sobrevive al cierre del navegador.
- **Conflictos:** documenta la estrategia elegida y por qué. Considera que el
  stock es el dato en disputa y que dos mesones simultáneos son improbables aquí.
- Fallo permanente: aviso visible al administrador, no silencioso.

**1.4 — Estado de conexión**
- Indicador permanente: en línea / sin conexión / sincronizando / N pendientes

**Criterio de aceptación:** con modo avión activado se registra un préstamo; al
reconectar se sincroniza solo, sin pérdida y sin duplicar.

**Cuidado:** las funciones de circulación son RPC del servidor. Sin conexión no
se pueden llamar. La cola debe registrar la *intención* y reproducirla al
reconectar, revalidando el stock — no puede asumir que el préstamo se concretó.

---

### FASE 2 — Integración con Aleph 500 🟡

*Lo que justifica que BiblioNexo exista junto al sistema del SNBP.*

- **Importación MARC21:** leer exportaciones de Aleph y cargarlas al catálogo
  local. Aleph manda; ante conflicto, gana Aleph.
- **Signatura topográfica** visible en resultados de búsqueda. Hoy **no existe**
  ese campo: hay que agregarlo (migración de esquema nueva).
- **Clasificación Dewey** en vez del campo de género en texto libre, para poder
  interoperar y reportar al SNBP.
- **Autocompletado por ISBN** contra Open Library al escanear un libro nuevo.
  La API ya se usa para las portadas.

---

### FASE 3 — Operación diaria 🟡

- **Modo inventario:** recorrer estanterías escaneando; marca faltantes y mal
  ubicados; genera acta imprimible.
- **Estado de ejemplares:** tabla `ejemplares` con estado (disponible, prestado,
  dañado, en reparación, perdido, dado de baja) y motivo. Hoy, si un libro se
  pierde, la única salida es bajar `copias_totales` y queda un hueco sin
  explicar. **Cambiarlo después de cargar el catálogo real es carísimo.**
- **Multas como suspensión en días o como monto**, configurable. Muchas
  bibliotecas municipales no cobran dinero.
- **Módulo de actividades:** talleres y clubes de lectura con registro de
  asistentes, exportable para el reporte mensual al SNBP.
- **Reservas:** hoy se resuelven con un papelito.

---

### FASE 4 — Mantenibilidad 🟡

- **Partir `ui.js`.** Tiene 4.018 líneas y 76 métodos en una sola clase: mezcla
  enrutamiento, renderizado, validación, reglas de negocio y formato. Extracción
  mecánica a `js/vistas/catalogo.js`, `meson.js`, `prestamos.js`, etc. **No es
  una reescritura.**
- **Plantilla que escape por defecto.** Una función etiquetada de plantilla
  (tagged template literal), llamada por ejemplo `html`, que escape todas las
  interpolaciones automáticamente. Uso previsto:

      contenedor.innerHTML = html`<p>${libro.titulo}</p>`;

  y el título queda escapado sin que nadie tenga que acordarse. Hoy el escapado
  es correcto, pero depende de disciplina: un `escapeHtml` olvidado en un título
  de libro es XSS almacenado.
- **Cobertura de pruebas** sobre la lógica de negocio: cálculo de plazos,
  validaciones de RUT, `SyncQueue`, flujo préstamo/devolución. Puedes usar Vitest
  o extender las suites existentes — pero **no rompas las tres que ya corren en
  integración continua**.
- **Hoja de impresión** `@media print` para comprobantes y actas.
- **Control de tamaño de fuente** para adultos mayores.

---

### FASE 5 — Cierre para producción 🟢

- Manual de usuario para el personal, con capturas
- Instructivo de respaldo y restauración, con responsable designado por nombre
- `DATOS_PERSONALES.md`: inventario de qué se guarda, para qué y por cuánto
  tiempo, con marca explícita del tratamiento de datos de menores
  *(revisar `CUMPLIMIENTO-LEGAL.md`, que ya cubre parte)*
- Probar de extremo a extremo la recuperación de contraseña y el acceso con
  Google contra el proyecto real de Supabase

---

## 8. Riesgos abiertos que no son código

Documentarlos es parte del trabajo, aunque no los resuelvas tú.

- **Supabase gratuito pausa proyectos a los 7 días sin actividad.** La biblioteca
  cierra en febrero. Y no hay respaldo point-in-time.
- **Ley 21.719 rige desde el 1 de diciembre de 2026.** Falta designar Delegado de
  Protección de Datos y Encargado de Ciberseguridad, y firmar el encargo de
  tratamiento con Supabase verificando en qué región está alojado el proyecto.
  Depende del municipio, no del código, y demora más que cualquier función.
- **Nadie tiene asignado apretar el botón de respaldo.**

---

## 9. Formato de entrega por fase

1. **Resumen** en lenguaje claro
2. **Archivos modificados**, con el porqué de cada cambio
3. **Cómo verificarlo**: pasos concretos y reproducibles
4. **Resultado de las tres suites** antes y después
5. **Hallazgos fuera de alcance**, documentados sin corregir
6. **Riesgos abiertos** para la fase siguiente

Luego **detente y espera confirmación**.

---

## 10. Primera instrucción

Antes de escribir código:

1. Ejecuta las tres suites de prueba y pega el resultado.
2. Verifica la sección 6 de este documento contra el repositorio y dime qué no
   calza.
3. Lee `MIGRACIONES.md` y `CUMPLIMIENTO-LEGAL.md` completos.
4. Propón un plan concreto para la Fase 1.1 y 1.2, con los archivos que crearías
   y por qué.

No modifiques nada todavía.
