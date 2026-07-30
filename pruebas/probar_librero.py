"""
Prueba funcional contra PostgreSQL real.

Objetivo doble:
  1. Demostrar que el fallo del rol librero existía de verdad (no era una
     sospecha al leer el código).
  2. Demostrar que la migración 008 lo corrige, sin abrir permisos de más.

Se emula el entorno de Supabase: rol `authenticated` y la variable de sesión
`request.jwt.claim.sub`, que es de donde auth.uid() saca el usuario.
"""

import os, pathlib, sys, re, psycopg

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# Dos formas de conectarse, según dónde se ejecute:
#
#   · En integración continua hay un PostgreSQL de servicio y se pasa por
#     DATABASE_URL.
#   · En un equipo local se levanta uno con pgserver, que trae PostgreSQL
#     empaquetado y no requiere instalarlo aparte.
URI = os.environ.get('DATABASE_URL')
if URI:
    print(f'Base de datos: la indicada en DATABASE_URL')
else:
    # pgserver trae PostgreSQL empaquetado, pero solo para Linux y macOS.
    # En Windows hay que indicar DATABASE_URL o ejecutar dentro de WSL.
    try:
        import pgserver
    except ImportError:
        print('No encuentro pgserver ni la variable DATABASE_URL.\n'
              '  · Linux o macOS:  pip install pgserver "psycopg[binary]"\n'
              '  · Windows:        usa WSL, o apunta a un PostgreSQL existente con\n'
              '                    set DATABASE_URL=postgresql://usuario:clave@localhost:5432/basededatos')
        sys.exit(1)
    import tempfile
    datos = pathlib.Path(os.environ.get('PGDATOS') or (pathlib.Path(tempfile.gettempdir()) / 'biblionexo-pruebas'))
    datos.mkdir(parents=True, exist_ok=True)
    URI = pgserver.get_server(datos).get_uri()
    print(f'Base de datos: PostgreSQL local en {datos}')


def preparar_esquema():
    """Deja la base con el esquema base y las diez migraciones aplicadas."""
    archivos = [RAIZ / 'pruebas' / '00_base_supabase.sql']
    archivos += sorted((RAIZ / 'supabase' / 'migrations').glob('*.sql'))
    for archivo in archivos:
        try:
            with psycopg.connect(URI, autocommit=True) as c, c.cursor() as cur:
                cur.execute(archivo.read_text(encoding='utf-8'))
        except Exception as e:
            print(f'  FALLO al aplicar {archivo.name}: {str(e)[-400:]}')
            sys.exit(1)
    print(f'Esquema preparado: {len(archivos)} archivos aplicados\n')


if os.environ.get('PREPARAR_ESQUEMA', '1') == '1':
    preparar_esquema()

pasadas, fallidas = 0, 0

def comprobar(desc, condicion, detalle=''):
    global pasadas, fallidas
    if condicion:
        pasadas += 1
        print(f'  OK    {desc}')
    else:
        fallidas += 1
        print(f'  FALLO {desc}' + (f' — {detalle}' if detalle else ''))

def sql(texto, como_usuario=None):
    """Ejecuta como superusuario, o con la identidad y permisos de un usuario."""
    try:
        with psycopg.connect(URI, autocommit=True) as c, c.cursor() as cur:
            if como_usuario:
                cur.execute("set role authenticated")
                cur.execute("select set_config('request.jwt.claim.sub', %s, false)", (como_usuario,))
            cur.execute(texto)
            try:
                return True, cur.fetchall()
            except psycopg.ProgrammingError:
                return True, []
    except Exception as e:
        return False, str(e)

def como(usuario, consulta):
    return sql(consulta, como_usuario=usuario)

def valor(consulta):
    """Un solo dato, como superusuario, sin RLS de por medio."""
    ok, r = sql(consulta)
    if not ok:
        return None
    return r[0][0] if r and r[0] else None

def texto(resultado):
    return str(resultado)

# ---------------------------------------------------------------------------
print('\nPreparación: dos cuentas, un libro y un lector')
# ---------------------------------------------------------------------------
ADMIN = '11111111-1111-1111-1111-111111111111'
LIBRERO = '22222222-2222-2222-2222-222222222222'

ok, out = sql(f"""
delete from public.prestamos; delete from public.lectores; delete from public.libros;
delete from public.usuarios; delete from auth.users;

insert into auth.users (id, email) values
  ('{ADMIN}', 'admin@futrono.cl'),
  ('{LIBRERO}', 'librera@futrono.cl');

insert into public.usuarios (id, email, rol) values
  ('{ADMIN}', 'admin@futrono.cl', 'admin'),
  ('{LIBRERO}', 'librera@futrono.cl', 'librero');

insert into public.libros (isbn, titulo, autor, stock, copias_totales)
  values ('9789561234567', 'Cuentos del Lago Ranco', 'Ramón Quichiyao', 3, 3);

insert into public.lectores (rut, nombre, email, telefono)
  values ('12345678-5', 'Maria Antileo', 'maria@correo.cl', '56911112222');
""")
comprobar('datos de prueba cargados', ok, texto(out)[-300:] if not ok else '')
if not ok:
    sys.exit(1)

libro_id = valor("select id from public.libros limit 1;")


# ---------------------------------------------------------------------------
print('\n1. REPRODUCCIÓN DEL FALLO — funciones como estaban antes de la 008')
# ---------------------------------------------------------------------------
# Se reinstalan prestar_libro y devolver_prestamo SIN "security definer",
# que es exactamente como venían en las migraciones 004 y 007.
sql("""
create or replace function public.prestar_libro(p_libro_id bigint, p_lector_rut text)
returns table (prestamo_id bigint, fecha_devolucion_esperada date)
language plpgsql set search_path = public as $f$
declare v_lector_id bigint; v_stock int; v_prestamo_id bigint;
        v_hoy date := public.hoy_chile(); v_dias int := public.parametro_int('dias_prestamo', 7);
begin
  select id into v_lector_id from public.lectores where rut = p_lector_rut;
  select stock into v_stock from public.libros where id = p_libro_id for update;
  update public.libros set stock = stock - 1 where id = p_libro_id;
  insert into public.prestamos (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, estado)
  values (p_libro_id, v_lector_id, v_hoy, v_hoy + v_dias, 'activo') returning id into v_prestamo_id;
  return query select v_prestamo_id::bigint, (v_hoy + v_dias)::date;
end; $f$;

create or replace function public.devolver_prestamo(p_prestamo_id bigint)
returns void language plpgsql set search_path = public as $f$
declare v_libro_id bigint;
begin
  select libro_id into v_libro_id from public.prestamos where id = p_prestamo_id for update;
  update public.prestamos set estado = 'devuelto', fecha_devolucion_real = public.hoy_chile()
    where id = p_prestamo_id;
  update public.libros set stock = stock + 1 where id = v_libro_id;
end; $f$;
""")

ok, out = como(LIBRERO, f"select * from public.prestar_libro({libro_id}, '12345678-5');")
comprobar('un librero NO podía prestar (error de RLS)',
          not ok and 'row-level security' in texto(out).lower(),
          f'resultado inesperado: {out[-200:]}')

# Se crea un préstamo saltándose RLS, para poder probar la devolución
sql(f"""insert into public.prestamos (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, estado)
        select {libro_id}, id, current_date, current_date + 7, 'activo' from public.lectores limit 1;
        update public.libros set stock = 2 where id = {libro_id};""")
prestamo_id = valor("select id from public.prestamos order by id desc limit 1;")

stock_antes = valor(f"select stock from public.libros where id = {libro_id};")
ok, out = como(LIBRERO, f"select public.devolver_prestamo({prestamo_id});")
estado_despues = valor(f"select estado from public.prestamos where id = {prestamo_id};")
stock_despues = valor(f"select stock from public.libros where id = {libro_id};")

comprobar('la devolución terminaba SIN ERROR (esa era la parte peligrosa)', ok,
          f'devolvió error: {out[-200:]}')
comprobar('...pero el préstamo seguía activo en la base de datos',
          estado_despues == 'activo', f'estado = {estado_despues}')
comprobar('...y el stock no se movía',
          stock_antes == stock_despues, f'{stock_antes} -> {stock_despues}')

print('      → confirmado: el sistema informaba éxito y no guardaba nada.')


# ---------------------------------------------------------------------------
print('\n2. CORRECCIÓN — se reaplica la migración 008')
# ---------------------------------------------------------------------------
m008 = (RAIZ / 'supabase' / 'migrations' / '008_perfiles_y_permisos_librero.sql').read_text(encoding='utf-8')
ok, out = sql(m008)
comprobar('la 008 se puede volver a ejecutar sin errores (es idempotente)', ok, texto(out)[-400:] if not ok else '')

# Estado limpio
sql(f"""delete from public.prestamos;
        update public.libros set stock = 3, copias_totales = 3 where id = {libro_id};""")


# ---------------------------------------------------------------------------
print('\n3. EL LIBRERO YA PUEDE TRABAJAR')
# ---------------------------------------------------------------------------
ok, out = como(LIBRERO, f"select * from public.prestar_libro({libro_id}, '12345678-5');")
comprobar('un librero puede prestar', ok, texto(out)[-250:] if not ok else '')
stock = valor(f"select stock from public.libros where id = {libro_id};")
comprobar('el stock bajó de 3 a 2', str(stock) == '2', f'stock = {stock}')

prestamo_id = valor("select id from public.prestamos order by id desc limit 1;")

ok, out = como(LIBRERO, f"select * from public.renovar_prestamo({prestamo_id});")
comprobar('un librero puede renovar', ok, texto(out)[-250:] if not ok else '')
renov = valor(f"select renovaciones from public.prestamos where id = {prestamo_id};")
comprobar('la renovación quedó registrada', str(renov) == '1', f'renovaciones = {renov}')

ok, out = como(LIBRERO, f"select public.devolver_prestamo({prestamo_id});")
comprobar('un librero puede devolver', ok, texto(out)[-250:] if not ok else '')
estado = valor(f"select estado from public.prestamos where id = {prestamo_id};")
stock = valor(f"select stock from public.libros where id = {libro_id};")
comprobar('el préstamo quedó marcado como devuelto', estado == 'devuelto', f'estado = {estado}')
comprobar('el stock volvió a 3', str(stock) == '3', f'stock = {stock}')

ok, out = como(LIBRERO, "select public.actualizar_contacto_lector((select id from public.lectores limit 1), 'Maria Antileo Curiqueo', 'maria@correo.cl', '56999998888');")
comprobar('un librero puede corregir el contacto de un lector', ok, texto(out)[-250:] if not ok else '')
tel = valor("select telefono from public.lectores limit 1;")
comprobar('el teléfono nuevo quedó guardado', tel == '56999998888', f'telefono = {tel}')


# ---------------------------------------------------------------------------
print('\n4. LO QUE EL LIBRERO SIGUE SIN PODER HACER')
# ---------------------------------------------------------------------------
ok, out = como(LIBRERO, f"delete from public.libros where id = {libro_id};")
sigue = valor(f"select count(*) from public.libros where id = {libro_id};")
comprobar('no puede eliminar un libro', str(sigue) == '1', 'el libro desapareció')

como(LIBRERO, f"update public.libros set titulo = 'Titulo alterado' where id = {libro_id};")
titulo = valor(f"select titulo from public.libros where id = {libro_id};")
comprobar('no puede editar el título de un libro',
          titulo == 'Cuentos del Lago Ranco', f'quedó: {titulo}')

como(LIBRERO, f"update public.lectores set rut = '99999999-9';")
rut = valor("select rut from public.lectores limit 1;")
comprobar('no puede cambiar el RUT de un lector por la vía directa',
          rut == '12345678-5', f'quedó: {rut}')

ok, out = como(LIBRERO, "select * from public.listar_personal();")
comprobar('no puede listar al personal', not ok and 'administrador' in texto(out).lower(),
          texto(out)[-200:])

ok, out = como(LIBRERO, f"select * from public.ajustar_copias({libro_id}, 99);")
comprobar('no puede ajustar los ejemplares', not ok and 'administrador' in texto(out).lower(),
          texto(out)[-200:])


# ---------------------------------------------------------------------------
print('\n5. PERFIL PROPIO — y que nadie se ascienda solo')
# ---------------------------------------------------------------------------
ok, out = como(LIBRERO, "select nombre, rol from public.mi_perfil();")
comprobar('mi_perfil() responde', ok, texto(out)[-250:] if not ok else '')
comprobar('el rol que devuelve es librero', any('librero' in str(f) for f in out))

ok, out = como(LIBRERO, "select public.actualizar_mi_perfil('Maria Antileo Huenchuman', '56912345678', 'Encargada de circulacion');")
comprobar('puede guardar su propio perfil', ok, texto(out)[-250:] if not ok else '')
nombre = valor(f"select nombre from public.usuarios where id = '{LIBRERO}';")
cargo = valor(f"select cargo from public.usuarios where id = '{LIBRERO}';")
comprobar('el nombre quedó guardado', nombre == 'Maria Antileo Huenchuman', f'quedó: {nombre}')
comprobar('el cargo quedó guardado', cargo == 'Encargada de circulacion', f'quedó: {cargo}')

# El ataque obvio: cambiarse el rol a mano desde la consola del navegador
como(LIBRERO, f"update public.usuarios set rol = 'admin' where id = '{LIBRERO}';")
rol = valor(f"select rol from public.usuarios where id = '{LIBRERO}';")
comprobar('NO puede ascenderse a admin por UPDATE directo', rol == 'librero', f'rol = {rol}')

ok, out = como(LIBRERO, f"select public.asignar_rol('{LIBRERO}', 'admin');")
rol = valor(f"select rol from public.usuarios where id = '{LIBRERO}';")
comprobar('NO puede ascenderse llamando a asignar_rol', rol == 'librero', f'rol = {rol}')

ok, out = como(LIBRERO, f"select rol from public.usuarios where id = '{ADMIN}';")
comprobar('no puede leer el perfil de otra persona (RLS lo filtra)',
          ok and len(out) == 0, f'vio {len(out) if ok else "?"} filas')


# ---------------------------------------------------------------------------
print('\n6. EL ADMINISTRADOR CONSERVA SUS PERMISOS')
# ---------------------------------------------------------------------------
ok, out = como(ADMIN, f"select * from public.prestar_libro({libro_id}, '12345678-5');")
comprobar('un admin puede prestar', ok, texto(out)[-250:] if not ok else '')

ok, out = como(ADMIN, "select email, rol from public.listar_personal();")
comprobar('un admin puede listar al personal', ok, texto(out)[-250:] if not ok else '')
ok, personal = como(ADMIN, "select nombre from public.listar_personal();")
comprobar('la lista incluye el nombre del perfil',
          any(fila[0] and 'Maria Antileo' in fila[0] for fila in personal), texto(personal))

ok, out = como(ADMIN, f"select * from public.ajustar_copias({libro_id}, 5);")
comprobar('un admin puede ajustar los ejemplares', ok, texto(out)[-250:] if not ok else '')

ok, out = como(ADMIN, f"update public.libros set titulo = 'Cuentos del Lago Ranco' where id = {libro_id};")
comprobar('un admin puede editar un libro', ok, texto(out)[-250:] if not ok else '')


# ---------------------------------------------------------------------------
print('\n7. AUTODIAGNÓSTICOS QUE VE EL ADMINISTRADOR EN PANTALLA')
# ---------------------------------------------------------------------------
ok, filas = como(ADMIN, "select tabla, diagnostico from public.verificar_rls();")
malas = [f for f in filas if f[1] != 'Correcto']
comprobar('verificar_rls() no reporta ninguna tabla en problemas', ok and not malas, texto(malas))
comprobar('verificar_rls() revisa las 7 tablas con datos', len(filas) == 7, f'revisó {len(filas)}')

ok, filas = como(ADMIN, "select funcion, es_definer from public.verificar_circulacion();")
rotas = [f[0] for f in filas if not f[1]]
comprobar('verificar_circulacion() da todas las funciones correctas', ok and not rotas, texto(rotas))
comprobar('verificar_circulacion() revisa las 9 funciones esperadas', len(filas) == 9, f'revisó {len(filas)}')


# ---------------------------------------------------------------------------
print('\n8. LA BITÁCORA SIGUE REGISTRANDO QUIÉN HIZO QUÉ')
# ---------------------------------------------------------------------------
n = valor("select count(*) from public.auditoria;")
comprobar('hay movimientos registrados en la auditoría', n > 0, f'hay {n}')
correos = valor("select distinct usuario_email from public.auditoria where usuario_email is not null;")
comprobar('la auditoría identifica al librero, no solo a un usuario anónimo',
          'librera@futrono.cl' in correos, correos[-200:])



# ===========================================================================
# BLOQUE AÑADIDO EN LA VERSIÓN 12 — registro de errores (migración 009)
# ===========================================================================
print('\n9. REGISTRO DE ERRORES')

m009 = (RAIZ / 'supabase' / 'migrations' / '009_registro_de_errores.sql').read_text(encoding='utf-8')
ok, out = sql(m009)
comprobar('la migración 009 se ejecuta sin errores', ok, texto(out)[-500:] if not ok else '')
ok, out = sql(m009)
comprobar('y se puede volver a ejecutar (es idempotente)', ok, texto(out)[-500:] if not ok else '')

sql("delete from public.errores;")

ok, out = como(LIBRERO, "select public.registrar_error('Fallo de prueba', 'operacion', 'traza', 'scanner', 'prestar', 'Chrome');")
comprobar('un librero puede registrar un fallo', ok, texto(out)[-250:] if not ok else '')
comprobar('quedó una fila', valor("select count(*) from public.errores;") == 1)
comprobar('se guardó quién tenía la sesión',
          valor("select usuario_email from public.errores limit 1;") == 'librera@futrono.cl')

# El mismo fallo repetido no debe multiplicar filas
for _ in range(4):
    como(LIBRERO, "select public.registrar_error('Fallo de prueba', 'operacion', 'traza', 'scanner', 'prestar', 'Chrome');")
comprobar('un fallo repetido NO crea filas nuevas', valor("select count(*) from public.errores;") == 1)
comprobar('...sino que suma repeticiones', valor("select repeticiones from public.errores limit 1;") == 5)

# Sin sesión no se registra: si no, la llave anónima permitiría llenar la tabla
ok, out = sql("set role anon; select public.registrar_error('Basura desde fuera');")
comprobar('sin sesión iniciada no se registra nada', valor("select count(*) from public.errores;") == 1)

ok, out = como(LIBRERO, "select * from public.listar_errores(10, false);")
comprobar('un librero NO puede leer el registro', not ok and 'administrador' in texto(out).lower(),
          texto(out)[-200:])

ok, out = como(LIBRERO, "select * from public.errores;")
comprobar('un librero tampoco lo ve por consulta directa (RLS)', ok and len(out) == 0,
          f'vio {len(out) if ok else "?"} filas')

ok, out = como(ADMIN, "select mensaje, repeticiones from public.listar_errores(10, false);")
comprobar('un admin sí puede leerlo', ok and len(out) == 1, texto(out)[-200:])

ok, out = como(ADMIN, "select sin_revisar, total from public.resumen_errores();")
comprobar('el resumen cuenta los no revisados', ok and out and out[0][0] == 1, texto(out))

como(ADMIN, "select public.marcar_error_visto(null);")
ok, out = como(ADMIN, "select sin_revisar from public.resumen_errores();")
comprobar('marcar como revisados funciona', out and out[0][0] == 0, texto(out))

sql("update public.errores set ocurrido_en = now() - interval '200 days';")
ok, out = como(ADMIN, "select public.purgar_errores(90);")
comprobar('la purga borra lo antiguo', ok and out and out[0][0] == 1, texto(out))
comprobar('la tabla queda vacía', valor("select count(*) from public.errores;") == 0)

ok, filas = como(ADMIN, "select tabla, diagnostico from public.verificar_rls();")
comprobar('verificar_rls() ahora cubre también la tabla de errores',
          any(f[0] == 'errores' for f in filas) and all(f[1] == 'Correcto' for f in filas),
          texto(filas))

# ===========================================================================
# CONSOLIDACIÓN (migración 010)
# ===========================================================================
print('\n10. CONSOLIDACIÓN DE FUNCIONES')

ok, filas = como(ADMIN, "select nombre, estado, diagnostico from public.verificar_definiciones();")
malas = [f for f in filas if f[1] != 'Correcto']
comprobar('verificar_definiciones() responde', ok, texto(filas)[-200:] if not ok else '')
comprobar('el manifiesto cubre 33 funciones', len(filas) == 33, f'cubre {len(filas)}')
comprobar('ninguna función está fuera de norma', not malas, texto(malas)[:300])

# La prueba de fuego: ¿detecta la deriva que causó el fallo del librero?
sql("""create or replace function public.devolver_prestamo(p_prestamo_id bigint)
returns void language plpgsql set search_path = public as $f$
begin update public.prestamos set estado='devuelto' where id=p_prestamo_id; end; $f$;""")
ok, filas = como(ADMIN, "select nombre, estado from public.verificar_definiciones() where estado <> 'Correcto';")
comprobar('detecta cuando una función pierde el security definer',
          any(f[0] == 'devolver_prestamo' and f[1] == 'SIN DEFINER' for f in filas), texto(filas))

# Una función redefinida con otra firma NO reemplaza: PostgreSQL crea una segunda
sql("""create or replace function public.prestar_libro(a bigint, b text, c int)
returns void language plpgsql security definer as $f$ begin end; $f$;""")
ok, filas = como(ADMIN, "select nombre, estado from public.verificar_definiciones() where estado <> 'Correcto';")
comprobar('detecta una función duplicada por firma',
          any(f[0] == 'prestar_libro' and f[1] == 'DUPLICADA' for f in filas), texto(filas))

sql("drop function if exists public.prestar_libro(bigint, text, int);")
ok, err = sql((RAIZ / 'supabase' / 'migrations' / '010_consolidacion.sql').read_text(encoding='utf-8'))
comprobar('reejecutar la 010 repara la deriva', ok, texto(err)[-300:] if not ok else '')
ok, filas = como(ADMIN, "select nombre, estado from public.verificar_definiciones() where estado <> 'Correcto';")
comprobar('tras reparar no queda nada fuera de norma', not filas, texto(filas))

# Los disparadores de auditoría deben quedar conectados, no duplicados
ok, filas = sql("""select tgname from pg_trigger t join pg_class c on c.oid = t.tgrelid
where c.relname in ('libros','lectores','prestamos') and not t.tgisinternal;""")
comprobar('los 3 disparadores de auditoría siguen conectados', len(filas) == 3, texto(filas))

# Y el librero debe poder seguir trabajando después de todo esto
sql("delete from public.prestamos;")
sql(f"update public.libros set stock = 3, copias_totales = 3 where id = {libro_id};")
ok, out = como(LIBRERO, f"select * from public.prestar_libro({libro_id}, '12345678-5');")
comprobar('el librero sigue pudiendo prestar tras la consolidación', ok, texto(out)[-250:] if not ok else '')
pid = valor("select id from public.prestamos order by id desc limit 1;")
ok, out = como(LIBRERO, f"select public.devolver_prestamo({pid});")
comprobar('y devolver', ok, texto(out)[-250:] if not ok else '')
comprobar('con el stock de vuelta en 3',
          str(valor(f"select stock from public.libros where id = {libro_id};")) == '3')


# ===========================================================================
# LA LLAVE ANÓNIMA — lo que puede hacer alguien sin iniciar sesión
# ===========================================================================
# La llave anónima de Supabase es PÚBLICA por diseño: va escrita en config.js,
# que se sirve al navegador. Cualquiera la lee con F12 y puede llamar a la API.
#
# Estas comprobaciones existen porque en la versión 13 se descubrió que
# `estado_lector` y `consultar_libro` eran alcanzables sin sesión y devolvían
# nombre, RUT, correo y teléfono del lector. Los RUT chilenos son enumerables,
# así que era la lista de contactos de la biblioteca al descubierto.
print('\n11. LA LLAVE ANÓNIMA NO DEBE ALCANZAR DATOS PERSONALES')

def como_anonimo(consulta):
    """Ejecuta con el rol anon, que es el que usa la llave pública."""
    try:
        with psycopg.connect(URI, autocommit=True) as c, c.cursor() as cur:
            cur.execute("set role anon")
            cur.execute(consulta)
            try:
                return True, cur.fetchall()
            except psycopg.ProgrammingError:
                return True, []
    except Exception as e:
        return False, str(e)

# Datos con los que probar
sql("delete from public.prestamos;")
sql(f"update public.libros set stock = 3, copias_totales = 3, isbn = '9789561234567' where id = {libro_id};")
sql(f"""insert into public.prestamos (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, estado)
        select {libro_id}, id, current_date, current_date + 7, 'activo' from public.lectores limit 1;""")

def no_expone(descripcion, consulta, dato_sensible):
    """Correcto si se bloquea, o si se ejecuta sin devolver el dato sensible."""
    ok, r = como_anonimo(consulta)
    if not ok:
        comprobar(descripcion + ' (bloqueado)', True)
        return
    filtrado = dato_sensible.lower() in texto(r).lower()
    comprobar(descripcion, not filtrado,
              f'EXPUSO datos personales: {texto(r)[:120]}')

no_expone('estado_lector no expone al lector por su RUT',
          "select * from public.estado_lector('12345678-5')", 'Antileo')
no_expone('consultar_libro no expone a quien tiene el libro',
          "select * from public.consultar_libro('9789561234567')", 'Antileo')
no_expone('la tabla lectores no es legible',
          "select rut, nombre, email, telefono from public.lectores", 'Antileo')
no_expone('la tabla prestamos no es legible',
          "select * from public.prestamos", 'activo')
no_expone('buscar_libros no devuelve el catálogo',
          "select * from public.buscar_libros('Lago', 10, 0)", 'Lago')

# Escritura y funciones de gestión
for desc, consulta in [
    ('no puede registrar un préstamo', f"select * from public.prestar_libro({libro_id}, '12345678-5')"),
    ('no puede devolver un préstamo',  "select public.devolver_prestamo(1)"),
    ('no puede ajustar ejemplares',    f"select * from public.ajustar_copias({libro_id}, 99)"),
    ('no puede bloquear lectores',     "select public.bloquear_lector(1, true, 'x')"),
    ('no puede listar al personal',    "select * from public.listar_personal()"),
    ('no puede cambiar roles',         "select public.asignar_rol('00000000-0000-0000-0000-000000000000','admin')"),
    ('no puede exportar datos',        "select * from public.exportar_datos_lector('12345678-5')"),
    ('no puede anonimizar un lector',  "select public.anonimizar_lector('12345678-5')"),
    ('no puede leer los errores',      "select * from public.listar_errores(5, false)"),
    ('no puede leer la auditoría',     "select * from public.auditoria"),
    ('no puede leer los parámetros',   "select * from public.parametros"),
]:
    ok, r = como_anonimo(consulta)
    comprobar('el anónimo ' + desc, not ok, f'se ejecutó y devolvió: {texto(r)[:100]}')

# El autodiagnóstico revela el estado de la protección: es reconocimiento útil
for desc, consulta in [
    ('el estado de las políticas RLS',      "select * from public.verificar_rls()"),
    ('el estado de la circulación',         "select * from public.verificar_circulacion()"),
    ('las definiciones de las funciones',   "select * from public.verificar_definiciones()"),
]:
    ok, r = como_anonimo(consulta)
    comprobar(f'el anónimo no puede consultar {desc}', not ok, f'devolvió {len(r) if ok else 0} filas')

# registrar_error debe existir para el personal, pero no servir de buzón de spam
antes = valor("select count(*) from public.errores;")
como_anonimo("select public.registrar_error('spam desde fuera')")
comprobar('el anónimo no puede llenar el registro de errores',
          valor("select count(*) from public.errores;") == antes)

# Y lo que sí debe seguir funcionando para el personal
ok, out = como(LIBRERO, "select nombre from public.estado_lector('12345678-5');")
comprobar('un librero SÍ puede consultar un lector', ok and out, texto(out)[-150:])
ok, out = como(LIBRERO, "select titulo from public.consultar_libro('9789561234567');")
comprobar('un librero SÍ puede consultar un libro', ok and out, texto(out)[-150:])
ok, out = como(ADMIN, "select count(*) from public.verificar_definiciones();")
comprobar('un admin SÍ puede ver el autodiagnóstico', ok and out and out[0][0] == 33,
          texto(out)[-150:])


print('\n' + '─' * 62)
print(f'{pasadas} comprobaciones correctas, {fallidas} con fallo')
sys.exit(1 if fallidas else 0)
