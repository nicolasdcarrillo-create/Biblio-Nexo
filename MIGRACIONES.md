# Migraciones con el CLI de Supabase

Hasta ahora las migraciones se aplicaban copiando SQL y pegándolo en el editor
web de Supabase. Este documento reemplaza esa práctica.

No es un cambio de comodidad. **Es la corrección de la causa raíz del fallo más
grave que ha tenido el sistema.**

---

## Por qué importa

El copiar-y-pegar tiene tres agujeros, y los tres se manifestaron:

**No queda registro de qué se aplicó.** Nada en la base de datos dice qué
migraciones corrieron. La única fuente era la memoria de quien las ejecutó.

**El orden depende de una persona.** Nada impide correr la 004 después de la
007. Y como casi todas las migraciones redefinen funciones, hacerlo revierte
correcciones sin avisar.

**Una migración a medio aplicar no se distingue de una completa.** Si el editor
web corta la ejecución a mitad de camino —por un error de sintaxis o por perder
la sesión— la mitad de arriba quedó aplicada y la de abajo no. Sin registro, no
hay forma de saberlo.

El fallo que dejó al librero sin poder prestar ni devolver libros salió
exactamente de ahí: `prestar_libro` quedó definida en seis archivos distintos, y
la versión de la 007 perdió el `security definer` que la 001 sí tenía. Nadie
podía notarlo porque nadie tenía la fotografía completa.

---

## Instalación, una sola vez

```bash
npm install -g supabase
supabase --version    # debe responder 2.x o superior
```

Después, vincular la carpeta con tu proyecto en la nube:

```bash
cd biblionexo
supabase link --project-ref TU_REFERENCE_ID
```

El `REFERENCE_ID` está en Supabase, en **Settings → General → Reference ID**.
Te va a pedir la contraseña de la base de datos (**Settings → Database**).

---

## Paso obligatorio: establecer la línea base

**Hazlo antes de cualquier otra cosa.** Tu base de datos ya tiene aplicadas las
migraciones 001 a 009, pero el CLI no lo sabe: para él, la tabla de historial
está vacía y todas están pendientes. Si haces `db push` sin este paso, intentará
reaplicarlas.

```bash
supabase migration repair --status applied \
  001 002 003 004 005 006 007 008 009 --linked
```

Comprueba el resultado:

```bash
supabase migration list --linked
```

Deben aparecer 001 a 009 como aplicadas, y la **010 y la 011 como pendientes**.
Se aplican en ese orden: la 011 crea disparadores que llaman a una función
definida en la 010.

---

## Uso diario

```bash
# Ver qué está pendiente
supabase migration list --linked

# Aplicar lo que falte
supabase db push
```

Eso es todo. El CLI aplica solo lo pendiente, en orden, y registra cada
migración al terminarla.

### Probar antes de tocar la base real

```bash
supabase start          # levanta un PostgreSQL local
supabase db reset       # aplica TODAS las migraciones desde cero
```

`db reset` es la prueba más valiosa que existe para este proyecto: reconstruye
la base entera desde los archivos. Si funciona, los archivos son coherentes. Si
falla, hay un problema que en producción habría aparecido meses después.

---

## La regla nueva sobre las funciones

Desde la migración **010**, todas las funciones del sistema tienen una sola
definición viva, en `010_consolidacion.sql`.

> **Para cambiar una función, se edita la 010. No se crea un archivo nuevo.**

Esto va contra la costumbre normal de las migraciones, y es a propósito. Una
migración que agrega una columna es un hecho histórico: pasó una vez y no se
repite. Una función es un estado actual: solo importa cómo está ahora. Tratarlas
igual es lo que produjo 51 definiciones para 33 funciones.

Para cambios de esquema —tablas, columnas, índices— sí se agrega un archivo
nuevo: `011_lo_que_sea.sql`.

### Cómo se hace cumplir

Dos comprobaciones automáticas, que corren en cada envío al repositorio:

```sql
-- Dentro de la base de datos: ¿coincide lo instalado con lo declarado?
select * from public.verificar_definiciones() where estado <> 'Correcto';
```

Detecta tres cosas: una función que falta, una que perdió el `security definer`,
y —la más sutil— una función **duplicada**. Si alguien la redefine cambiándole un
parámetro, PostgreSQL no reemplaza: crea una segunda. Las dos quedan vivas y
cuál se ejecuta depende de cómo se llame.

```bash
# Sobre los archivos: ¿hay alguna migración posterior redefiniendo funciones?
python3 pruebas/verificar_consolidacion.py
```

---

## Verificación tras cada envío

```sql
select * from public.verificar_definiciones() where estado <> 'Correcto';  -- sin filas
select * from public.verificar_rls();                                       -- todo Correcto
select * from public.verificar_circulacion();                               -- todo Correcto
```

Las tres se ven también en **Administración → Diagnóstico**.

Y la que ninguna consulta reemplaza: entrar con una cuenta de librero real,
prestar un libro y devolverlo, confirmando en la tabla `libros` que el `stock`
baja y vuelve.

---

## Cosas que cuesta descubrir solo

**El CLI acepta los prefijos numéricos.** No hace falta renombrar a
`20260727120000_nombre.sql`. La versión es el número inicial. Está comprobado
aplicando la cadena completa.

**`supabase migration new` genera nombres con fecha.** Como este proyecto usa la
serie numérica, conviene crear el archivo a mano y seguir la numeración.

**Conexión directa por `--db-url`:** necesita `?sslmode=disable` contra un
PostgreSQL local sin certificado. Contra Supabase se usa `--linked` y no hace
falta.

**Telemetría:** el CLI intenta enviar estadísticas de uso. Para desactivarla:

```bash
export SUPABASE_NO_TELEMETRY=1
export DO_NOT_TRACK=1
```

**Respalda antes del primer `db push`.** Aunque la 010 es idempotente y está
probada, es la primera vez que se toca la base por una vía nueva.
