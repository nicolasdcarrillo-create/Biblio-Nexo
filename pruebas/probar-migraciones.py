#!/usr/bin/env python3
"""
Ejecuta las migraciones contra un PostgreSQL real.

Existe porque el otro banco de pruebas (probar-vistas.mjs) simula Supabase por
completo y no ejecuta una sola línea de SQL. Errores como una diferencia entre
varchar y text, una función que se llama antes de existir, o un tipo de
identificador equivocado, solo aparecen aquí.

Uso:
    pip install pgserver --break-system-packages
    python3 pruebas/probar-migraciones.py

Prueba dos escenarios de esquema, porque el tipo de las columnas depende de cómo
se crearon las tablas y eso cambia si las funciones funcionan o no:
    A) text  + bigserial  (lo que crea el editor de tablas de Supabase)
    B) varchar + serial   (lo que sale de un script escrito a mano)
"""

import glob
import os
import shutil
import sys
import tempfile

try:
    import pgserver
except ImportError:
    sys.exit("Falta pgserver. Ejecuta: pip install pgserver --break-system-packages")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PSQL = os.path.join(os.path.dirname(pgserver.__file__), 'pginstall', 'bin', 'psql')

# Identificador del usuario que auth.uid() devolverá durante las pruebas
UID_SIMULADO = {'valor': None}
MIGRACIONES = sorted(glob.glob(os.path.join(RAIZ, 'supabase/migrations/*.sql')))

# ---------------------------------------------------------------------------
# Esquema base: lo que ya existe en el proyecto de Supabase antes de migrar
# ---------------------------------------------------------------------------

def esquema_base(tipo_texto, tipo_id, tipo_ref):
    return f"""
-- Supabase define estos roles; sin ellos fallan los GRANT de las migraciones
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
end $$;

-- Sustitutos de extensiones que Supabase trae y este PostgreSQL de prueba no
-- incluye. Imitan la firma y el comportamiento suficiente para validar el SQL;
-- en producción las reemplazan las extensiones reales.
create schema if not exists extensions;

create or replace function extensions.digest(texto text, algoritmo text)
returns bytea language sql immutable as $$ select decode(md5(texto), 'hex') $$;

-- Sustituto de gen_random_bytes: no necesita ser criptográficamente fuerte
-- aquí, solo devolver bytea del largo pedido para que crear_enlace_escaneo()
-- pueda generar un token de prueba.
create or replace function extensions.gen_random_bytes(n int)
returns bytea language sql volatile as $$
  select decode(string_agg(lpad(to_hex((random() * 255)::int), 2, '0'), ''), 'hex')
  from generate_series(1, n)
$$;

create or replace function extensions.unaccent(texto text)
returns text language sql immutable as $$
  select translate(texto, 'áàâäãéèêëíìîïóòôöõúùûüñçÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑÇ',
                          'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC') $$;

create or replace function extensions.unaccent(dic regdictionary, texto text)
returns text language sql immutable as $$ select extensions.unaccent(texto) $$;

-- Diccionario mínimo para que 'unaccent'::regdictionary resuelva
create text search dictionary unaccent (template = simple);

-- Supabase expone auth.users y auth.uid(); se replican para poder probar
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255),
  last_sign_in_at timestamptz
);
create or replace function auth.uid() returns uuid
  language sql stable as $$ select current_setting('pruebas.uid', true)::uuid $$;

-- Tablas de la aplicación
create table public.libros (
  id {tipo_id} primary key,
  isbn {tipo_texto} unique,
  titulo {tipo_texto} not null,
  autor {tipo_texto},
  stock integer not null default 1
);

create table public.lectores (
  id {tipo_id} primary key,
  rut {tipo_texto} not null,
  nombre {tipo_texto} not null,
  email {tipo_texto},
  telefono {tipo_texto}
);

create table public.prestamos (
  id {tipo_id} primary key,
  libro_id {tipo_ref} references public.libros(id) on delete restrict,
  lector_id {tipo_ref} references public.lectores(id) on delete restrict,
  fecha_devolucion_esperada date not null,
  estado {tipo_texto} not null default 'activo'
);

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email {tipo_texto},
  rol {tipo_texto} not null default 'librero'
);
"""


ESCENARIOS = [
    ('A: text + bigserial (editor de Supabase)', 'text', 'bigserial', 'bigint'),
    ('B: varchar + serial (script a mano)', 'varchar(255)', 'serial', 'integer'),
]

# ---------------------------------------------------------------------------

pasadas = fallidas = 0
detalles = []


def prueba(nombre, fn):
    global pasadas, fallidas
    try:
        fn()
        print(f"    ✓ {nombre}")
        pasadas += 1
    except Exception as e:
        msg = str(e).strip().split('\n')[0][:160]
        print(f"    ✗ {nombre}\n        {msg}")
        fallidas += 1
        detalles.append((nombre, msg))


def correr(srv, sql):
    """Ejecuta SQL deteniéndose en el primer error y devolviendo su mensaje.

    Se invoca psql directamente en vez de usar el ayudante de pgserver, porque
    ese oculta el texto del error de PostgreSQL y sin él no se puede diagnosticar
    nada. ON_ERROR_STOP es indispensable: sin él psql informa el error y sigue
    con la sentencia siguiente, así que las pruebas pasaban en falso.
    """
    import subprocess
    # El identificador del usuario simulado se fija en cada llamada porque
    # cada invocación de psql abre una sesión nueva y el ámbito de set_config
    # es la sesión.
    # `do $$ ... $$` en vez de `select set_config(...)`: un bloque DO no
    # devuelve resultset. Con `select`, psql imprime su propia tabla antes de
    # la del SQL real, y eso corre el índice de línea (o el texto plano) que
    # varias pruebas usan para leer el resultado — un valor como '2' termina
    # coincidiendo por azar con algún dígito del uuid simulado.
    preludio = ""
    if UID_SIMULADO['valor']:
        preludio = f"do $$ begin perform set_config('pruebas.uid', '{UID_SIMULADO['valor']}', false); end $$;\n"
    r = subprocess.run(
        [str(PSQL), srv.get_uri(), '-v', 'ON_ERROR_STOP=1', '-q', '-f', '-'],
        input=preludio + sql, capture_output=True, text=True
    )
    if os.environ.get('DEBUG_SQL'):
        print(f"      [SQL] {sql.strip()[:90]!r} -> rc={r.returncode} err={r.stderr.strip()[:120]!r}")
    if r.returncode != 0 or 'ERROR:' in r.stderr:
        lineas = [l for l in r.stderr.split('\n') if l.strip()]
        pertinentes = [l for l in lineas if 'ERROR:' in l or 'DETALLE' in l or 'DETAIL' in l]
        raise RuntimeError(' | '.join(pertinentes[:2]) if pertinentes else (lineas[0] if lineas else 'error sin mensaje'))
    return r.stdout


def main():
    global fallidas
    print(f"\nMigraciones encontradas: {len(MIGRACIONES)}")
    for m in MIGRACIONES:
        print(f"  · {os.path.basename(m)}")

    for etiqueta, t_texto, t_id, t_ref in ESCENARIOS:
        print(f"\n{'=' * 68}\nESCENARIO {etiqueta}\n{'=' * 68}")
        UID_SIMULADO['valor'] = None  # cada escenario usa su propia base
        dir_datos = tempfile.mkdtemp()
        srv = None
        try:
            srv = pgserver.get_server(dir_datos)
            correr(srv, esquema_base(t_texto, t_id, t_ref))

            # --- Cada migración debe aplicarse sin error, en orden ---
            print("\n  Aplicando migraciones:")
            for ruta in MIGRACIONES:
                nombre = os.path.basename(ruta)
                with open(ruta, encoding='utf-8') as f:
                    sql = f.read()
                # La 003 inserta el admin desde auth.users; se crea uno de prueba
                if '003_' in nombre:
                    correr(srv, "insert into auth.users (email) values ('nicolasd.carrillo@gmail.com') on conflict do nothing;")
                prueba(f"aplica {nombre}", lambda s=sql: correr(srv, s))

            # --- Idempotencia ---
            # Solo se exige de la ÚLTIMA migración. Reaplicar una anterior debe
            # fallar, y eso es lo correcto: 005, 006 y 007 redefinen las mismas
            # funciones, así que volver a ejecutar 005 después de 007 revertiría
            # las correcciones. Que PostgreSQL aborte con un error es la salida
            # segura frente a una corrupción silenciosa.
            print("\n  Idempotencia:")
            ultima = MIGRACIONES[-1]
            with open(ultima, encoding='utf-8') as f:
                sql_ultima = f.read()
            prueba(f"reaplicar {os.path.basename(ultima)} es seguro",
                   lambda: correr(srv, sql_ultima))

            def reaplicar_anterior_falla():
                with open(MIGRACIONES[4], encoding='utf-8') as f:  # 005
                    sql = f.read()
                try:
                    correr(srv, sql)
                except Exception:
                    return  # correcto: avisa en vez de revertir en silencio
                raise AssertionError("reaplicar la 005 después de la 007 debió fallar")
            prueba("reaplicar una migración anterior avisa del error",
                   reaplicar_anterior_falla)

            # --- Datos de prueba ---
            print("\n  Cargando datos:")
            def cargar():
                correr(srv, """
                  insert into public.libros (isbn, titulo, autor, stock, copias_totales)
                  values ('9789561117', 'Subterra', 'Baldomero Lillo', 3, 3),
                         ('9788437604947', 'La Araucana', 'Alonso de Ercilla', 1, 1);
                  insert into public.lectores (rut, nombre, email, telefono)
                  values ('12345678-5', 'María Antileo', 'maria@correo.cl', '56912345678'),
                         ('11111111-1', 'Pedro Huenchumán', 'pedro@correo.cl', '56987654321');
                """)
            prueba("inserta libros y lectores", cargar)

            # --- Sesiones simuladas para el resto de la corrida ---
            # Las funciones de circulación (008/010) exigen es_personal(): sin
            # una sesión activa, todas fallan con "Debes iniciar sesión", que es
            # el comportamiento correcto de la aplicación, no un defecto. Se crea
            # un librero de prueba y queda como sesión por defecto de aquí en
            # adelante; el admin de la 003 (nicolasd.carrillo@gmail.com) ya
            # existe y se usa solo puntualmente, donde una función exige
            # es_admin() en vez de es_personal().
            uid_librero = correr(
                srv, "insert into auth.users (email) values ('librera-prueba@futrono.cl') returning id;"
            ).split('\n')[2].strip()
            correr(srv, f"""
              insert into public.usuarios (id, email, rol)
              values ('{uid_librero}', 'librera-prueba@futrono.cl', 'librero');
            """)
            uid_admin = correr(
                srv, "select id from auth.users where email = 'nicolasd.carrillo@gmail.com';"
            ).split('\n')[2].strip()

            def como(uid):
                UID_SIMULADO['valor'] = uid

            como(uid_librero)

            # --- Las funciones RPC deben ejecutarse y devolver la forma correcta ---
            print("\n  Funciones de consulta:")
            prueba("hoy_chile() devuelve una fecha",
                   lambda: correr(srv, "select public.hoy_chile();"))
            prueba("buscar_libros() sin filtro",
                   lambda: correr(srv, "select * from public.buscar_libros('', 10, 0);"))
            prueba("buscar_libros() ignora acentos",
                   lambda: correr(srv, "select * from public.buscar_libros('araucana', 10, 0);"))
            prueba("estado_lector() con RUT existente",
                   lambda: correr(srv, "select * from public.estado_lector('12345678-5');"))
            prueba("estado_lector() con RUT inexistente",
                   lambda: correr(srv, "select * from public.estado_lector('99999999-9');"))
            prueba("consultar_libro() por ISBN",
                   lambda: correr(srv, "select * from public.consultar_libro('9789561117');"))
            prueba("revisar_inventario()",
                   lambda: correr(srv, "select * from public.revisar_inventario();"))
            def verificar_rls_como_admin():
                # Exige es_admin(): la sesión de librero no alcanza aquí.
                como(uid_admin)
                try:
                    correr(srv, "select * from public.verificar_rls();")
                finally:
                    como(uid_librero)
            prueba("verificar_rls()", verificar_rls_como_admin)
            prueba("parametro_int() lee de la tabla",
                   lambda: correr(srv, "select public.parametro_int('max_prestamos_por_lector', 0);"))

            # --- Préstamos: el flujo completo ---
            print("\n  Flujo de préstamo:")
            prueba("prestar_libro() registra el préstamo",
                   lambda: correr(srv, "select * from public.prestar_libro(1, '12345678-5');"))

            def stock_bajo():
                r = correr(srv, "select stock from public.libros where id = 1;")
                assert '2' in r, f"el stock debió bajar a 2, se leyó: {r}"
            prueba("el stock baja al prestar", stock_bajo)

            prueba("renovar_prestamo() extiende el plazo",
                   lambda: correr(srv, "select * from public.renovar_prestamo(1);"))
            prueba("devolver_prestamo() registra la devolución",
                   lambda: correr(srv, "select public.devolver_prestamo(1);"))

            def stock_restaurado():
                r = correr(srv, "select stock from public.libros where id = 1;")
                assert '3' in r, f"el stock debió volver a 3, se leyó: {r}"
            prueba("el stock se restaura al devolver", stock_restaurado)

            # --- Reglas de negocio: deben RECHAZAR ---
            print("\n  Reglas que deben rechazar:")

            def debe_fallar(sql, texto_esperado=None):
                try:
                    correr(srv, sql)
                except Exception as e:
                    if texto_esperado and texto_esperado.lower() not in str(e).lower():
                        raise AssertionError(f"falló, pero por otro motivo: {str(e)[:120]}")
                    return
                raise AssertionError("la operación fue aceptada y debía rechazarse")

            prueba("no presta con RUT inexistente",
                   lambda: debe_fallar("select * from public.prestar_libro(1, '99999999-9');", "no encontrado"))

            def sin_stock():
                correr(srv, "select * from public.prestar_libro(2, '12345678-5');")
                debe_fallar("select * from public.prestar_libro(2, '11111111-1');", "disponible")
            prueba("no presta sin ejemplares disponibles", sin_stock)

            def limite_prestamos():
                correr(srv, "update public.parametros set valor = '1' where clave = 'max_prestamos_por_lector';")
                debe_fallar("select * from public.prestar_libro(1, '12345678-5');", "máximo")
                correr(srv, "update public.parametros set valor = '3' where clave = 'max_prestamos_por_lector';")
            prueba("respeta el límite de préstamos por lector", limite_prestamos)

            def bloqueo_por_atraso():
                # Se atrasa el préstamo activo de María y se intenta prestarle otro
                correr(srv, """update public.prestamos
                               set fecha_devolucion_esperada = public.hoy_chile() - 5
                               where lector_id = 1 and estado = 'activo';""")
                debe_fallar("select * from public.prestar_libro(1, '12345678-5');", "atrasada")
            prueba("bloquea al lector con libros atrasados", bloqueo_por_atraso)

            prueba("no renueva un préstamo atrasado",
                   lambda: debe_fallar(
                       "select * from public.renovar_prestamo((select id from public.prestamos where estado='activo' and lector_id=1 limit 1));",
                       "atrasado"))

            def copias_menores_que_prestadas():
                # ajustar_copias() exige es_admin(): la sesión de librero no
                # alcanza aquí tampoco.
                como(uid_admin)
                try:
                    debe_fallar("select * from public.ajustar_copias(2, 0);", "prestado")
                finally:
                    como(uid_librero)
            prueba("no deja menos ejemplares que los prestados", copias_menores_que_prestadas)

            # --- Personal: listar, asignar rol, eliminar ---
            print("\n  Personal:")

            def crear_cuenta_personal(correo):
                uid = correr(
                    srv, f"insert into auth.users (email) values ('{correo}') returning id;"
                ).split('\n')[2].strip()
                return uid

            def listar_personal_como_admin():
                como(uid_admin)
                try:
                    correr(srv, "select * from public.listar_personal();")
                finally:
                    como(uid_librero)
            prueba("listar_personal() responde para un administrador", listar_personal_como_admin)

            def eliminar_personal_rechaza_a_librero():
                # es_admin() debe bloquear a quien no lo es, sin importar a quién
                # intente eliminar.
                debe_fallar(f"select public.eliminar_personal('{uid_librero}');", "administrador")
            prueba("eliminar_personal() rechaza a quien no es administrador", eliminar_personal_rechaza_a_librero)

            def eliminar_personal_rechaza_autoeliminacion():
                como(uid_admin)
                try:
                    debe_fallar(f"select public.eliminar_personal('{uid_admin}');", "propia cuenta")
                finally:
                    como(uid_librero)
            prueba("eliminar_personal() no deja que un administrador se elimine a sí mismo",
                   eliminar_personal_rechaza_autoeliminacion)

            def eliminar_personal_borra_cuenta():
                uid_baja = crear_cuenta_personal('personal-de-baja@futrono.cl')
                correr(srv, f"""
                  insert into public.usuarios (id, email, rol)
                  values ('{uid_baja}', 'personal-de-baja@futrono.cl', 'librero');
                """)
                como(uid_admin)
                try:
                    correr(srv, f"select public.eliminar_personal('{uid_baja}');")
                finally:
                    como(uid_librero)
                r = correr(srv, f"select count(*) from auth.users where id = '{uid_baja}';")
                assert '0' in r.split('\n')[2], f"la cuenta debió desaparecer de auth.users, se leyó: {r}"
                r = correr(srv, f"select count(*) from public.usuarios where id = '{uid_baja}';")
                assert '0' in r.split('\n')[2], f"la cuenta debió desaparecer de usuarios, se leyó: {r}"
            prueba("eliminar_personal() borra el perfil y la cuenta de acceso", eliminar_personal_borra_cuenta)

            # --- Escaneo remoto sin sesión ---
            print("\n  Escaneo remoto sin sesión:")

            def crea_enlace_y_devuelve_token():
                como(uid_librero)
                r = correr(srv, "select token from public.crear_enlace_escaneo(4);")
                return r.split('\n')[2].strip()

            def anon():
                UID_SIMULADO['valor'] = None

            def valida_enlace_recien_creado():
                token = crea_enlace_y_devuelve_token()
                anon()
                try:
                    r = correr(srv, f"select valido from public.validar_enlace_escaneo('{token}');")
                    assert 't' in r.split('\n')[2], f"un enlace recién creado debió ser válido, se leyó: {r}"
                finally:
                    como(uid_librero)
            prueba("validar_enlace_escaneo() acepta un enlace recién creado", valida_enlace_recien_creado)

            def valida_token_inventado():
                r = correr(srv, "select valido from public.validar_enlace_escaneo('token-que-no-existe');")
                assert 'f' in r.split('\n')[2], f"un token inventado no debió validar, se leyó: {r}"
            prueba("validar_enlace_escaneo() rechaza un token inventado", valida_token_inventado)

            def agrega_libro_nuevo_por_enlace():
                token = crea_enlace_y_devuelve_token()
                anon()
                try:
                    r = correr(srv, f"""
                      select estado from public.agregar_libro_remoto(
                        '{token}', 'REMOTO-1', 'Libro agregado remoto', 'Autor Remoto', null, null, 2);
                    """)
                    assert 'creado' in r.split('\n')[2], f"debió crear el libro, se leyó: {r}"
                finally:
                    como(uid_librero)
                r = correr(srv, "select stock, copias_totales from public.libros where isbn = 'REMOTO-1';")
                assert '2' in r.split('\n')[2], f"el libro nuevo debió quedar con 2 ejemplares, se leyó: {r}"
            prueba("agregar_libro_remoto() crea un libro nuevo con un enlace válido", agrega_libro_nuevo_por_enlace)

            def agregar_libro_remoto_sin_titulo_pide_info():
                token = crea_enlace_y_devuelve_token()
                anon()
                try:
                    r = correr(srv, f"select estado from public.agregar_libro_remoto('{token}', 'ISBN-SIN-TITULO');")
                    assert 'falta_info' in r.split('\n')[2], f"debió pedir los datos, se leyó: {r}"
                finally:
                    como(uid_librero)
                r = correr(srv, "select count(*) from public.libros where isbn = 'ISBN-SIN-TITULO';")
                assert '0' in r.split('\n')[2], "no debió crear nada mientras faltan los datos"
            prueba("agregar_libro_remoto() pide los datos si el ISBN es nuevo y no llegó título",
                   agregar_libro_remoto_sin_titulo_pide_info)

            def agrega_libro_existente_por_enlace_suma_ejemplares():
                token = crea_enlace_y_devuelve_token()
                anon()
                try:
                    r = correr(srv, f"""
                      select estado from public.agregar_libro_remoto('{token}', '9789561117', null, null, null, null, 5);
                    """)
                    assert 'incrementado' in r.split('\n')[2], f"debió reponer el libro existente, se leyó: {r}"
                finally:
                    como(uid_librero)
                r = correr(srv, "select stock from public.libros where isbn = '9789561117';")
                assert '8' in r.split('\n')[2], f"el stock debió sumar 5 (había 3), se leyó: {r}"
            prueba("agregar_libro_remoto() repone ejemplares de un libro que ya existe",
                   agrega_libro_existente_por_enlace_suma_ejemplares)

            def agregar_libro_remoto_rechaza_token_invalido():
                anon()
                try:
                    debe_fallar(
                        "select * from public.agregar_libro_remoto('token-inventado', '000', 'X', 'Y');",
                        "no es válido")
                finally:
                    como(uid_librero)
            prueba("agregar_libro_remoto() rechaza un token inventado", agregar_libro_remoto_rechaza_token_invalido)

            def revoca_enlace_propio():
                token = crea_enlace_y_devuelve_token()
                r = correr(srv, "select id from public.enlaces_escaneo_remoto order by id desc limit 1;")
                enlace_id = r.split('\n')[2].strip()
                correr(srv, f"select public.revocar_enlace_escaneo({enlace_id});")
                anon()
                try:
                    r = correr(srv, f"select valido from public.validar_enlace_escaneo('{token}');")
                    assert 'f' in r.split('\n')[2], f"un enlace revocado no debió seguir siendo válido, se leyó: {r}"
                finally:
                    como(uid_librero)
            prueba("revocar_enlace_escaneo() invalida el enlace de inmediato", revoca_enlace_propio)

            def listar_enlaces_rechaza_a_librero():
                debe_fallar("select * from public.listar_enlaces_escaneo();", "administrador")
            prueba("listar_enlaces_escaneo() rechaza a quien no es administrador", listar_enlaces_rechaza_a_librero)

            def listar_enlaces_como_admin():
                como(uid_admin)
                try:
                    correr(srv, "select * from public.listar_enlaces_escaneo();")
                finally:
                    como(uid_librero)
            prueba("listar_enlaces_escaneo() responde para un administrador", listar_enlaces_como_admin)

            # --- Auditoría ---
            print("\n  Auditoría:")
            def auditoria_registra():
                correr(srv, "insert into public.libros (isbn, titulo, autor, stock, copias_totales) values ('AUD-1','Prueba','X',1,1);")
                r = correr(srv, "select count(*) from public.auditoria where tabla='libros';")
                # Antes se probaba con `'0' not in texto`, que da un falso negativo
                # apenas el conteo llega a un número de dos cifras que contenga un
                # 0 (10, 20, 100...) — justo lo que empezó a pasar al sumarse las
                # pruebas del escaneo remoto. Se compara el número, no el texto.
                conteo = int(r.split('\n')[2].strip()) if len(r.split('\n')) > 2 else 0
                assert conteo > 0, f"no registró, se leyó: {r}"
            prueba("el trigger registra los movimientos", auditoria_registra)

            def auditoria_no_bloquea():
                # Se rompe la tabla de auditoría a propósito. La inserción debe
                # completarse igual: la bitácora nunca debe impedir la operación.
                # Todo va en una sola sesión porque el renombrado y la inserción
                # deben ocurrir juntos.
                correr(srv, """
                  alter table public.auditoria rename to auditoria_oculta;
                  insert into public.libros (isbn, titulo, autor, stock, copias_totales)
                  values ('AUD-2','Prueba sin bitacora','Y',1,1);
                  alter table public.auditoria_oculta rename to auditoria;
                """)
                r = correr(srv, "select count(*) from public.libros where isbn = 'AUD-2';")
                assert '1' in r, "la inserción se revirtió: la auditoría bloqueó la operación"
            prueba("si la auditoría falla, la operación NO se bloquea", auditoria_no_bloquea)

            # --- Derechos del titular ---
            print("\n  Cumplimiento (Ley 21.719):")
            # Se reutiliza el admin de la 003 (nicolasd.carrillo@gmail.com):
            # ya tiene rol 'admin' en public.usuarios desde que se aplicó esa
            # migración, así que es_admin() lo reconoce sin más.
            como(uid_admin)

            prueba("exportar_datos_lector() entrega el historial",
                   lambda: correr(srv, "select public.exportar_datos_lector('12345678-5');"))

            def anonimiza():
                # Primero se devuelven sus préstamos activos
                correr(srv, """select public.devolver_prestamo(id) from public.prestamos
                               where lector_id = 1 and estado = 'activo';""")
                correr(srv, "select public.anonimizar_lector(1, 'prueba');")
                r = correr(srv, "select rut from public.lectores where id = 1;")
                assert 'ANON-' in r, f"el RUT debió quedar anonimizado, se leyó: {r}"
            prueba("anonimizar_lector() borra los datos personales", anonimiza)

            def no_anonimiza_con_prestamos():
                # Se le presta un libro al lector 2 para que tenga un préstamo
                # activo: antes esta prueba pasaba por accidente, porque nunca
                # había llegado a tener uno.
                correr(srv, "select * from public.prestar_libro(1, '11111111-1');")
                debe_fallar("select public.anonimizar_lector(2, 'prueba');", "activo")
            prueba("no anonimiza a alguien con préstamos activos", no_anonimiza_con_prestamos)

            prueba("evidencia_incidente() genera el informe",
                   lambda: correr(srv, "select public.evidencia_incidente(now() - interval '1 day', now());"))

        finally:
            if srv:
                srv.cleanup()
            shutil.rmtree(dir_datos, ignore_errors=True)

    print(f"\n{'=' * 68}")
    print(f"  Pasadas: {pasadas}    Fallidas: {fallidas}")
    if detalles:
        print(f"\n  Fallas:")
        for n, m in detalles:
            print(f"   · {n}\n     {m}")
    print('=' * 68 + '\n')
    return 1 if fallidas else 0


if __name__ == '__main__':
    sys.exit(main())
