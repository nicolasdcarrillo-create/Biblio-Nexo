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
  portada_url text, copias_totales int, stock int, total_coincidencias bigint
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
  v_prestamo_id bigint;
  v_hoy date := public.hoy_chile();
  v_dias int := public.parametro_int('dias_prestamo', 7);
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

  select stock into v_stock from public.libros where id = p_libro_id for update;
  if v_stock is null then
    raise exception 'Libro no encontrado.' using errcode = 'P0001';
  end if;
  if v_stock < 1 then
    raise exception 'No hay ejemplares disponibles de este libro.' using errcode = 'P0001';
  end if;

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
  v_limite int := public.parametro_int('max_renovaciones', 2);
  v_dias int := public.parametro_int('dias_prestamo', 7);
begin
  if not public.es_personal() then
    raise exception 'Debes iniciar sesión para renovar un préstamo.' using errcode = 'P0001';
  end if;

  select estado, fecha_devolucion_esperada, renovaciones
    into v_estado, v_vence, v_renovaciones
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

-- ── verificar_rls ── (última versión: 009_registro_de_errores.sql)
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
      when (select count(*) from pg_policies p where p.tablename = c.relname and p.schemaname = 'public') = 0
        then 'CRÍTICO: RLS activo pero sin políticas, la tabla queda inaccesible o abierta según el rol'
      else 'Correcto'
    end::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname in ('libros', 'lectores', 'prestamos', 'usuarios', 'auditoria', 'parametros', 'errores')
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
