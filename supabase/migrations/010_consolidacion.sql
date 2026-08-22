-- ============================================================================
-- BiblioNexo — 010: Consolidación de funciones
-- ============================================================================
-- Este archivo es la ÚNICA definición viva de cada función del sistema.
--
-- ¿Por qué existe?
--
-- Las migraciones 001 a 009 se fueron escribiendo una encima de otra. Cada vez
-- que había que corregir algo, se volvía a declarar la función en un archivo
-- nuevo. El resultado: `prestar_libro` quedó definida SEIS veces en seis
-- archivos distintos, `devolver_prestamo` y `renovar_prestamo` tres cada una.
-- En total, 33 funciones repartidas en 51 definiciones.
--
-- Eso no es desorden cosmético. Es exactamente el hueco por donde se colaron
-- los fallos que dejaron al librero sin poder trabajar: la 007 reinstaló
-- `prestar_libro` sin `security definer`, revirtiendo sin querer lo que la 001
-- había hecho bien, y nadie tenía la fotografía completa para notarlo. La única
-- forma de saber qué versión estaba viva era consultar el catálogo interno de
-- PostgreSQL.
--
-- Desde aquí, la regla es una sola:
--
--   *** UNA FUNCIÓN SE MODIFICA EDITANDO ESTE ARCHIVO, NUNCA AGREGANDO OTRO. ***
--
-- Los archivos 001 a 009 se conservan como historia, para entender por qué las
-- cosas son como son. Pero ya no son la fuente de verdad. Si este archivo y
-- uno de ellos se contradicen, manda este.
--
-- La función `verificar_definiciones()` del final comprueba automáticamente que
-- lo que está instalado en la base de datos coincide con lo que este archivo
-- declara. Si alguien vuelve a la costumbre antigua, salta el aviso.
--
-- Cada función se elimina antes de recrearse. Hace falta porque
-- `create or replace function` NO puede cambiar el tipo de retorno: si una
-- función devolvía una tabla con tres columnas y ahora devuelve cuatro, falla
-- con "cannot change return type of existing function". Sin el drop previo, este
-- archivo dejaría de servir justo cuando más se necesita — para reparar una
-- base de datos que quedó con una versión antigua.
--
-- Cinco funciones se exceptúan porque hay objetos que dependen de ellas. No es
-- una suposición: se obtuvo consultando pg_depend sobre una base ya migrada.
--
--   es_admin, es_personal  ← las usan las políticas RLS
--   registrar_auditoria    ← la usan los disparadores de auditoría
--   sin_acentos            ← la usa el índice libros_busqueda_idx
--   marcar_actualizacion   ← la usan los disparadores de sincronización (011)
--
-- Eliminarlas arrastraría esas dependencias: un `drop ... cascade` sobre
-- `es_admin` borraría las políticas RLS y dejaría las tablas abiertas. Sus
-- firmas son estables, así que reemplazarlas sin eliminar es correcto y seguro.
--
-- LÍMITE IMPORTANTE: este archivo consolida FUNCIONES, no el esquema. Las
-- funciones que aquí se declaran usan tablas creadas por las migraciones 001 a
-- 009 (`parametros`, `auditoria`, `errores`, y columnas agregadas por el camino).
-- No se puede aplicar sobre una base que se quedó, por ejemplo, en la 006:
-- fallaría porque `parametros` todavía no existe. Primero van las 001-009 en
-- orden, y la 010 al final.
--
-- Es idempotente: se puede ejecutar tantas veces como sea necesario, siempre que
-- las anteriores ya estén aplicadas.
-- ============================================================================


-- ============================================================================
-- EXCEPCIÓN: una columna, declarada aquí en vez de en su propia migración
-- ============================================================================
-- `dias_prestamo_override` (plazo de préstamo propio de cada libro) la
-- introdujo 017_plazo_prestamo_por_libro.sql, siguiendo la regla normal de
-- este proyecto: los cambios de esquema van en un archivo nuevo. Pero
-- `buscar_libros()`, `prestar_libro()` y `renovar_prestamo()` —que viven
-- solo aquí, en la 010, por la regla contraria: las funciones no se
-- redefinen fuera de este archivo— necesitan leer esa columna. Sin ella
-- declarada ANTES de esas funciones, una instalación desde cero (que aplica
-- los archivos en orden de nombre: 010 antes que 017) fallaría al crear
-- `buscar_libros()`, una función en lenguaje SQL cuyas referencias se
-- resuelven al crearse, no al llamarse — se comprobó en vivo con
-- `pruebas/probar-migraciones.py`.
--
-- La resolución: esta misma sentencia (idempotente, `if not exists`) queda
-- declarada dos veces — aquí, para que la 010 funcione sola desde cero, y en
-- 017_plazo_prestamo_por_libro.sql, que es la migración que de verdad
-- documenta cuándo y por qué se agregó esta columna. Aplicada dos veces no
-- hace nada la segunda vez.
alter table public.libros
  add column if not exists dias_prestamo_override integer null;

alter table public.libros
  drop constraint if exists libros_dias_prestamo_override_check;

alter table public.libros
  add constraint libros_dias_prestamo_override_check
  check (dias_prestamo_override is null or dias_prestamo_override >= 0);

comment on column public.libros.dias_prestamo_override is
  'Plazo de préstamo en días específico de este libro. NULL = usa el parámetro global dias_prestamo. 0 = material de referencia, no circula.';

-- ============================================================================
-- AYUDANTES PUROS
-- ============================================================================
-- No tocan tablas, así que no necesitan `security definer`: no hay RLS que
-- esquivar. Van primero porque las funciones en lenguaje SQL sí resuelven sus
-- referencias en el momento de crearse.

-- ── hoy_chile ── (última versión: 004_reportes_portadas_zona_horaria.sql)
drop function if exists public.hoy_chile();
create or replace function public.hoy_chile()
returns date
language sql
stable
as $$
  select (timezone('America/Santiago', now()))::date;
$$;
grant execute on function public.hoy_chile() to authenticated;

-- ── sin_acentos ── (última versión: 005_renovaciones_auditoria_busqueda.sql)
create or replace function public.sin_acentos(txt text)
returns text
language sql
immutable
parallel safe
as $$
  select translate(
    lower(coalesce(txt, '')),
    'áàâäãåéèêëíìîïóòôöõúùûüýñçÁÀÂÄÃÅÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÝÑÇ',
    'aaaaaaeeeeiiiiooooouuuuyncaaaaaaeeeeiiiiooooouuuuync'
  );
$$;
grant execute on function public.sin_acentos(text) to authenticated;

-- ============================================================================
-- IDENTIDAD Y PARÁMETROS
-- ============================================================================
-- `es_admin` y `es_personal` son la base de todas las políticas RLS. Son
-- `security definer` porque tienen que poder leer la tabla `usuarios` incluso
-- cuando la política que se está evaluando es la de esa misma tabla.

-- Las dos llevan `set search_path = ''` y no `= public`, que es lo que
-- recomienda Supabase para toda función `security definer`:
--
--   Con `= public`, un nombre sin esquema se busca en el search_path. Quien
--   pueda crear objetos en otro esquema que vaya antes podría poner ahí una
--   tabla `usuarios` propia y la función leería esa, no la nuestra. Con `= ''`
--   no hay dónde buscar: todo nombre tiene que venir calificado o la función
--   falla al ejecutarse. Es un error ruidoso en vez de un secuestro silencioso.
--
--   El cuerpo de ambas ya califica todo con `public.`, así que el cambio no
--   altera lo que hacen. Solo `pg_catalog` sigue implícito, que es lo que
--   permite que operadores y tipos sigan resolviéndose.
--
-- Y `(select auth.uid())` en vez de `auth.uid()` a secas: entre paréntesis,
-- PostgreSQL lo trata como subconsulta sin correlación y la evalúa una sola
-- vez por consulta en lugar de una vez por fila. Estas dos funciones son la
-- base de todas las políticas RLS, así que se ejecutan en cada fila que el
-- motor examina; sobre tablas grandes la diferencia se nota.

-- ── es_admin ── (última versión: 003_rol_admin_y_contacto.sql)
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;
grant execute on function public.es_admin() to authenticated;

-- es_admin() es un helper interno para las políticas RLS, no un RPC público
-- que el personal deba llamar directo. Supabase concede EXECUTE a `anon` y
-- `authenticated` por privilegios por omisión, no solo vía PUBLIC — revocar
-- de PUBLIC no basta, hay que revocarle a `anon` explícitamente aparte.
-- Ya estaba así en producción desde el 26 de julio (aplicado a mano); esto
-- lo trae al repositorio, no lo introduce.
revoke execute on function public.es_admin() from public;
revoke execute on function public.es_admin() from anon;

-- ── es_personal ── (última versión: 008_perfiles_y_permisos_librero.sql)
create or replace function public.es_personal()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null;
$$;
grant execute on function public.es_personal() to authenticated;

-- PENDIENTE — el resto de las funciones `security definer` (commit aparte)
--
-- Este archivo declara 30 funciones `security definer`. Solo dos, las de
-- arriba, llevan `set search_path = ''`; las otras 28 siguen con `= public`.
-- Revisadas una por una contra los tres tipos de dependencia que importan:
--
-- 1. Objetos de extensiones (`extensions.unaccent`, operadores de `pg_trgm`)
--    Ninguna función los usa. Es el caso que habría bloqueado el cambio, y no
--    se da: `sin_acentos` quita los acentos con `translate`, que es de
--    `pg_catalog`, y `buscar_libros` compara con `like`, sin similitud
--    difusa. La mención a `pg_trgm` y `unaccent` al final del archivo es sobre
--    el bucle de permisos, no sobre el cuerpo de ninguna función.
--
-- 2. `auth.users` y `auth.uid()`
--    Sí se usan, en once sitios (asignar_rol, asegurar_perfil, mi_perfil,
--    listar_personal, anonimizar_lector, registrar_auditoria, registrar_error
--    y las de su entorno), pero **siempre calificados con `auth.`**. Un
--    `search_path` vacío no los afecta: ya no dependen de él.
--
-- 3. `pg_catalog`
--    `hoy_chile` usa `timezone()`, `purgar_errores` usa `now()` e `interval`,
--    y varias consultan `pg_proc`, `pg_policies` o `pg_namespace`. Todo eso
--    sigue funcionando: `pg_catalog` está siempre en el camino de búsqueda de
--    forma implícita, aunque `search_path` esté vacío. No hay que calificarlo.
--
-- Aparte: ninguna usa SQL dinámico —los dos `execute format` del archivo están
-- en bloques `do` de nivel superior, fuera de toda función— y no hay tipos
-- propios, todos los `::` son a tipos base.
--
-- Conclusión: las 28 podrían pasar a `= ''` sin tocarles el cuerpo. No se hace
-- aquí porque la revisión es de lectura del texto, no de ejecución. Un nombre
-- sin calificar que se nos pase no falla al aplicar la migración: falla la
-- primera vez que corre esa rama, y sería un «no existe la relación» delante
-- de quien esté atendiendo el mesón. Va en su propio commit, por grupos y con
-- la suite de PostgreSQL real corriendo entre medio.
--
-- Si alguna resulta no calificar algo, se deja como está: a medias es peor
-- que sin tocar.

-- ── parametro_int ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.parametro_int(text, int);
create or replace function public.parametro_int(p_clave text, p_defecto int)
returns int
language sql
stable
security definer
set search_path = public
as $$
  -- Los parámetros de operación no son datos personales, pero tampoco
  -- tienen por qué ser públicos. Con la llave anónima se podían leer.
  select case when public.es_personal() then coalesce((select valor::int from public.parametros where clave = p_clave), p_defecto) else p_defecto end;
$$;
grant execute on function public.parametro_int(text, int) to authenticated;

-- ============================================================================
-- CONSULTAS
-- ============================================================================
-- `buscar_libros` y `revisar_inventario` se dejan a propósito SIN
-- `security definer`: solo leen, y así respetan las políticas RLS de quien
-- consulta. Es la opción más restrictiva de las dos y aquí alcanza.

-- ── estado_lector ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.estado_lector(text);
create or replace function public.estado_lector(p_rut text)
returns table (
  existe boolean, lector_id bigint, nombre text, rut text, email text, telefono text,
  bloqueado_manual boolean, motivo_bloqueo text,
  prestamos_activos int, prestamos_atrasados int,
  puede_prestar boolean, motivo_rechazo text
)
language plpgsql
stable
-- SECURITY DEFINER es indispensable: sin esto la función respetaba las
-- políticas RLS del usuario que la llama, así que si un librero no podía ver
-- todos los préstamos, el conteo salía bajo y tanto el límite como el bloqueo
-- por atraso se podían eludir sin que nadie lo notara.
security definer
set search_path = public
as $$
declare
  v_lector public.lectores;
  v_activos int := 0;
  v_atrasados int := 0;
  v_limite int;
  v_puede boolean := true;
  v_motivo text := null;
begin
  -- Sin esta comprobación, cualquiera con la llave anónima —que es pública por
  -- diseño y va escrita en config.js— podía probar RUT uno por uno y recolectar
  -- nombre, correo, teléfono y estado de morosidad de cada lector. Los RUT
  -- chilenos son enumerables, así que era una lista de contactos al descubierto.
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para consultar un lector.' using errcode = 'P0001';
  end if;

  v_limite := public.parametro_int('max_prestamos_por_lector', 3);

  select * into v_lector from public.lectores where lectores.rut = p_rut;

  if v_lector.id is null then
    return query select false, null::bigint, null::text, p_rut::text, null::text, null::text,
                        false, null::text, 0, 0, false, 'Este RUT no está registrado.'::text;
    return;
  end if;

  -- Se califican las columnas con el nombre de la tabla: RETURNS TABLE declara
  -- una salida llamada lector_id y sin calificar PostgreSQL no distingue entre
  -- la variable de salida y la columna, y aborta con "reference is ambiguous".
  select count(*) filter (where p.estado = 'activo'),
         count(*) filter (where p.estado = 'activo' and p.fecha_devolucion_esperada < public.hoy_chile())
    into v_activos, v_atrasados
  from public.prestamos p
  where p.lector_id = v_lector.id;

  if v_lector.bloqueado_manual then
    v_puede := false;
    v_motivo := coalesce('Bloqueado por la biblioteca: ' || v_lector.motivo_bloqueo, 'Bloqueado por la biblioteca.');
  elsif v_atrasados > 0 then
    v_puede := false;
    v_motivo := 'Tiene ' || v_atrasados || ' libro(s) con la devolución atrasada.';
  elsif v_activos >= v_limite then
    v_puede := false;
    v_motivo := 'Ya tiene ' || v_activos || ' préstamos activos, el máximo permitido.';
  end if;

  return query select true, v_lector.id::bigint, v_lector.nombre::text, v_lector.rut::text,
                      v_lector.email::text, v_lector.telefono::text,
                      v_lector.bloqueado_manual, v_lector.motivo_bloqueo::text,
                      v_activos, v_atrasados, v_puede, v_motivo::text;
end;
$$;
grant execute on function public.estado_lector(text) to authenticated;

-- ── buscar_libros ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.buscar_libros(text, int, int);
create or replace function public.buscar_libros(
  p_busqueda text default '', p_limite int default 50, p_desplazamiento int default 0
)
returns table (
  id bigint, isbn text, titulo text, autor text, genero text, ubicacion text,
  portada_url text, copias_totales int, stock int, dias_prestamo_override int, total_coincidencias bigint
)
language sql
stable
set search_path = public
as $$
  with filtrados as (
    select l.* from public.libros l
    where p_busqueda is null or p_busqueda = ''
       or public.sin_acentos(l.titulo) like '%' || public.sin_acentos(p_busqueda) || '%'
       or public.sin_acentos(l.autor)  like '%' || public.sin_acentos(p_busqueda) || '%'
       or l.isbn like '%' || p_busqueda || '%'
  )
  select f.id::bigint, f.isbn::text, f.titulo::text, f.autor::text, f.genero::text,
         f.ubicacion::text, f.portada_url::text, f.copias_totales::int, f.stock::int,
         f.dias_prestamo_override::int,
         (select count(*) from filtrados)::bigint
  from filtrados f
  order by f.titulo
  limit p_limite offset p_desplazamiento;
$$;
grant execute on function public.buscar_libros(text, int, int) to authenticated;

-- ── consultar_libro ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.consultar_libro(text);
create or replace function public.consultar_libro(p_codigo text)
returns table (
  libro_id bigint, isbn text, titulo text, autor text, genero text, ubicacion text,
  portada_url text, copias_totales int, stock int,
  prestamo_id bigint, fecha_prestamo date, fecha_devolucion_esperada date,
  dias_restantes int, renovaciones int,
  lector_id bigint, lector_nombre text, lector_rut text, lector_email text,
  lector_telefono text, lector_bloqueado boolean, lector_atrasados int
)
language plpgsql
stable
security definer
set search_path = public
as $$
-- Esta función devuelve una tabla, así que sus columnas de salida (isbn, titulo,
-- autor...) existen también como variables dentro del cuerpo. Sin esta
-- directiva, `where isbn = p_codigo` queda ambiguo y PostgreSQL rechaza la
-- consulta. Le indicamos que ante la duda prefiera la columna de la tabla.
#variable_conflict use_column
begin
  -- Devolvía el nombre, RUT, correo y teléfono de quien tiene el libro
  -- prestado. Con la llave anónima bastaba un código de barras para
  -- obtener los datos personales del lector.
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para consultar un libro.' using errcode = 'P0001';
  end if;

  return query
with libro as (
    select * from public.libros
    where isbn = p_codigo or isbn = replace(p_codigo, '-', '')
    limit 1
  )
  select
    l.id::bigint, l.isbn::text, l.titulo::text, l.autor::text, l.genero::text,
    l.ubicacion::text, l.portada_url::text, l.copias_totales::int, l.stock::int,
    p.id::bigint, p.fecha_prestamo, p.fecha_devolucion_esperada,
    (p.fecha_devolucion_esperada - public.hoy_chile())::int,
    p.renovaciones::int,
    lec.id::bigint, lec.nombre::text, lec.rut::text, lec.email::text, lec.telefono::text,
    lec.bloqueado_manual,
    coalesce((
      select count(*)::int from public.prestamos p2
      where p2.lector_id = lec.id and p2.estado = 'activo'
        and p2.fecha_devolucion_esperada < public.hoy_chile()
    ), 0)
  from libro l
  left join public.prestamos p on p.libro_id = l.id and p.estado = 'activo'
  left join public.lectores lec on lec.id = p.lector_id
  order by p.fecha_devolucion_esperada nulls last;
end;
$$;
grant execute on function public.consultar_libro(text) to authenticated;

-- ── revisar_inventario ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.revisar_inventario();
create or replace function public.revisar_inventario()
returns table (
  libro_id bigint, titulo text, isbn text,
  copias_totales int, stock int, prestados int, diferencia int
)
language sql
stable
set search_path = public
as $$
  select l.id::bigint, l.titulo::text, l.isbn::text,
         l.copias_totales::int, l.stock::int,
         coalesce(p.activos, 0)::int,
         (l.copias_totales - l.stock - coalesce(p.activos, 0))::int
  from public.libros l
  left join (
    select libro_id, count(*) as activos
    from public.prestamos where estado = 'activo' group by libro_id
  ) p on p.libro_id = l.id
  where l.copias_totales - l.stock - coalesce(p.activos, 0) <> 0 or l.stock < 0
  order by abs(l.copias_totales - l.stock - coalesce(p.activos, 0)) desc;
$$;
grant execute on function public.revisar_inventario() to authenticated;

-- ============================================================================
-- CIRCULACIÓN — el corazón del sistema
-- ============================================================================
-- Las tres son `security definer` con control de acceso explícito adentro.
--
-- Esto NO es una comodidad: es un requisito. Las políticas RLS dejan `libros`
-- con UPDATE solo para administradores, y `prestamos` sin política de escritura
-- para nadie. Sin `security definer`, un librero no puede prestar ni devolver.
--
-- Y el modo de fallar era traicionero: el INSERT lanzaba un error visible, pero
-- el UPDATE simplemente afectaba cero filas SIN error. La pantalla decía
-- "Devolución registrada", el aviso salía en verde, y en la base de datos no
-- cambiaba nada. El libro quedaba prestado para siempre.
--
-- Por eso `devolver_prestamo` comprueba `row_count` y falla en voz alta.

-- ── prestar_libro ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.prestar_libro(bigint, text);
create or replace function public.prestar_libro(p_libro_id bigint, p_lector_rut text)
returns table (prestamo_id bigint, fecha_devolucion_esperada date)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lector_id bigint;
  v_stock int;
  v_override int;
  v_prestamo_id bigint;
  v_hoy date := public.hoy_chile();
  v_dias int;
  v_estado record;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para registrar un préstamo.' using errcode = 'P0001';
  end if;

  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  if v_lector_id is null then
    raise exception 'RUT no encontrado.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(v_lector_id);

  select * into v_estado from public.estado_lector(p_lector_rut);
  if not v_estado.puede_prestar then
    raise exception '%', v_estado.motivo_rechazo using errcode = 'P0001';
  end if;

  select stock, dias_prestamo_override into v_stock, v_override from public.libros where id = p_libro_id for update;
  if v_stock is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;
  -- dias_prestamo_override = 0 marca material de referencia: no se presta,
  -- sin importar el stock disponible (ver 017_plazo_prestamo_por_libro.sql).
  if v_override = 0 then
    raise exception 'Este material es de referencia y no circula.' using errcode = 'P0001';
  end if;
  if v_stock < 1 then
    raise exception 'No hay ejemplares disponibles de este libro.' using errcode = 'P0001';
  end if;

  v_dias := coalesce(v_override, public.parametro_int('dias_prestamo', 7));

  update public.libros set stock = stock - 1 where id = p_libro_id;

  insert into public.prestamos (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, estado)
  values (p_libro_id, v_lector_id, v_hoy, v_hoy + v_dias, 'activo')
  returning id into v_prestamo_id;

  return query select v_prestamo_id::bigint, (v_hoy + v_dias)::date;
end;
$$;
grant execute on function public.prestar_libro(bigint, text) to authenticated;

-- ── devolver_prestamo ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.devolver_prestamo(bigint);
create or replace function public.devolver_prestamo(p_prestamo_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_libro_id bigint;
  v_estado text;
  v_filas int;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para registrar una devolución.' using errcode = 'P0001';
  end if;

  select libro_id, estado into v_libro_id, v_estado
  from public.prestamos where id = p_prestamo_id for update;

  if v_libro_id is null then
    raise exception 'Préstamo no encontrado.' using errcode = 'P0001';
  end if;
  if v_estado = 'devuelto' then
    raise exception 'Este préstamo ya fue devuelto anteriormente.' using errcode = 'P0001';
  end if;

  update public.prestamos
     set estado = 'devuelto', fecha_devolucion_real = public.hoy_chile()
   where id = p_prestamo_id;

  -- Comprobación de resultado: si por cualquier motivo la escritura no ocurre,
  -- la operación debe fallar en voz alta. Una devolución que "sale bien" pero
  -- no se guarda deja un libro fantasma prestado para siempre.
  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    raise exception 'No se pudo actualizar el préstamo. Revisa las políticas de acceso.' using errcode = 'P0001';
  end if;

  update public.libros set stock = stock + 1 where id = v_libro_id;
end;
$$;
grant execute on function public.devolver_prestamo(bigint) to authenticated;

-- ── renovar_prestamo ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.renovar_prestamo(bigint);
create or replace function public.renovar_prestamo(p_prestamo_id bigint)
returns table (nueva_fecha date, renovaciones_usadas int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado text;
  v_vence date;
  v_renovaciones int;
  v_libro_id bigint;
  v_override int;
  v_limite int := public.parametro_int('max_renovaciones', 2);
  v_dias int;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para renovar un préstamo.' using errcode = 'P0001';
  end if;

  select estado, fecha_devolucion_esperada, renovaciones, libro_id
    into v_estado, v_vence, v_renovaciones, v_libro_id
  from public.prestamos where id = p_prestamo_id for update;

  if v_estado is null then
    raise exception 'Préstamo no encontrado.' using errcode = 'P0001';
  end if;
  if v_estado <> 'activo' then
    raise exception 'Solo se pueden renovar préstamos activos.' using errcode = 'P0001';
  end if;
  if v_renovaciones >= v_limite then
    raise exception 'Este préstamo ya se renovó % veces, el máximo permitido.', v_limite using errcode = 'P0001';
  end if;
  if v_vence < public.hoy_chile() then
    raise exception 'El préstamo está atrasado. Debe devolverse antes de volver a prestarlo.' using errcode = 'P0001';
  end if;

  -- El plazo de renovación respeta el mismo plazo propio del libro que usó
  -- el préstamo original (ver 017_plazo_prestamo_por_libro.sql). Si en algún
  -- momento el libro pasó a "no circula" (override = 0) después de prestado,
  -- se usa el plazo global en vez de sumar cero días — 0 solo bloquea
  -- préstamos NUEVOS, no deja sin renovar uno que ya estaba activo.
  select dias_prestamo_override into v_override from public.libros where id = v_libro_id;
  v_dias := coalesce(nullif(v_override, 0), public.parametro_int('dias_prestamo', 7));

  update public.prestamos
     set fecha_devolucion_esperada = v_vence + v_dias,
         renovaciones = renovaciones + 1
   where id = p_prestamo_id;

  return query select (v_vence + v_dias)::date, (v_renovaciones + 1)::int;
end;
$$;
grant execute on function public.renovar_prestamo(bigint) to authenticated;

-- ============================================================================
-- INVENTARIO Y BLOQUEOS
-- ============================================================================

-- ── ajustar_copias ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.ajustar_copias(bigint, int);
create or replace function public.ajustar_copias(p_libro_id bigint, p_copias_totales int)
returns table (copias_totales int, stock int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prestadas int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ajustar los ejemplares.' using errcode = 'P0001';
  end if;
  if p_copias_totales < 0 then
    raise exception 'El número de ejemplares no puede ser negativo.' using errcode = 'P0001';
  end if;

  perform 1 from public.libros where id = p_libro_id for update;

  select count(*) into v_prestadas
  from public.prestamos
  where libro_id = p_libro_id and estado = 'activo';

  if p_copias_totales < v_prestadas then
    raise exception 'No puedes dejar % ejemplares: hay % prestados en este momento.',
      p_copias_totales, v_prestadas using errcode = 'P0001';
  end if;

  update public.libros
     set copias_totales = p_copias_totales,
         stock = p_copias_totales - v_prestadas
   where id = p_libro_id;

  return query select p_copias_totales, p_copias_totales - v_prestadas;
end;
$$;
grant execute on function public.ajustar_copias(bigint, int) to authenticated;

-- ── corregir_inventario ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.corregir_inventario(bigint);
create or replace function public.corregir_inventario(p_libro_id bigint)
returns table (copias_totales int, stock int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prestadas int;
  v_totales int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede corregir el inventario.' using errcode = 'P0001';
  end if;

  select l.copias_totales into v_totales from public.libros l where l.id = p_libro_id for update;
  if v_totales is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;

  select count(*) into v_prestadas
  from public.prestamos
  where libro_id = p_libro_id and estado = 'activo';

  update public.libros
     set stock = greatest(0, v_totales - v_prestadas)
   where id = p_libro_id;

  return query select v_totales, greatest(0, v_totales - v_prestadas);
end;
$$;
grant execute on function public.corregir_inventario(bigint) to authenticated;

-- ── bloquear_lector ── (última versión: 006_bloqueo_inventario_admin.sql)
drop function if exists public.bloquear_lector(bigint, boolean, text);
create or replace function public.bloquear_lector(
  p_lector_id bigint,
  p_bloquear boolean,
  p_motivo text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede bloquear o desbloquear lectores.' using errcode = 'P0001';
  end if;

  update public.lectores
     set bloqueado_manual = p_bloquear,
         motivo_bloqueo   = case when p_bloquear then p_motivo else null end,
         bloqueado_en     = case when p_bloquear then now() else null end
   where id = p_lector_id;

  -- Sin esto, bloquear un lector que ya no existe "tenía éxito" en pantalla
  -- sin cambiar nada: el mismo patrón traicionero de devolver_prestamo.
  if not found then
    raise exception 'Lector no encontrado.' using errcode = 'P0001';
  end if;
end;
$$;
grant execute on function public.bloquear_lector(bigint, boolean, text) to authenticated;

-- ============================================================================
-- PERSONAL Y PERFILES
-- ============================================================================
-- `actualizar_mi_perfil` no recibe ni el rol ni el id del usuario a propósito:
-- los toma de la sesión. Si el rol fuera un parámetro, cualquier librero podría
-- ascenderse a administrador desde la consola del navegador.

-- ── asignar_rol ── (última versión: 006_bloqueo_inventario_admin.sql)
drop function if exists public.asignar_rol(uuid, text);
create or replace function public.asignar_rol(
  p_usuario_id uuid,
  p_rol text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar roles.' using errcode = 'P0001';
  end if;
  if p_rol not in ('admin', 'librero') then
    raise exception 'Rol no válido. Debe ser admin o librero.' using errcode = 'P0001';
  end if;
  if p_usuario_id = auth.uid() and p_rol <> 'admin' then
    raise exception 'No puedes quitarte tu propio rol de administrador.' using errcode = 'P0001';
  end if;

  insert into public.usuarios (id, email, rol)
  select p_usuario_id, u.email, p_rol from auth.users u where u.id = p_usuario_id
  on conflict (id) do update set rol = p_rol;

  -- Si auth.users no tiene esa fila, el select de arriba no aporta ninguna
  -- fila y el insert no inserta nada: "éxito" en pantalla sin haber asignado
  -- el rol. Pasa cuando se intenta dar un rol a alguien que nunca inició
  -- sesión, porque su cuenta todavía no existe en auth.users.
  if not found then
    raise exception 'Esa persona todavía no ha iniciado sesión en el sistema. Debe iniciar sesión al menos una vez antes de que se le pueda asignar un rol.' using errcode = 'P0001';
  end if;
end;
$$;
grant execute on function public.asignar_rol(uuid, text) to authenticated;

-- ── asegurar_perfil ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.asegurar_perfil();
create or replace function public.asegurar_perfil()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    return;
  end if;

  select email into v_email from auth.users where id = auth.uid();

  insert into public.usuarios (id, email, rol)
  values (auth.uid(), v_email, 'librero')
  on conflict (id) do update
    set email = coalesce(excluded.email, public.usuarios.email);
end;
$$;
grant execute on function public.asegurar_perfil() to authenticated;

-- ── mi_perfil ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.mi_perfil();
create or replace function public.mi_perfil()
returns table (
  usuario_id uuid,
  email text,
  nombre text,
  telefono text,
  cargo text,
  rol text,
  creado_en timestamptz,
  actualizado_en timestamptz,
  ultimo_acceso timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No hay sesión iniciada.' using errcode = 'P0001';
  end if;

  perform public.asegurar_perfil();

  return query
    select
      p.id,
      p.email::text,
      p.nombre,
      p.telefono,
      p.cargo,
      coalesce(p.rol, 'librero')::text,
      p.creado_en,
      p.actualizado_en,
      u.last_sign_in_at
    from public.usuarios p
    join auth.users u on u.id = p.id
    where p.id = auth.uid();
end;
$$;
grant execute on function public.mi_perfil() to authenticated;

-- ── actualizar_mi_perfil ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.actualizar_mi_perfil(text, text, text);
create or replace function public.actualizar_mi_perfil(
  p_nombre   text,
  p_telefono text default null,
  p_cargo    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text := nullif(btrim(p_nombre), '');
begin
  if auth.uid() is null then
    raise exception 'No hay sesión iniciada.' using errcode = 'P0001';
  end if;
  if v_nombre is null then
    raise exception 'El nombre no puede quedar vacío.' using errcode = 'P0001';
  end if;
  if length(v_nombre) > 120 then
    raise exception 'El nombre es demasiado largo.' using errcode = 'P0001';
  end if;

  perform public.asegurar_perfil();

  update public.usuarios
     set nombre         = v_nombre,
         telefono       = nullif(btrim(coalesce(p_telefono, '')), ''),
         cargo          = nullif(btrim(coalesce(p_cargo, '')), ''),
         actualizado_en = now()
   where id = auth.uid();
end;
$$;
grant execute on function public.actualizar_mi_perfil(text, text, text) to authenticated;

-- ── listar_personal ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.listar_personal();
create or replace function public.listar_personal()
returns table (
  usuario_id uuid,
  email text,
  nombre text,
  cargo text,
  rol text,
  ultimo_acceso timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver el personal.' using errcode = 'P0001';
  end if;

  return query
    select u.id, u.email::text, p.nombre, p.cargo,
           coalesce(p.rol, 'librero')::text, u.last_sign_in_at
    from auth.users u
    left join public.usuarios p on p.id = u.id
    order by u.email;
end;
$$;
grant execute on function public.listar_personal() to authenticated;

-- ── eliminar_personal ── (nueva)
--
-- Elimina por completo la cuenta de otra persona del personal: primero su
-- fila en `usuarios` y después la cuenta de acceso en `auth.users`. Se borra
-- en ese orden porque `usuarios.id` tiene una llave foránea hacia
-- `auth.users(id)` sin `on delete cascade` (se agregó a mano en producción,
-- nunca quedó en una migración): borrar primero de `auth.users` deja
-- «violates foreign key constraint "usuarios_id_fkey"».
--
-- No borra el historial: los movimientos que esa persona ya generó en
-- `auditoria` guardan su correo como texto (`usuario_email`), no una
-- referencia a esta fila, así que sobreviven a la eliminación. Esta misma
-- acción también queda registrada ahí, a mano, porque `usuarios` no tiene
-- disparador de auditoría (solo lo tienen `libros`, `lectores` y `prestamos`).
drop function if exists public.eliminar_personal(uuid);
create or replace function public.eliminar_personal(
  p_usuario_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email       text;
  v_rol         text;
  v_admins_rest int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede eliminar cuentas del personal.' using errcode = 'P0001';
  end if;

  if p_usuario_id = (select auth.uid()) then
    raise exception 'No puedes eliminar tu propia cuenta.' using errcode = 'P0001';
  end if;

  select u.email, coalesce(p.rol, 'librero')
    into v_email, v_rol
    from auth.users u
    left join public.usuarios p on p.id = u.id
   where u.id = p_usuario_id;

  if not found then
    raise exception 'Esa cuenta no existe.' using errcode = 'P0001';
  end if;

  -- Solo importa si la persona eliminada es administradora: nunca debe
  -- quedar la biblioteca sin ninguna cuenta capaz de gestionar al resto del
  -- personal. Con un solo administrador, esto en la práctica coincide con el
  -- rechazo de más arriba (nadie puede eliminarse a sí mismo), pero queda
  -- como resguardo si en algún momento hay una sesión desactualizada.
  if v_rol = 'admin' then
    select count(*) into v_admins_rest
      from public.usuarios
     where rol = 'admin' and id <> p_usuario_id;
    if v_admins_rest = 0 then
      raise exception 'No puedes eliminar al único administrador que queda.' using errcode = 'P0001';
    end if;
  end if;

  insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_antes)
  values (
    'usuarios', p_usuario_id::text, 'DELETE', (select auth.uid()),
    (select email from auth.users where id = (select auth.uid())),
    jsonb_build_object('email', v_email, 'rol', v_rol)
  );

  delete from public.usuarios where id = p_usuario_id;
  delete from auth.users where id = p_usuario_id;
end;
$$;
grant execute on function public.eliminar_personal(uuid) to authenticated;

-- ============================================================================
-- ESCANEO REMOTO SIN SESIÓN
-- ============================================================================
-- Un enlace (QR o URL) que permite escanear libros desde un celular SIN que
-- esa persona inicie sesión en el sistema — pensado para prestar el celular a
-- quien no tiene cuenta (un voluntario, un proveedor que trae libros nuevos)
-- sin entregarle una contraseña.
--
-- El diseño, en tres puntos:
--
--   1. El token vive solo en la respuesta de crear_enlace_escaneo. Desde ahí
--      la base solo guarda su huella SHA-256 (enlaces_escaneo_remoto.token_hash,
--      ver 014_enlaces_escaneo_remoto.sql). Nadie con acceso de lectura a la
--      base —ni un volcado completo— puede reconstruir un enlace válido.
--   2. Vence solo (por defecto a las 4 horas, máximo 24) y se puede revocar
--      antes: desde Administración → Enlaces remotos, o por quien lo creó,
--      con el botón "Revocar este enlace ahora" en la propia ventana del
--      código QR.
--   3. Angosto a propósito: agregar_libro_remoto SOLO puede crear un libro o
--      sumarle ejemplares a uno que ya existe. No toca lectores ni préstamos.
--      Aunque el enlace se filtrara, lo máximo que permite es escribir
--      entradas de catálogo — nunca leer datos de personas ni mover un
--      préstamo.
--
-- validar_enlace_escaneo, agregar_libro_remoto y deshacer_libro_remoto NO
-- llevan la guarda es_admin()/es_personal(): las llama, a propósito, un
-- celular sin sesión. Están en SIN_GUARDA_JUSTIFICADO en
-- pruebas/verificar_consolidacion.py, con el motivo escrito ahí. Su única
-- barrera es el token, y por eso las dos últimas lo vuelven a validar por su
-- cuenta —nunca confían en que el celular ya llamó a validar_enlace_escaneo
-- antes— para que un enlace que expira justo entre la comprobación y la
-- escritura no alcance a hacer nada.

-- ── crear_enlace_escaneo ── (nueva)
--
-- Genera el enlace. p_horas queda entre 1 y 24: alcanza para una jornada de
-- trabajo, y poco para que un enlace olvidado quede abierto por semanas.
drop function if exists public.crear_enlace_escaneo(int);
create or replace function public.crear_enlace_escaneo(
  p_horas int default 4
)
returns table (id bigint, token text, expira_en timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_horas int := greatest(1, least(coalesce(p_horas, 4), 24));
  v_token text;
  v_id bigint;
  v_expira timestamptz;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para generar un enlace de escaneo.' using errcode = 'P0001';
  end if;

  -- 24 bytes = 192 bits de aleatoriedad: adivinarlo por fuerza bruta es inviable.
  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  v_expira := now() + (v_horas || ' hours')::interval;

  insert into public.enlaces_escaneo_remoto (token_hash, creado_por, creado_por_email, expira_en)
  values (
    encode(extensions.digest(v_token, 'sha256'), 'hex'),
    (select auth.uid()),
    -- auth.users.id calificado a propósito: esta función devuelve una tabla
    -- con una columna «id» (RETURNS TABLE), y un «id» sin calificar aquí
    -- queda ambiguo entre esa salida y la columna de auth.users.
    (select email from auth.users where auth.users.id = (select auth.uid())),
    v_expira
  )
  returning enlaces_escaneo_remoto.id into v_id;

  return query select v_id, v_token, v_expira;
end;
$$;
grant execute on function public.crear_enlace_escaneo(int) to authenticated;

-- ── validar_enlace_escaneo ── (nueva)
--
-- Comprueba si un enlace sigue vigente, sin gastarlo: no cuenta como "uso"
-- (eso lo hace agregar_libro_remoto, solo cuando de verdad escribe algo), así
-- que la pantalla del celular puede llamarla al abrir sin consumir nada.
-- El token se compara siempre por su huella SHA-256, nunca en texto plano.
drop function if exists public.validar_enlace_escaneo(text);
create or replace function public.validar_enlace_escaneo(
  p_token text
)
returns table (valido boolean, motivo text, expira_en timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Variables sueltas, no una fila de public.enlaces_escaneo_remoto%ROWTYPE:
  -- esa tabla la crea 014_enlaces_escaneo_remoto.sql, una migración
  -- POSTERIOR a esta. PL/pgSQL no valida el SQL del cuerpo hasta que se
  -- ejecuta, así que una consulta contra ella aquí no rompe nada — pero un
  -- tipo de fila SÍ se resuelve al crear la función, así que declarar
  -- `v_fila public.enlaces_escaneo_remoto` fallaría con «no existe el tipo»
  -- en cuanto se aplicara este archivo antes que la 014.
  v_revocado boolean;
  v_expira   timestamptz;
begin
  select revocado, enlaces_escaneo_remoto.expira_en
    into v_revocado, v_expira
    from public.enlaces_escaneo_remoto
   where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');

  if not found then
    return query select false, 'Este enlace no es válido.'::text, null::timestamptz;
    return;
  end if;
  if v_revocado then
    return query select false, 'Este enlace fue revocado.'::text, v_expira;
    return;
  end if;
  if v_expira < now() then
    return query select false, 'Este enlace expiró.'::text, v_expira;
    return;
  end if;

  return query select true, null::text, v_expira;
end;
$$;
grant execute on function public.validar_enlace_escaneo(text) to authenticated;

-- ── agregar_libro_remoto ── (nueva)
--
-- Único punto de escritura que puede llamar el celular sin sesión: crea un
-- libro nuevo o le suma ejemplares a uno que ya existe. Nunca toca lectores
-- ni préstamos.
--
-- Devuelve estado = 'falta_info' cuando el ISBN no está en el catálogo y no
-- llegó título: así el celular puede pedir los datos (con la ayuda de Open
-- Library, ver libros-externos.js) y volver a llamar, en vez de que la
-- función falle con una excepción por cada libro nuevo.
--
-- El movimiento SÍ pasa por el disparador automático de auditoría (como
-- cualquier escritura en libros), que lo deja sin atribuir porque quien llama
-- no tiene sesión (auth.uid() nulo). Por eso se agrega, además, un registro
-- manual atribuido a quien creó el enlace — así queda claro que se hizo por
-- este camino y quién es responsable, igual que en eliminar_personal.
drop function if exists public.agregar_libro_remoto(text, text, text, text, text, text, int);
create or replace function public.agregar_libro_remoto(
  p_token     text,
  p_isbn      text,
  p_titulo    text default null,
  p_autor     text default null,
  p_genero    text default null,
  p_ubicacion text default null,
  p_stock     int default 1
)
returns table (
  estado text, libro_id bigint, isbn text, titulo text, autor text,
  stock int, copias_totales int
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Variables sueltas para lo que viene de enlaces_escaneo_remoto, no una
  -- fila %ROWTYPE de esa tabla: la crea 014_enlaces_escaneo_remoto.sql,
  -- posterior a este archivo. Ver el comentario de validar_enlace_escaneo,
  -- justo arriba, para el porqué. `public.libros` sí existe desde antes de
  -- la 010 (la crean las migraciones 001-009), así que v_libro puede seguir
  -- siendo su tipo de fila sin problema.
  v_enlace_id        bigint;
  v_enlace_revocado  boolean;
  v_enlace_expira    timestamptz;
  v_creado_por       uuid;
  v_creado_por_email text;
  v_isbn    text := nullif(btrim(coalesce(p_isbn, '')), '');
  v_titulo  text := nullif(btrim(coalesce(p_titulo, '')), '');
  v_stock   int := greatest(1, least(coalesce(p_stock, 1), 500));
  v_libro   public.libros;
begin
  select enlaces_escaneo_remoto.id, revocado, enlaces_escaneo_remoto.expira_en,
         creado_por, creado_por_email
    into v_enlace_id, v_enlace_revocado, v_enlace_expira, v_creado_por, v_creado_por_email
    from public.enlaces_escaneo_remoto
   where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
   for update;

  -- Se revalida aquí, no solo en validar_enlace_escaneo: entre que el celular
  -- comprobó el enlace y llegó a escanear el primer libro puede haber pasado
  -- tiempo de sobra para que expirara.
  if not found or v_enlace_revocado or v_enlace_expira < now() then
    raise exception 'Este enlace no es válido o ya expiró. Pide uno nuevo.' using errcode = 'P0001';
  end if;

  if v_isbn is null then
    raise exception 'Falta el código del libro.' using errcode = 'P0001';
  end if;

  select * into v_libro from public.libros where libros.isbn = v_isbn for update;

  if found then
    update public.libros
       set copias_totales = v_libro.copias_totales + v_stock,
           stock = v_libro.stock + v_stock
     where libros.id = v_libro.id
    returning * into v_libro;

    insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_despues)
    values ('libros', v_libro.id::text, 'UPDATE', v_creado_por, v_creado_por_email,
            jsonb_build_object('operacion', 'escaneo_remoto', 'enlace_id', v_enlace_id,
                                'ejemplares_agregados', v_stock, 'copias_totales', v_libro.copias_totales));

    update public.enlaces_escaneo_remoto
       set usos = usos + 1, ultimo_uso_en = now()
     where enlaces_escaneo_remoto.id = v_enlace_id;

    return query select 'incrementado'::text, v_libro.id::bigint, v_libro.isbn::text, v_libro.titulo::text,
                        v_libro.autor::text, v_libro.stock, v_libro.copias_totales;
    return;
  end if;

  if v_titulo is null then
    return query select 'falta_info'::text, null::bigint, v_isbn, null::text, null::text,
                        null::int, null::int;
    return;
  end if;

  insert into public.libros (isbn, titulo, autor, genero, ubicacion, stock, copias_totales)
  values (v_isbn, v_titulo, nullif(btrim(coalesce(p_autor, '')), ''),
          nullif(btrim(coalesce(p_genero, '')), ''), nullif(btrim(coalesce(p_ubicacion, '')), ''),
          v_stock, v_stock)
  returning * into v_libro;

  insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_despues)
  values ('libros', v_libro.id::text, 'INSERT', v_creado_por, v_creado_por_email,
          jsonb_build_object('operacion', 'escaneo_remoto', 'enlace_id', v_enlace_id,
                              'isbn', v_libro.isbn, 'titulo', v_libro.titulo));

  update public.enlaces_escaneo_remoto
     set usos = usos + 1, ultimo_uso_en = now()
   where enlaces_escaneo_remoto.id = v_enlace_id;

  return query select 'creado'::text, v_libro.id::bigint, v_libro.isbn::text, v_libro.titulo::text,
                      v_libro.autor::text, v_libro.stock, v_libro.copias_totales;
end;
$$;
grant execute on function public.agregar_libro_remoto(text, text, text, text, text, text, int) to authenticated;

-- ── deshacer_libro_remoto ── (nueva, ítem 11 de "pulido, no urgente")
--
-- Revierte UNA acción de agregar_libro_remoto, para el botón "Deshacer" de la
-- lista de lo escaneado en la propia pantalla del celular — pensado para el
-- caso típico de escanear el código equivocado o repetir uno por error.
--
-- CORREGIDO tras la primera versión: esa primera versión recibía p_accion y
-- p_cantidad del celular y confiaba en ellos a ciegas. El único control era
-- que el token siguiera vigente — pero CUALQUIER enlace vigente podía
-- deshacer una acción sobre CUALQUIER libro del catálogo, no solo los que
-- escaneó esa sesión (bastaba con adivinar o probar un libro_id). Con un
-- enlace de hasta 24 horas circulando entre varias personas del mesón, eso
-- permitía borrar o restarle ejemplares a un libro que ese enlace nunca
-- tocó. Rompía el principio que el resto de esta sección documenta:
-- "angosto a propósito... lo máximo que permite es escribir entradas de
-- catálogo".
--
-- Esta versión no recibe ni accion ni cantidad: los deriva ella sola del
-- último movimiento de auditoría que agregar_libro_remoto (o esta misma
-- función) dejó para ESTE libro Y este enlace en concreto
-- (auditoria.datos_despues->>'enlace_id'), sin schema nuevo — la marca ya
-- la deja agregar_libro_remoto desde el principio. Así:
--   · Si ese enlace nunca tocó este libro, no hay nada que deshacer.
--   · Si la acción ya se deshizo antes, no se puede deshacer dos veces
--     (el propio "deshacer" también queda marcado en auditoria, así que el
--     movimiento más reciente lo delata).
--   · Se sabe con certeza si fue 'creado' (accion='INSERT') o 'incrementado'
--     (accion='UPDATE'), y cuánto sumó exactamente (ejemplares_agregados),
--     sin tener que confiarle esos números a nadie.
--
--   · 'creado': el libro no existía antes de esa acción, así que se elimina
--     la fila entera (decisión explícita: no se deja "cero ejemplares"
--     colgando en el catálogo). Si ya se prestó algún ejemplar de ese libro
--     desde que se creó, no se borra — se avisa en vez de romper el
--     préstamo, que quedaría apuntando a un libro inexistente.
--   · 'incrementado': se resta exactamente lo que esa acción sumó —lo mismo
--     que hizo agregar_libro_remoto, en reversa—, pero nunca más de lo que
--     sigue disponible ahora mismo. Si mientras tanto ya se prestó alguno de
--     los ejemplares recién agregados, esos NO se tocan: solo se deshace lo
--     que todavía sigue en el estante.
--
-- Misma revalidación de token que agregar_libro_remoto, por el mismo motivo:
-- nunca confiar en que el celular ya lo comprobó antes.
drop function if exists public.deshacer_libro_remoto(text, bigint, text, int);
drop function if exists public.deshacer_libro_remoto(text, bigint);
create or replace function public.deshacer_libro_remoto(
  p_token    text,
  p_libro_id bigint
)
returns table (deshecho boolean, motivo text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enlace_id         bigint;
  v_enlace_revocado   boolean;
  v_enlace_expira     timestamptz;
  v_creado_por        uuid;
  v_creado_por_email  text;
  v_libro             public.libros;
  v_ultima_operacion  text;
  v_ultima_accion     text;
  v_cantidad_agregada int;
  v_a_quitar          int;
begin
  select enlaces_escaneo_remoto.id, revocado, enlaces_escaneo_remoto.expira_en,
         creado_por, creado_por_email
    into v_enlace_id, v_enlace_revocado, v_enlace_expira, v_creado_por, v_creado_por_email
    from public.enlaces_escaneo_remoto
   where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
   for update;

  if not found or v_enlace_revocado or v_enlace_expira < now() then
    raise exception 'Este enlace no es válido o ya expiró.' using errcode = 'P0001';
  end if;

  select * into v_libro from public.libros where libros.id = p_libro_id for update;
  if not found then
    return query select false, 'Ese libro ya no está en el catálogo.'::text;
    return;
  end if;

  -- El movimiento más reciente de auditoría para ESTE libro Y este enlace,
  -- ya sea el original (escaneo_remoto) o un deshacer anterior
  -- (deshacer_escaneo_remoto). Un solo "en (...)" cubre ambos porque importa
  -- cuál de los dos es el MÁS reciente: si es el deshacer, ya se deshizo.
  select datos_despues->>'operacion', accion, (datos_despues->>'ejemplares_agregados')::int
    into v_ultima_operacion, v_ultima_accion, v_cantidad_agregada
    from public.auditoria
   where tabla = 'libros'
     and registro_id = v_libro.id::text
     and datos_despues->>'operacion' in ('escaneo_remoto', 'deshacer_escaneo_remoto')
     and (datos_despues->>'enlace_id')::bigint = v_enlace_id
   order by created_at desc
   limit 1;

  if v_ultima_operacion is null then
    return query select false,
      'Este enlace no fue el que agregó o repuso este libro; no se puede deshacer desde acá.'::text;
    return;
  end if;
  if v_ultima_operacion = 'deshacer_escaneo_remoto' then
    return query select false, 'Esta acción ya se había deshecho antes.'::text;
    return;
  end if;

  if v_ultima_accion = 'INSERT' then
    if exists (select 1 from public.prestamos where prestamos.libro_id = v_libro.id) then
      return query select false,
        'No se puede deshacer: ya se registró un préstamo de este libro.'::text;
      return;
    end if;

    delete from public.libros where libros.id = v_libro.id;

    insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_antes)
    values ('libros', v_libro.id::text, 'DELETE', v_creado_por, v_creado_por_email,
            jsonb_build_object('operacion', 'deshacer_escaneo_remoto', 'enlace_id', v_enlace_id,
                                'isbn', v_libro.isbn, 'titulo', v_libro.titulo));
  else
    -- Nunca se resta más de lo que sigue disponible ahora mismo: si ya se
    -- prestó alguno de los ejemplares recién agregados, ese queda intacto.
    v_a_quitar := least(greatest(1, coalesce(v_cantidad_agregada, 1)), v_libro.stock);
    if v_a_quitar <= 0 then
      return query select false,
        'No queda ningún ejemplar disponible de esta acción para deshacer (puede estar prestado).'::text;
      return;
    end if;

    update public.libros
       set copias_totales = v_libro.copias_totales - v_a_quitar,
           stock = v_libro.stock - v_a_quitar
     where libros.id = v_libro.id
    returning * into v_libro;

    insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_despues)
    values ('libros', v_libro.id::text, 'UPDATE', v_creado_por, v_creado_por_email,
            jsonb_build_object('operacion', 'deshacer_escaneo_remoto', 'enlace_id', v_enlace_id,
                                'ejemplares_quitados', v_a_quitar, 'copias_totales', v_libro.copias_totales));
  end if;

  update public.enlaces_escaneo_remoto
     set ultimo_uso_en = now()
   where enlaces_escaneo_remoto.id = v_enlace_id;

  return query select true, null::text;
end;
$$;
grant execute on function public.deshacer_libro_remoto(text, bigint) to authenticated;

-- ── listar_enlaces_escaneo ── (nueva)
--
-- Solo un administrador ve el listado completo: es la misma frontera que
-- listar_personal, en Administración.
drop function if exists public.listar_enlaces_escaneo();
create or replace function public.listar_enlaces_escaneo()
returns table (
  id bigint, creado_por_email text, creado_en timestamptz, expira_en timestamptz,
  revocado boolean, usos int, ultimo_uso_en timestamptz, vigente boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver los enlaces de escaneo remoto.' using errcode = 'P0001';
  end if;

  return query
    select e.id, e.creado_por_email, e.creado_en, e.expira_en, e.revocado, e.usos, e.ultimo_uso_en,
           (not e.revocado and e.expira_en > now()) as vigente
    from public.enlaces_escaneo_remoto e
    order by e.creado_en desc
    limit 200;
end;
$$;
grant execute on function public.listar_enlaces_escaneo() to authenticated;

-- ── revocar_enlace_escaneo ── (nueva)
--
-- Puede revocarlo un administrador, o quien creó el enlace (para el botón
-- "Revocar este enlace ahora" de la propia ventana del código QR).
drop function if exists public.revocar_enlace_escaneo(bigint);
create or replace function public.revocar_enlace_escaneo(
  p_id bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creado_por uuid;
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para revocar un enlace.' using errcode = 'P0001';
  end if;

  select creado_por into v_creado_por from public.enlaces_escaneo_remoto where id = p_id;
  if not found then
    raise exception 'Ese enlace no existe.' using errcode = 'P0001';
  end if;

  if not public.es_admin() and v_creado_por is distinct from (select auth.uid()) then
    raise exception 'Solo un administrador, o quien creó el enlace, puede revocarlo.' using errcode = 'P0001';
  end if;

  update public.enlaces_escaneo_remoto
     set revocado = true, revocado_en = now()
   where id = p_id;
end;
$$;
grant execute on function public.revocar_enlace_escaneo(bigint) to authenticated;

-- ── actualizar_contacto_lector ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.actualizar_contacto_lector(bigint, text, text, text);
create or replace function public.actualizar_contacto_lector(
  p_lector_id bigint,
  p_nombre    text,
  p_email     text,
  p_telefono  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text := nullif(btrim(p_nombre), '');
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  if v_nombre is null then
    raise exception 'El nombre del lector no puede quedar vacío.' using errcode = 'P0001';
  end if;

  update public.lectores
     set nombre   = v_nombre,
         email    = nullif(btrim(coalesce(p_email, '')), ''),
         telefono = nullif(btrim(coalesce(p_telefono, '')), '')
   where id = p_lector_id;

  if not found then
    raise exception 'Lector no encontrado.' using errcode = 'P0001';
  end if;
end;
$$;
grant execute on function public.actualizar_contacto_lector(bigint, text, text, text) to authenticated;

-- ============================================================================
-- CUMPLIMIENTO LEGAL — Ley 21.719
-- ============================================================================

-- ── exportar_datos_lector ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.exportar_datos_lector(text);
create or replace function public.exportar_datos_lector(p_rut text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_lector public.lectores;
  v_resultado jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede exportar datos de un titular.' using errcode = 'P0001';
  end if;

  select * into v_lector from public.lectores where rut = p_rut;
  if v_lector.id is null then
    raise exception 'No existe un lector con ese RUT.' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'generado_en', now(),
    'fundamento', 'Solicitud de acceso y portabilidad, Ley 21.719',
    'responsable', 'Ilustre Municipalidad de Futrono — Biblioteca Pública Municipal',
    'datos_personales', jsonb_build_object(
      'nombre', v_lector.nombre,
      'rut', v_lector.rut,
      'email', v_lector.email,
      'telefono', v_lector.telefono,
      'fecha_registro', v_lector.created_at,
      'consentimiento_fecha', v_lector.consentimiento_fecha,
      'consentimiento_version', v_lector.consentimiento_version,
      'es_menor', v_lector.es_menor,
      'apoderado_nombre', v_lector.apoderado_nombre,
      'bloqueado', v_lector.bloqueado_manual,
      'motivo_bloqueo', v_lector.motivo_bloqueo
    ),
    'historial_prestamos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'libro', l.titulo, 'autor', l.autor,
        'fecha_prestamo', p.fecha_prestamo,
        'fecha_devolucion_esperada', p.fecha_devolucion_esperada,
        'fecha_devolucion_real', p.fecha_devolucion_real,
        'estado', p.estado, 'renovaciones', p.renovaciones
      ) order by p.fecha_prestamo desc)
      from public.prestamos p join public.libros l on l.id = p.libro_id
      where p.lector_id = v_lector.id
    ), '[]'::jsonb)
  ) into v_resultado;

  return v_resultado;
end;
$$;
grant execute on function public.exportar_datos_lector(text) to authenticated;

-- ── anonimizar_lector ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.anonimizar_lector(bigint, text);
create or replace function public.anonimizar_lector(p_lector_id bigint, p_motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activos int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede anonimizar a un titular.' using errcode = 'P0001';
  end if;

  select count(*) into v_activos
  from public.prestamos where lector_id = p_lector_id and estado = 'activo';

  if v_activos > 0 then
    raise exception 'Este lector tiene % préstamo(s) activo(s). Debe devolverlos antes de suprimir sus datos.', v_activos
      using errcode = 'P0001';
  end if;

  update public.lectores
     set nombre = 'Lector anonimizado',
         -- El RUT se reemplaza por un identificador irreversible que mantiene
         -- la unicidad de la fila sin permitir reidentificar a la persona
         -- Identificador irreversible que preserva la unicidad de la fila.
         -- Se usa gen_random_uuid() en vez de digest() de pgcrypto: esa
         -- extensión vive en el esquema `extensions` de Supabase y no
         -- resolvería desde aquí, y un UUID aleatorio ya es irreversible.
         rut = 'ANON-' || replace(gen_random_uuid()::text, '-', ''),
         email = null,
         telefono = null,
         motivo_bloqueo = null,
         bloqueado_manual = false,
         apoderado_nombre = null,
         apoderado_rut = null,
         consentimiento_fecha = null,
         consentimiento_version = null
   where id = p_lector_id;

  insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_despues)
  values ('lectores', p_lector_id::text, 'UPDATE', auth.uid(),
          (select email from auth.users where id = auth.uid()),
          jsonb_build_object('operacion', 'anonimizacion', 'motivo', p_motivo, 'fundamento', 'Ley 21.719, derecho de supresión'));
end;
$$;
grant execute on function public.anonimizar_lector(bigint, text) to authenticated;

-- ── purgar_datos_antiguos ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.purgar_datos_antiguos();
create or replace function public.purgar_datos_antiguos()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anios int := public.parametro_int('retencion_prestamos_anios', 5);
  v_corte date := public.hoy_chile() - (v_anios * 365);
  v_lector record;
  v_total int := 0;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ejecutar la purga de datos.' using errcode = 'P0001';
  end if;

  for v_lector in
    select l.id from public.lectores l
    where l.rut not like 'ANON-%'
      and not exists (select 1 from public.prestamos p where p.lector_id = l.id and p.estado = 'activo')
      and coalesce((select max(p.fecha_prestamo) from public.prestamos p where p.lector_id = l.id),
                   l.created_at::date) < v_corte
  loop
    perform public.anonimizar_lector(v_lector.id, 'Purga automática por plazo de conservación (' || v_anios || ' años)');
    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;
grant execute on function public.purgar_datos_antiguos() to authenticated;

-- ── evidencia_incidente ── (última versión: 007_correcciones_y_cumplimiento_legal.sql)
drop function if exists public.evidencia_incidente(timestamptz, timestamptz);
create or replace function public.evidencia_incidente(
  p_desde timestamptz,
  p_hasta timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede extraer evidencia de incidentes.' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'generado_en', now(),
    'rango_desde', p_desde,
    'rango_hasta', p_hasta,
    'total_movimientos', (select count(*) from public.auditoria where created_at between p_desde and p_hasta),
    'por_usuario', coalesce((
      select jsonb_agg(x) from (
        select usuario_email, count(*) as movimientos,
               count(*) filter (where accion = 'DELETE') as eliminaciones,
               min(created_at) as primero, max(created_at) as ultimo
        from public.auditoria
        where created_at between p_desde and p_hasta
        group by usuario_email order by count(*) desc
      ) x), '[]'::jsonb),
    'eliminaciones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'cuando', created_at, 'quien', usuario_email,
        'tabla', tabla, 'registro', registro_id
      ) order by created_at desc)
      from public.auditoria
      where accion = 'DELETE' and created_at between p_desde and p_hasta
    ), '[]'::jsonb)
  );
end;
$$;
grant execute on function public.evidencia_incidente(timestamptz, timestamptz) to authenticated;

-- ============================================================================
-- AUDITORÍA
-- ============================================================================

-- ── registrar_auditoria ── (última versión: 006_bloqueo_inventario_admin.sql)
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_id text;
begin
  begin
    begin
      select email into v_email from auth.users where id = auth.uid();
    exception when others then
      v_email := null;
    end;

    v_id := coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id'));

    insert into public.auditoria (tabla, registro_id, accion, usuario_id, usuario_email, datos_antes, datos_despues)
    values (
      tg_table_name, v_id, tg_op, auth.uid(), v_email,
      case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  exception when others then
    -- La auditoría nunca bloquea la operación principal
    raise warning 'No se pudo registrar la auditoría de % en %: %', tg_op, tg_table_name, sqlerrm;
  end;

  return coalesce(new, old);
end;
$$;

-- ── marcar_actualizacion ── (nueva en 011_marcas_de_sincronizacion.sql)
--
-- Mantiene al día la columna `actualizado_en` de `libros` y `lectores`. Es lo
-- que permite que el equipo del mesón pida "solo lo que cambió desde tal fecha"
-- en vez de descargar el catálogo entero cada vez, que es inviable con la
-- conexión de Futrono.
--
-- Va aquí, y no en la 011, porque la regla de la consolidación dice que las
-- funciones viven en este archivo. La 011 crea las columnas y conecta los
-- disparadores; la definición es esta.
--
-- No es SECURITY DEFINER a propósito: corre dentro de un UPDATE que ya pasó por
-- las políticas RLS, así que no necesita esquivarlas. Una función definer de más
-- es una barrera menos.
create or replace function public.marcar_actualizacion()
returns trigger
language plpgsql
set search_path = public
as $marca$
begin
  if tg_op = 'UPDATE' then
    -- Si la fila no cambió en nada salvo esta misma marca, se deja como estaba.
    -- Sin esto, un UPDATE que no modifica nada —guardar un formulario sin
    -- tocarlo, por ejemplo— obligaría al mesón a volver a descargar el registro
    -- en la próxima sincronización, sin ninguna razón.
    if to_jsonb(new) - 'actualizado_en' is not distinct from to_jsonb(old) - 'actualizado_en' then
      return new;
    end if;
  end if;

  new.actualizado_en := now();
  return new;
end;
$marca$;

-- ============================================================================
-- REGISTRO DE ERRORES
-- ============================================================================

-- ── registrar_error ── (última versión: 009_registro_de_errores.sql)
drop function if exists public.registrar_error(text, text, text, text, text, text);
create or replace function public.registrar_error(
  p_mensaje   text,
  p_origen    text default 'js',
  p_detalle   text default null,
  p_vista     text default null,
  p_accion    text default null,
  p_navegador text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mensaje text := left(coalesce(nullif(btrim(p_mensaje), ''), 'Error sin mensaje'), 500);
  v_vista   text := left(coalesce(p_vista, ''), 60);
  v_email   text;
  v_id      bigint;
begin
  -- Sin sesión no se registra: si no, la llave anónima permitiría a cualquiera
  -- llenar la tabla desde fuera.
  if auth.uid() is null then
    return;
  end if;

  begin
    select email into v_email from auth.users where id = auth.uid();
  exception when others then
    v_email := null;
  end;

  select id into v_id
  from public.errores
  where mensaje = v_mensaje
    and coalesce(vista, '') = v_vista
    and ocurrido_en > now() - interval '1 hour'
  order by ocurrido_en desc
  limit 1;

  if v_id is not null then
    update public.errores
       set repeticiones = repeticiones + 1,
           ocurrido_en  = now()
     where id = v_id;
  else
    insert into public.errores (origen, mensaje, detalle, vista, accion, usuario_id, usuario_email, navegador)
    values (
      left(coalesce(p_origen, 'js'), 20),
      v_mensaje,
      left(coalesce(p_detalle, ''), 2000),
      nullif(v_vista, ''),
      left(coalesce(p_accion, ''), 80),
      auth.uid(),
      v_email,
      left(coalesce(p_navegador, ''), 200)
    );
  end if;
end;
$$;
grant execute on function public.registrar_error(text, text, text, text, text, text) to authenticated;

-- ── listar_errores ── (última versión: 009_registro_de_errores.sql)
drop function if exists public.listar_errores(int, boolean);
create or replace function public.listar_errores(p_limite int default 100, p_solo_nuevos boolean default false)
returns table (
  id bigint,
  ocurrido_en timestamptz,
  origen text,
  mensaje text,
  detalle text,
  vista text,
  accion text,
  usuario_email text,
  navegador text,
  repeticiones int,
  visto boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver el registro de errores.' using errcode = 'P0001';
  end if;

  return query
    select e.id, e.ocurrido_en, e.origen, e.mensaje, e.detalle, e.vista, e.accion,
           e.usuario_email, e.navegador, e.repeticiones, e.visto
    from public.errores e
    where (not p_solo_nuevos or not e.visto)
    order by e.ocurrido_en desc
    limit least(coalesce(p_limite, 100), 500);
end;
$$;
grant execute on function public.listar_errores(int, boolean) to authenticated;

-- ── resumen_errores ── (última versión: 009_registro_de_errores.sql)
drop function if exists public.resumen_errores();
create or replace function public.resumen_errores()
returns table (
  sin_revisar int,
  ultimas_24h int,
  total int,
  mas_reciente timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede ver el registro de errores.' using errcode = 'P0001';
  end if;

  return query
    select
      count(*) filter (where not visto)::int,
      count(*) filter (where ocurrido_en > now() - interval '24 hours')::int,
      count(*)::int,
      max(ocurrido_en)
    from public.errores;
end;
$$;
grant execute on function public.resumen_errores() to authenticated;

-- ── marcar_error_visto ── (última versión: 009_registro_de_errores.sql)
drop function if exists public.marcar_error_visto(bigint);
create or replace function public.marcar_error_visto(p_id bigint default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede marcar errores.' using errcode = 'P0001';
  end if;

  if p_id is null then
    update public.errores set visto = true where not visto;
  else
    update public.errores set visto = true where id = p_id;
  end if;
end;
$$;
grant execute on function public.marcar_error_visto(bigint) to authenticated;

-- ── purgar_errores ── (última versión: 009_registro_de_errores.sql)
drop function if exists public.purgar_errores(int);
create or replace function public.purgar_errores(p_dias int default 90)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borrados int;
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede purgar el registro.' using errcode = 'P0001';
  end if;

  delete from public.errores where ocurrido_en < now() - (greatest(coalesce(p_dias, 90), 1) || ' days')::interval;
  get diagnostics v_borrados = row_count;
  return v_borrados;
end;
$$;
grant execute on function public.purgar_errores(int) to authenticated;

-- ============================================================================
-- AUTODIAGNÓSTICO
-- ============================================================================

-- ── verificar_rls ── (última versión: 009_registro_de_errores.sql; lista de
-- tablas ampliada en 015_lapidas_eliminaciones.sql para incluir
-- elementos_eliminados, y en esta ronda para incluir enlaces_escaneo_remoto
-- (014) y respaldos_log (018) — se habían agregado esas dos tablas sin
-- sumarlas aquí, así que esta función llevaba dos migraciones sin vigilarlas.
-- Se detectó al construir verificar_politicas() (más abajo), que sí las
-- incluye desde el principio. `enlaces_escaneo_remoto` es la única excepción
-- a "cero políticas es crítico": tiene RLS activo pero CERO políticas a
-- propósito, porque solo se accede a través de funciones `security definer`
-- (crear_enlace_escaneo, validar_enlace_escaneo, etc.), nunca tocando la
-- tabla directamente — la función vive aquí igual, según la regla del
-- proyecto de que los cambios a funciones van en este archivo, no en uno nuevo)
drop function if exists public.verificar_rls();
create or replace function public.verificar_rls()
returns table (
  tabla text,
  rls_activo boolean,
  politicas int,
  diagnostico text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- El estado de la protección de la base de datos es información de
  -- reconocimiento: saber si RLS está activo antes de intentar algo.
  if not public.es_admin() then
    raise exception 'Solo un administrador puede revisar la protección de las tablas.' using errcode = 'P0001';
  end if;

  return query
select
    c.relname::text,
    c.relrowsecurity,
    (select count(*)::int from pg_policies p where p.tablename = c.relname and p.schemaname = 'public'),
    case
      when not c.relrowsecurity then 'CRÍTICO: sin RLS, cualquiera puede leer y escribir esta tabla'
      when c.relname <> 'enlaces_escaneo_remoto'
        and (select count(*) from pg_policies p where p.tablename = c.relname and p.schemaname = 'public') = 0
        then 'CRÍTICO: RLS activo pero sin políticas, la tabla queda inaccesible o abierta según el rol'
      else 'Correcto'
    end::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname in (
      'libros', 'lectores', 'prestamos', 'usuarios', 'auditoria', 'parametros',
      'errores', 'elementos_eliminados', 'enlaces_escaneo_remoto', 'respaldos_log'
    )
  order by c.relrowsecurity, c.relname;
end;
$$;
grant execute on function public.verificar_rls() to authenticated;

-- ── verificar_circulacion ── (última versión: 008_perfiles_y_permisos_librero.sql)
drop function if exists public.verificar_circulacion();
create or replace function public.verificar_circulacion()
returns table (
  funcion text,
  es_definer boolean,
  diagnostico text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- El estado de la protección de la base de datos es información de
  -- reconocimiento: saber si RLS está activo antes de intentar algo.
  if not public.es_admin() then
    raise exception 'Solo un administrador puede revisar las funciones de circulación.' using errcode = 'P0001';
  end if;

  return query
select
    p.proname::text,
    p.prosecdef,
    case
      when p.prosecdef then 'Correcto'
      else 'CRÍTICO: corre como invocador; las políticas RLS bloquearán la escritura y el librero no podrá operar'
    end::text
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'prestar_libro', 'devolver_prestamo', 'renovar_prestamo',
      'ajustar_copias', 'corregir_inventario', 'bloquear_lector',
      'actualizar_contacto_lector', 'actualizar_mi_perfil', 'mi_perfil'
    )
  order by p.prosecdef, p.proname;
end;
$$;
grant execute on function public.verificar_circulacion() to authenticated;


-- ============================================================================
-- MANIFIESTO Y VERIFICACIÓN
-- ============================================================================
-- Este es el corazón de la consolidación. No basta con juntar las funciones en
-- un archivo: hace falta algo que avise cuando la base de datos deje de
-- coincidir con él.
--
-- El manifiesto declara qué funciones deben existir y cuáles deben correr con
-- `security definer`. `verificar_definiciones()` compara esa declaración contra
-- lo que PostgreSQL tiene realmente instalado.
--
-- Detecta tres cosas que antes solo se podían descubrir a mano:
--
--   · una función que falta             → la migración no se ejecutó completa
--   · una función que perdió el definer → alguien la redefinió en otro archivo
--   · una función duplicada por firma   → hay dos versiones conviviendo
--
-- Ese tercer caso es el más sutil: si alguien redefine una función cambiándole
-- un parámetro, PostgreSQL crea una SEGUNDA función en vez de reemplazar la
-- primera. Las dos quedan vivas, y cuál se ejecuta depende de cómo se llame.

create or replace function public.manifiesto_funciones()
returns table (nombre text, requiere_definer boolean)
language sql
immutable
as $manifiesto$
  values
    ('hoy_chile', false),
    ('sin_acentos', false),
    ('es_admin', true),
    ('es_personal', true),
    ('parametro_int', true),
    ('estado_lector', true),
    ('buscar_libros', false),
    ('consultar_libro', true),
    ('revisar_inventario', false),
    ('prestar_libro', true),
    ('devolver_prestamo', true),
    ('renovar_prestamo', true),
    ('ajustar_copias', true),
    ('corregir_inventario', true),
    ('bloquear_lector', true),
    ('asignar_rol', true),
    ('asegurar_perfil', true),
    ('mi_perfil', true),
    ('actualizar_mi_perfil', true),
    ('listar_personal', true),
    ('eliminar_personal', true),
    ('crear_enlace_escaneo', true),
    ('validar_enlace_escaneo', true),
    ('agregar_libro_remoto', true),
    ('deshacer_libro_remoto', true),
    ('listar_enlaces_escaneo', true),
    ('revocar_enlace_escaneo', true),
    ('actualizar_contacto_lector', true),
    ('exportar_datos_lector', true),
    ('anonimizar_lector', true),
    ('purgar_datos_antiguos', true),
    ('evidencia_incidente', true),
    ('registrar_auditoria', true),
    ('marcar_actualizacion', false),
    ('registrar_error', true),
    ('listar_errores', true),
    ('resumen_errores', true),
    ('marcar_error_visto', true),
    ('purgar_errores', true),
    ('verificar_rls', true),
    ('verificar_circulacion', true)
$manifiesto$;


create or replace function public.verificar_definiciones()
returns table (
  nombre text,
  estado text,
  diagnostico text
)
language plpgsql
stable
security definer
set search_path = public
as $verif$
begin
  -- El estado de la protección de la base de datos es información de
  -- reconocimiento: saber si RLS está activo antes de intentar algo.
  if not public.es_admin() then
    raise exception 'Solo un administrador puede revisar las definiciones.' using errcode = 'P0001';
  end if;

  return query
with esperado as (
    select m.nombre, m.requiere_definer from public.manifiesto_funciones() m
  ),
  instalado as (
    select p.proname::text as nombre,
           count(*)::int as versiones,
           bool_and(p.prosecdef) as todas_definer
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
    group by p.proname
  )
  select
    e.nombre,
    case
      when i.nombre is null then 'FALTA'
      when i.versiones > 1 then 'DUPLICADA'
      when e.requiere_definer and not i.todas_definer then 'SIN DEFINER'
      else 'Correcto'
    end::text,
    case
      when i.nombre is null then
        'La funcion no existe. Ejecuta la migracion 010 completa.'
      when i.versiones > 1 then
        'Hay ' || i.versiones || ' versiones conviviendo. Alguien la redefinio con otra firma en vez de editar la 010. Elimina la sobrante con drop function.'
      when e.requiere_definer and not i.todas_definer then
        'CRITICO: corre como invocador. Las politicas RLS bloquearan la escritura y el personal no podra operar. Vuelve a ejecutar la 010.'
      else 'Correcto'
    end::text
  from esperado e
  left join instalado i on i.nombre = e.nombre
  order by
    case
      when i.nombre is null then 1
      when i.versiones > 1 then 2
      when e.requiere_definer and not i.todas_definer then 3
      else 4
    end,
    e.nombre;
end;
$verif$;

grant execute on function public.manifiesto_funciones() to authenticated;
grant execute on function public.verificar_definiciones() to authenticated;


-- ============================================================================
-- MANIFIESTO Y VERIFICACIÓN DE POLÍTICAS RLS Y PERMISOS
-- ============================================================================
-- Mismo espíritu que `manifiesto_funciones()` / `verificar_definiciones()` de
-- arriba, pero para lo que protege las TABLAS en vez de las funciones: qué
-- políticas RLS debe tener cada una, y a quién se le concedió acceso.
--
-- `verificar_rls()` (más arriba) ya avisa si a una tabla le falta RLS o se
-- quedó sin ninguna política — eso alcanza para notar que algo se rompió,
-- pero no para notar que alguien cambió CUÁL política existe (la borró desde
-- el SQL Editor del panel de Supabase, por ejemplo, sin pasar por una
-- migración) ni si agregó una nueva que nadie revisó. Es el mismo hueco que
-- `verificar_definiciones()` cierra para las funciones, ahora para políticas.
--
-- Sobre los permisos (GRANT): Supabase concede automáticamente acceso amplio
-- a `anon` y `authenticated` sobre cualquier tabla nueva de `public` — es su
-- comportamiento de fábrica, no una decisión de este proyecto, y por eso no
-- tiene sentido exigir aquí una lista exacta de privilegios por tabla (ver la
-- nota larga en `pruebas/00_base_supabase.sql`). Lo que SÍ vale la pena vigilar
-- son las dos cosas que si pasan son casi siempre un error: que alguien haya
-- hecho `grant ... to public` (el rol PÚBLICO de Postgres, que le da acceso a
-- absolutamente cualquiera, ni siquiera pasa por `anon`/`authenticated`) o que
-- a `authenticated` le falte hasta el `select` en alguna tabla protegida —
-- eso dejaría a todo el personal sin poder trabajar en ella.

create or replace function public.manifiesto_tablas_protegidas()
returns table (tabla text)
language sql
immutable
as $manifiesto$
  values
    ('libros'), ('lectores'), ('prestamos'), ('usuarios'),
    ('auditoria'), ('parametros'), ('errores'), ('elementos_eliminados'),
    ('enlaces_escaneo_remoto'), ('respaldos_log')
$manifiesto$;

-- Una fila por política que debe existir. `enlaces_escaneo_remoto` no
-- aparece a propósito: tiene RLS activo y CERO políticas a propósito, porque
-- solo se accede a través de funciones `security definer`
-- (`crear_enlace_escaneo`, `validar_enlace_escaneo`, etc.) — no se toca la
-- tabla directamente. Eso también se comprueba abajo, no solo se ignora.
--
-- "Acceso autenticado {libros,lectores,prestamos}" NO están aquí a
-- propósito, aunque existieron en producción hasta la migración 019: eran
-- tres políticas de deriva (cmd=ALL, roles={authenticated}, qual=true,
-- with_check=true) que le daban a CUALQUIER usuario autenticado —
-- cualquier `librero`, no solo un admin— acceso total de lectura, escritura
-- y borrado sobre `libros`, `lectores` y `prestamos`. Postgres combina las
-- políticas RLS permisivas con OR, así que estas tres anulaban en la
-- práctica a las políticas más estrechas de abajo (`libros borrado admin`,
-- etc.): bastaba con estar autenticado para borrar lo que fuera, sin
-- importar el rol. Encontradas el 22 de agosto de 2026 exactamente por lo
-- que este manifiesto existe — comparar `pg_policies` contra lo que
-- debería haber — y eliminadas ese mismo día por la migración 019. Ver ese
-- archivo para el detalle completo.
create or replace function public.manifiesto_politicas()
returns table (tabla text, politica text, comando text)
language sql
immutable
as $manifiesto$
  values
    ('auditoria', 'auditoria insercion por trigger', 'INSERT'),
    ('auditoria', 'auditoria solo lectura admin', 'SELECT'),
    ('elementos_eliminados', 'elementos_eliminados lectura personal', 'SELECT'),
    ('errores', 'errores borrado admin', 'DELETE'),
    ('errores', 'errores lectura admin', 'SELECT'),
    ('lectores', 'lectores borrado admin', 'DELETE'),
    ('lectores', 'lectores edicion admin', 'UPDATE'),
    ('lectores', 'lectores insercion personal', 'INSERT'),
    ('lectores', 'lectores lectura personal', 'SELECT'),
    ('libros', 'libros borrado admin', 'DELETE'),
    ('libros', 'libros edicion admin', 'UPDATE'),
    ('libros', 'libros insercion personal', 'INSERT'),
    ('libros', 'libros lectura personal', 'SELECT'),
    ('parametros', 'parametros escritura admin', 'ALL'),
    ('parametros', 'parametros lectura', 'SELECT'),
    ('prestamos', 'prestamos borrado admin', 'DELETE'),
    ('prestamos', 'prestamos lectura personal', 'SELECT'),
    ('respaldos_log', 'admin_lee_respaldos_log', 'SELECT'),
    ('usuarios', 'Autoprovisionar fila propia como librero', 'INSERT'),
    ('usuarios', 'Solo admins cambian roles', 'UPDATE'),
    ('usuarios', 'usuarios admin gestiona', 'ALL'),
    ('usuarios', 'usuarios ve su perfil', 'SELECT')
$manifiesto$;

create or replace function public.verificar_politicas()
returns table (
  categoria text,
  tabla text,
  item text,
  estado text,
  diagnostico text
)
language plpgsql
stable
security definer
set search_path = public
as $verif$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede revisar las políticas y permisos.' using errcode = 'P0001';
  end if;

  return query
  select r.categoria, r.tabla, r.item, r.estado, r.diagnostico
  from (
  -- 1) RLS activo en cada tabla que debe estar protegida
  select
    'RLS'::text as categoria,
    m.tabla as tabla,
    'RLS activo'::text as item,
    case when c.relrowsecurity then 'Correcto' else 'CRÍTICO' end::text as estado,
    case when c.relrowsecurity then 'Correcto'
      else 'La tabla no tiene RLS activo: cualquiera con la llave anónima puede leerla y escribirla entera.'
    end::text as diagnostico
  from public.manifiesto_tablas_protegidas() m
  left join pg_class c on c.relname = m.tabla
    and c.relnamespace = 'public'::regnamespace
  union all
  -- 2) Cada política del manifiesto existe de verdad, con el comando esperado
  select
    'Política'::text,
    m.tabla,
    m.politica,
    case
      when p.policyname is null then 'FALTA'
      when p.cmd <> m.comando then 'COMANDO DISTINTO'
      else 'Correcto'
    end::text,
    case
      when p.policyname is null then
        'La política no existe. Alguien la borró fuera de una migración, o falta aplicar una.'
      when p.cmd <> m.comando then
        format('Se esperaba para %s, está declarada para %s.', m.comando, p.cmd)
      else 'Correcto'
    end::text
  from public.manifiesto_politicas() m
  left join pg_policies p on p.schemaname = 'public'
    and p.tablename = m.tabla and p.policyname = m.politica
  union all
  -- 3) Ninguna política viva que no esté en el manifiesto (posible cambio
  --    hecho a mano desde el panel, sin dejar constancia en una migración)
  select
    'Política inesperada'::text,
    p.tablename::text,
    p.policyname::text,
    'INESPERADA'::text,
    'Existe en la base de datos pero no en manifiesto_politicas(). Si es intencional, agrégala ahí; si no, revisa quién la creó.'::text
  from pg_policies p
  where p.schemaname = 'public'
    and not exists (
      select 1 from public.manifiesto_politicas() m
      where m.tabla = p.tablename and m.politica = p.policyname
    )
  union all
  -- 4) Nadie le dio acceso al rol PUBLIC (todo el mundo, ni siquiera pasa por anon/authenticated)
  select
    'Permiso'::text,
    g.table_name::text,
    'grant a PUBLIC'::text,
    'CRÍTICO'::text,
    format('La tabla tiene un GRANT directo al rol PUBLIC (%s). Revócalo: revoke all on public.%I from public.', g.privilege_type, g.table_name)::text
  from information_schema.role_table_grants g
  where g.table_schema = 'public' and g.grantee = 'PUBLIC'
  union all
  -- 5) authenticated conserva al menos SELECT en cada tabla protegida
  select
    'Permiso'::text,
    m.tabla,
    'authenticated puede leer'::text,
    case when g.table_name is null then 'CRÍTICO' else 'Correcto' end::text,
    case when g.table_name is null
      then 'authenticated no tiene ni SELECT en esta tabla: el personal no podrá usarla.'
      else 'Correcto'
    end::text
  from public.manifiesto_tablas_protegidas() m
  left join information_schema.role_table_grants g
    on g.table_schema = 'public' and g.table_name = m.tabla
    and g.grantee = 'authenticated' and g.privilege_type = 'SELECT'
  ) r
  order by r.categoria,
    case r.estado when 'Correcto' then 1 else 0 end,
    r.tabla, r.item;
end;
$verif$;

grant execute on function public.manifiesto_tablas_protegidas() to authenticated;
grant execute on function public.manifiesto_politicas() to authenticated;
grant execute on function public.verificar_politicas() to authenticated;


-- ============================================================================
-- DISPARADOR DE AUDITORÍA
-- ============================================================================
-- `registrar_auditoria` es una función de disparador. Volver a declararla no
-- reconecta los disparadores, así que se rehacen aquí. Si no, la función quedaría
-- actualizada pero sin nada que la llame, y la bitácora dejaría de registrar en
-- silencio — otro fallo de los que no avisan.

do $bloque$
declare
  v_tabla text;
begin
  foreach v_tabla in array array['libros', 'lectores', 'prestamos'] loop
    execute format('drop trigger if exists auditoria_%s on public.%I', v_tabla, v_tabla);
    execute format(
      'create trigger auditoria_%s after insert or update or delete on public.%I '
      'for each row execute function public.registrar_auditoria()', v_tabla, v_tabla);
  end loop;
end;
$bloque$;


-- ============================================================================
-- QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO
-- ============================================================================
--   select * from public.verificar_definiciones() where estado <> 'Correcto';
--       → no debe devolver ninguna fila
--
--   select * from public.verificar_rls();
--   select * from public.verificar_circulacion();
--       → todo en 'Correcto'
--
-- Las tres también se ven en Administración → Diagnóstico.
--
-- Y la prueba que ninguna consulta reemplaza: entrar con una cuenta de librero,
-- prestar un libro y devolverlo, confirmando que el stock baja y vuelve.
-- ============================================================================


-- ============================================================================
-- PERMISOS DE EJECUCIÓN — quitar el acceso implícito
-- ============================================================================
-- PostgreSQL otorga EXECUTE a PUBLIC en cada función nueva, por omisión. Las
-- migraciones anteriores hacían `grant execute ... to authenticated`, lo que
-- parecía restringir el acceso, pero en realidad no quitaba nada: el permiso
-- implícito a PUBLIC seguía ahí, y el rol `anon` lo heredaba.
--
-- Eso importa porque la llave anónima de Supabase es pública por diseño: va
-- escrita en config.js, que se sirve al navegador. Cualquiera puede leerla con
-- F12 y llamar cualquier función del sistema.
--
-- Las guardas internas (es_admin / es_personal) son la defensa principal y
-- ahora están en todas las funciones que lo necesitan. Esto es la segunda capa:
-- si algún día se agrega una función y se olvida la guarda, el permiso ya no
-- estará abierto de par en par.
--
-- Se limita a las funciones del manifiesto a propósito. Un
-- `revoke ... on all functions in schema public` alcanzaría también a las
-- funciones de extensiones como pg_trgm o unaccent, y romperían las búsquedas.

do $permisos$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as firma
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (select nombre from public.manifiesto_funciones())
  loop
    execute format('revoke all on function %s from public', r.firma);
    execute format('revoke all on function %s from anon', r.firma);
    execute format('grant execute on function %s to authenticated', r.firma);
  end loop;
end;
$permisos$;

-- registrar_auditoria es una función de disparador: no se llama desde la
-- aplicación, así que no necesita permiso para nadie. Los disparadores se
-- ejecutan en el contexto del dueño de la tabla, no de quien escribe.
revoke all on function public.registrar_auditoria() from public, anon;
revoke all on function public.marcar_actualizacion() from public, anon;

-- Escaneo remoto sin sesión: tres funciones SÍ deben quedar abiertas a `anon`,
-- porque quien escanea desde el enlace nunca inicia sesión. El bloque de
-- arriba ya les quitó el permiso a `anon` (alcanza a toda función del
-- manifiesto); se restituye aquí, aparte y a propósito, para que quede visible
-- como una excepción deliberada y no como un descuido. El control de acceso
-- no es el rol —anon es, por definición, cualquiera— sino el token de un solo
-- objetivo que cada una exige y valida por su cuenta (ver 010, sección
-- «ESCANEO REMOTO SIN SESIÓN»).
grant execute on function public.validar_enlace_escaneo(text) to anon;
grant execute on function public.agregar_libro_remoto(text, text, text, text, text, text, int) to anon;
grant execute on function public.deshacer_libro_remoto(text, bigint) to anon;
