-- ============================================================================
-- BiblioNexo — 008: Perfiles del personal y corrección del rol "librero"
-- ============================================================================
-- Ejecutar DESPUÉS de la 007. Es idempotente: se puede correr más de una vez
-- sin efectos secundarios.
--
-- ESTA MIGRACIÓN ARREGLA UN FALLO QUE DEJA AL LIBRERO SIN PODER TRABAJAR.
--
-- El diagnóstico, en corto:
--
--   Las políticas RLS que estaban documentadas en SUPABASE-PASO-A-PASO.md
--   dejan `libros` con UPDATE solo para administradores, y `prestamos` sin
--   ninguna política de INSERT ni de UPDATE.
--
--   Al mismo tiempo, prestar_libro, devolver_prestamo, renovar_prestamo y
--   ajustar_copias se declararon SIN "security definer", es decir, corren con
--   los permisos de quien las llama. Resultado:
--
--     · prestar_libro     → hace UPDATE libros + INSERT prestamos → falla
--     · devolver_prestamo → hace UPDATE prestamos + UPDATE libros → falla
--     · renovar_prestamo  → hace UPDATE prestamos                 → falla
--
--   El INSERT lanza un error visible ("new row violates row-level security
--   policy"). Los UPDATE son peores: RLS los convierte en cero filas afectadas
--   SIN ERROR. Es decir, devolver_prestamo termina bien, la pantalla dice
--   "Devolución registrada", y en la base de datos no cambió nada.
--
-- La corrección tiene dos partes, y ambas son necesarias:
--   A) Las políticas RLS pasan a vivir aquí, en una migración versionada, y no
--      en un documento que hay que copiar a mano y se puede olvidar.
--   B) Las funciones de circulación pasan a SECURITY DEFINER con un control de
--      acceso explícito adentro. Así el librero puede prestar y devolver, pero
--      sigue sin poder editar ni borrar el catálogo por la vía directa.
--
-- Además agrega el perfil editable de cada miembro del personal.
-- ============================================================================


-- ============================================================================
-- A. QUIÉN ES PERSONAL
-- ============================================================================
-- Complemento de es_admin(). Sirve para distinguir "cualquiera con la llave
-- anónima" de "una persona con sesión iniciada en el sistema". La llave anon
-- es pública por diseño, así que esta comprobación no es decorativa.

create or replace function public.es_personal()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null;
$$;

grant execute on function public.es_personal() to authenticated;


-- ============================================================================
-- B. PERFIL DEL PERSONAL
-- ============================================================================
-- Hasta ahora la tabla `usuarios` solo guardaba id, email y rol. La persona que
-- usa el sistema no tenía forma de identificarse con su nombre, ni de dejar un
-- teléfono de contacto interno, ni de saber qué cuenta tiene abierta más allá
-- del correo. En un mesón compartido entre varias personas eso importa: la
-- bitácora de auditoría registra quién hizo cada cosa, y "quién" debería ser un
-- nombre y no solo una dirección de correo.

alter table public.usuarios add column if not exists nombre text;
alter table public.usuarios add column if not exists telefono text;
alter table public.usuarios add column if not exists cargo text;
alter table public.usuarios add column if not exists actualizado_en timestamptz;
alter table public.usuarios add column if not exists creado_en timestamptz default now();


/**
 * Crea la fila de perfil del usuario que está en sesión, si todavía no existe.
 *
 * Hace falta porque `auth.users` y `public.usuarios` son tablas distintas:
 * alguien puede iniciar sesión y no tener fila de perfil. Ese hueco es el que
 * hacía que un administrador apareciera como librero.
 *
 * El rol nunca se decide aquí: quien no tiene fila entra como 'librero', que es
 * el de menor privilegio. Subir a 'admin' sigue siendo un acto deliberado, vía
 * asignar_rol().
 */
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


/**
 * Devuelve el perfil completo de quien está en sesión.
 * Crea la fila al vuelo si falta, para que la pantalla nunca quede en blanco.
 */
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


/**
 * Guarda los cambios que la persona hace en su propio perfil.
 *
 * Deliberadamente NO recibe el rol ni el id: se toman de la sesión. Si el rol
 * fuera un parámetro, cualquier librero podría ascenderse a administrador
 * llamando a esta función desde la consola del navegador. Cambiar roles sigue
 * siendo exclusivo de asignar_rol(), que exige es_admin().
 *
 * El correo tampoco se toca aquí: es la identidad de la cuenta y se cambia
 * desde autenticación, no desde una tabla de la aplicación.
 */
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


-- La lista de personal ahora muestra el nombre y el cargo, no solo el correo.
-- Se elimina primero porque cambia el tipo de retorno y PostgreSQL no permite
-- reemplazarlo con "create or replace".
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


-- ============================================================================
-- C. CORRECCIÓN DEL ROL LIBRERO — funciones de circulación
-- ============================================================================
-- Se reinstalan con SECURITY DEFINER y control de acceso explícito adentro.
--
-- Por qué es seguro: la función define exactamente qué puede pasar. Prestar
-- descuenta una copia y crea un préstamo, nada más. No abre la tabla `libros`
-- a escritura libre; el librero sigue sin poder cambiar un título ni borrar
-- una obra, porque esas rutas pasan por las políticas RLS que quedan intactas.

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


-- ajustar_copias ya validaba es_admin() adentro, pero corría como invocador,
-- así que el UPDATE lo bloqueaba la misma política que ya había comprobado.
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


-- ============================================================================
-- D. EL LIBRERO PUEDE CORREGIR EL CONTACTO DE UN LECTOR
-- ============================================================================
-- El sistema le pide al librero que avise a los lectores atrasados, y cuando
-- falta el teléfono le dice "complétalo en la vista Usuarios". Pero el librero
-- no tiene esa vista, y aunque la tuviera, la política de UPDATE sobre
-- `lectores` es solo para administradores. Era un callejón sin salida.
--
-- Esta función abre exactamente lo necesario: nombre, correo y teléfono. El
-- RUT no se puede cambiar (es la identidad del lector y la clave de sus
-- préstamos), y borrar sigue siendo exclusivo del administrador.

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
-- E. POLÍTICAS RLS — ahora versionadas, no copiadas a mano
-- ============================================================================
-- Estaban solo en SUPABASE-PASO-A-PASO.md. Un paso manual que hay que recordar
-- es un paso que en algún momento no se hace. Al vivir en una migración, se
-- aplica igual que el resto y queda registro de qué versión está puesta.

alter table public.libros     enable row level security;
alter table public.lectores   enable row level security;
alter table public.prestamos  enable row level security;
alter table public.usuarios   enable row level security;

-- LIBROS ---------------------------------------------------------------------
-- El personal consulta y agrega. Editar y borrar es de administradores.
-- El descuento de stock al prestar NO pasa por aquí: lo hace prestar_libro,
-- que es SECURITY DEFINER y solo puede sumar o restar una copia.
drop policy if exists "libros lectura personal"   on public.libros;
drop policy if exists "libros insercion personal" on public.libros;
drop policy if exists "libros edicion admin"      on public.libros;
drop policy if exists "libros borrado admin"      on public.libros;

create policy "libros lectura personal"   on public.libros
  for select to authenticated using (true);
create policy "libros insercion personal" on public.libros
  for insert to authenticated with check (public.es_personal());
create policy "libros edicion admin"      on public.libros
  for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "libros borrado admin"      on public.libros
  for delete to authenticated using (public.es_admin());

-- LECTORES -------------------------------------------------------------------
-- Datos personales de vecinos: nada visible sin sesión iniciada.
drop policy if exists "lectores lectura personal"   on public.lectores;
drop policy if exists "lectores insercion personal" on public.lectores;
drop policy if exists "lectores edicion admin"      on public.lectores;
drop policy if exists "lectores borrado admin"      on public.lectores;

create policy "lectores lectura personal"   on public.lectores
  for select to authenticated using (public.es_personal());
create policy "lectores insercion personal" on public.lectores
  for insert to authenticated with check (public.es_personal());
create policy "lectores edicion admin"      on public.lectores
  for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "lectores borrado admin"      on public.lectores
  for delete to authenticated using (public.es_admin());

-- PRESTAMOS ------------------------------------------------------------------
-- Solo lectura y borrado por la vía directa. Todo lo demás pasa por las
-- funciones, que son las que aplican stock, límite por lector y bloqueos.
drop policy if exists "prestamos lectura personal" on public.prestamos;
drop policy if exists "prestamos borrado admin"    on public.prestamos;

create policy "prestamos lectura personal" on public.prestamos
  for select to authenticated using (public.es_personal());
create policy "prestamos borrado admin"    on public.prestamos
  for delete to authenticated using (public.es_admin());

-- USUARIOS -------------------------------------------------------------------
-- Cada quien ve y edita su propio perfil; el rol solo lo cambia un admin.
drop policy if exists "usuarios ve su rol"      on public.usuarios;
drop policy if exists "usuarios admin gestiona" on public.usuarios;
drop policy if exists "usuarios ve su perfil"   on public.usuarios;

create policy "usuarios ve su perfil"   on public.usuarios
  for select to authenticated using (id = auth.uid() or public.es_admin());
create policy "usuarios admin gestiona" on public.usuarios
  for all to authenticated using (public.es_admin()) with check (public.es_admin());


-- ============================================================================
-- F. AUTODIAGNÓSTICO DE CIRCULACIÓN
-- ============================================================================
-- verificar_rls() dice si hay políticas, pero no si el librero puede trabajar.
-- Esta función responde la pregunta que de verdad importa: ¿las funciones que
-- escriben están declaradas de forma que RLS no las bloquee en silencio?
--
-- Es lo que había que revisar a mano entrando con una cuenta de librero real.

create or replace function public.verificar_circulacion()
returns table (
  funcion text,
  es_definer boolean,
  diagnostico text
)
language sql
stable
security definer
set search_path = public
as $$
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
$$;

grant execute on function public.verificar_circulacion() to authenticated;


-- ============================================================================
-- G. QUÉ REVISAR DESPUÉS DE EJECUTAR ESTO
-- ============================================================================
--   select * from public.verificar_rls();          -- las 6 tablas: "Correcto"
--   select * from public.verificar_circulacion();  -- las 9 funciones: "Correcto"
--
-- Y la prueba que ninguna consulta reemplaza: entrar con una cuenta de librero
-- real, prestar un libro, devolverlo, y confirmar en la tabla que el stock
-- volvió al número anterior.
-- ============================================================================
