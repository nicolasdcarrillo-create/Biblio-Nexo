#!/usr/bin/env python3
"""
Cruza cada llamada a un RPC de Supabase en el código JS contra la firma que
ese RPC tiene HOY en las migraciones — sin necesitar una base de datos real.

Existe por lo que casi pasa con la corrección de seguridad de
deshacer_libro_remoto(): la función bajó de 4 a 2 parámetros
(p_token, p_libro_id, p_accion, p_cantidad) a (p_token, p_libro_id), y
js/escaneo-remoto.js sí se actualizó a mano en el mismo cambio — pero nada
más que la revisión humana lo garantizaba. Si alguien hubiera tocado la
migración sin acordarse del JS (o al revés), el error solo habría aparecido
en producción, como "function ... does not exist" o un parámetro ignorado.

No es un parser de JavaScript ni de SQL: es una lectura de texto, en el
mismo espíritu que verificar_consolidacion.py. Sabe leer llamadas del tipo
`rpc('nombre', { p_x: ..., p_y: ... })` y definiciones del tipo
`create or replace function public.nombre(p_x tipo, p_y tipo default ...)`.
Una llamada escrita de forma muy distinta a las que ya existen en el
proyecto puede no reconocerse — si esta comprobación no detecta una llamada
real, agrégala a `pruebas/LEEME.md` como límite conocido en vez de forzar el
patrón aquí.

Comprueba dos cosas por cada RPC llamado desde JS:
  1. Que el RPC exista como función pública declarada en alguna migración
     (tomando, para cada nombre, la ÚLTIMA definición por orden de archivo —
     así es como Postgres la deja después de aplicar todas las migraciones
     en orden, gracias a `create or replace`).
  2. Que todo parámetro que el JS manda por nombre (`p_algo: ...`) exista
     en la firma actual de esa función. Un parámetro que el JS manda y la
     función ya no acepta es exactamente el hueco que motivó este script.

No falla si el JS manda MENOS parámetros que los que la función admite
(pueden tener `default`), ni avisa de funciones definidas pero nunca
llamadas desde JS (pueden llamarse solo desde SQL, un trigger, u otra
migración) — eso es ruido, no una señal de un problema real.

Ejecutar:  python3 pruebas/verificar_llamadas_rpc.py
Devuelve 0 si todo coincide, 1 si hay algo que revisar.
"""

import re
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

RAIZ = Path(__file__).resolve().parent.parent
MIGRACIONES = RAIZ / 'supabase' / 'migrations'
DIRECTORIOS_JS = [RAIZ / 'js']

VERDE, ROJO, AMARILLO, GRIS, FIN = '\033[32m', '\033[31m', '\033[33m', '\033[90m', '\033[0m'


def firmas_declaradas():
    """
    {nombre_funcion: {parametros...}} con la ÚLTIMA definición de cada
    función, recorriendo las migraciones en orden de archivo (mismo orden
    en que Postgres las aplica).
    """
    firmas = {}
    for archivo in sorted(MIGRACIONES.glob('*.sql')):
        texto = archivo.read_text(encoding='utf-8')
        for m in re.finditer(
            r'create or replace function public\.(\w+)\s*\((.*?)\)\s*(?:returns|language)',
            texto, re.S | re.I
        ):
            nombre, crudo = m.group(1), m.group(2).strip()
            parametros = _parametros_de(crudo)
            firmas[nombre] = {'parametros': parametros, 'archivo': archivo.name}
    return firmas


def _parametros_de(crudo):
    """Nombres de parámetro (p_...) de una lista como la de la firma SQL."""
    if not crudo:
        return set()
    nombres = set()
    for parte in crudo.split(','):
        parte = parte.strip()
        if not parte:
            continue
        primero = parte.split()[0]
        if primero.startswith('p_'):
            nombres.add(primero)
    return nombres


def llamadas_en_js():
    """
    [{nombre, parametros, archivo, linea}] por cada `rpc('nombre', {...})`
    o `rpc('nombre')` encontrado (cubre tanto `supabase.rpc(...)` como el
    ayudante `rpc()` propio de escaneo-remoto.js — ambos usan ese mismo
    patrón textual).
    """
    llamadas = []
    for directorio in DIRECTORIOS_JS:
        for archivo in sorted(directorio.rglob('*.js')):
            texto = archivo.read_text(encoding='utf-8')
            for m in re.finditer(r"\brpc\(\s*'(\w+)'", texto):
                nombre = m.group(1)
                linea = texto.count('\n', 0, m.start()) + 1
                resto = texto[m.end():]
                objeto = _siguiente_objeto(resto)
                parametros = _claves_de_objeto(objeto) if objeto else set()
                llamadas.append({
                    'nombre': nombre, 'parametros': parametros,
                    'archivo': str(archivo.relative_to(RAIZ)), 'linea': linea
                })
    return llamadas


def _siguiente_objeto(texto):
    """
    Si lo que sigue a `rpc('nombre'` es `, { ... }`, devuelve el texto entre
    esas llaves (incluidas). Si el siguiente argumento no es un objeto
    literal (una variable, por ejemplo), o no hay segundo argumento,
    devuelve None: no hay parámetros por nombre que comprobar ahí.
    """
    i = 0
    n = len(texto)
    while i < n and texto[i] in ' \t\n,':
        i += 1
    if i >= n or texto[i] != '{':
        return None
    inicio = i
    profundidad = 0
    while i < n:
        if texto[i] == '{':
            profundidad += 1
        elif texto[i] == '}':
            profundidad -= 1
            if profundidad == 0:
                return texto[inicio:i + 1]
        i += 1
    return None  # llave sin cerrar dentro de lo leído: no se arriesga el chequeo


def _claves_de_objeto(texto_objeto):
    """
    Claves del NIVEL SUPERIOR de un objeto literal `{ a: 1, b: fn(2) }`.
    No baja a objetos anidados como valor (`{ timeZone: 'x' }` dentro de un
    valor no cuenta), así que un objeto anidado como parámetro no se lee
    del todo — límite conocido, ver el docstring del módulo.
    """
    claves = set()
    profundidad = 0
    esperando_clave = True
    buffer = ''
    for c in texto_objeto[1:-1]:  # sin las llaves exteriores
        if c in '{[(':
            profundidad += 1
        elif c in '}])':
            profundidad -= 1
        elif profundidad == 0 and c == ':' and esperando_clave:
            clave = buffer.strip()
            if re.fullmatch(r'\w+', clave):
                claves.add(clave)
            esperando_clave = False
            buffer = ''
            continue
        elif profundidad == 0 and c == ',':
            esperando_clave = True
            buffer = ''
            continue
        if esperando_clave:
            buffer += c
    return claves


def main():
    if not MIGRACIONES.is_dir():
        print(f'{ROJO}No encuentro {MIGRACIONES}{FIN}')
        return 1

    firmas = firmas_declaradas()
    llamadas = llamadas_en_js()

    print(f'{len(firmas)} funciones públicas declaradas en las migraciones')
    print(f'{len(llamadas)} llamadas a rpc(...) encontradas en js/\n')

    problemas = []

    for llamada in llamadas:
        nombre = llamada['nombre']
        origen = f"{llamada['archivo']}:{llamada['linea']}"

        if nombre not in firmas:
            problemas.append(
                f'{origen} llama a rpc(\'{nombre}\', ...) pero ninguna migración declara '
                f'esa función pública.\n'
                f'      O el nombre tiene un error de tipeo, o la función se renombró/borró '
                f'y este llamado quedó atrás.'
            )
            continue

        firma = firmas[nombre]
        de_mas = llamada['parametros'] - firma['parametros']
        if de_mas:
            problemas.append(
                f'{origen} llama a rpc(\'{nombre}\', ...) mandando '
                f'{", ".join(sorted(de_mas))}, que la función ya NO acepta '
                f'(firma actual en {firma["archivo"]}: '
                f'{", ".join(sorted(firma["parametros"])) or "sin parámetros"}).\n'
                f'      Esto es exactamente lo que pasó con deshacer_libro_remoto(): '
                f'Supabase suele ignorar el parámetro sobrante en vez de fallar, así que '
                f'el error queda escondido hasta que alguien lo nota a mano.'
            )

    print()
    if problemas:
        print(f'{ROJO}{"─" * 66}{FIN}')
        print(f'{ROJO}{len(problemas)} llamada(s) que no coinciden con la firma actual:{FIN}\n')
        for i, p in enumerate(problemas, 1):
            print(f'  {i}. {p}\n')
        return 1

    print(f'{VERDE}{"─" * 66}{FIN}')
    print(f'{VERDE}Todas las llamadas a RPC coinciden con la firma vigente en las migraciones.{FIN}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
