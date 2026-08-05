"""
Copia la carpeta de zonas horarias a pgserver, si falta.

pgserver es el PostgreSQL embebido que usa probar_librero.py en Windows para
no depender de un servidor externo. Su paquete para Windows no trae
share/postgresql/timezone (ver pruebas/LEEME.md, "Limitación conocida:
timezone"), así que sin ella Postgres no resuelve America/Santiago y las
cinco funciones que dependen de la hora local se omiten en vez de probarse.

Este script busca esa carpeta en una instalación de PostgreSQL para Windows ya
presente en el equipo (el "donante") y la copia dentro del paquete pgserver.
Es idempotente: si la carpeta ya existe y no está vacía, no hace nada.

No compara la versión del donante con la de pgserver: si hay varias
instalaciones de PostgreSQL para Windows, toma la más nueva por número de
versión, sin verificar que coincida con la que trae pgserver. La carpeta de
zonas horarias cambia poco entre versiones mayores, así que en la práctica no
es un problema, pero no es una garantía.

Es un parche sobre un paquete de terceros: vive en site-packages, no en este
repositorio. CUALQUIER reinstalación de pgserver (pip install --upgrade, o
rehacer el entorno virtual) la borra sin avisar. Hay que volver a correr este
script después de eso.

Uso:
    python pruebas/preparar_timezone_pgserver.py
    python pruebas/preparar_timezone_pgserver.py --donante "C:/ruta/a/share/timezone"
"""
import argparse, pathlib, shutil, sys


def carpeta_pgserver():
    """Dónde pgserver espera encontrar las zonas horarias."""
    try:
        import pgserver
    except ImportError:
        print('pgserver no está instalado: pip install pgserver "psycopg[binary]"')
        sys.exit(1)
    return pathlib.Path(pgserver.__file__).parent / 'pginstall' / 'share' / 'postgresql' / 'timezone'


def candidatos_donante():
    """Instalaciones de PostgreSQL para Windows donde buscar share/timezone,
    de la más nueva a la más vieja."""
    raiz = pathlib.Path('C:/Program Files/PostgreSQL')
    if not raiz.is_dir():
        return
    for version in sorted(raiz.iterdir(), reverse=True):
        candidato = version / 'share' / 'timezone'
        if candidato.is_dir():
            yield candidato


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--donante', help='Carpeta share/timezone de una instalación de '
                     'PostgreSQL para Windows, si no está en la ubicación habitual.')
    args = ap.parse_args()

    destino = carpeta_pgserver()
    if destino.is_dir() and any(destino.iterdir()):
        print(f'Ya existe y no está vacía: {destino}')
        print('Nada que hacer.')
        return

    if args.donante:
        origen = pathlib.Path(args.donante)
        if not origen.is_dir():
            print(f'FALLO: --donante no es una carpeta: {origen}')
            sys.exit(1)
    else:
        origen = next(candidatos_donante(), None)
        if origen is None:
            print('No encontré ninguna instalación de PostgreSQL para Windows con')
            print('share/timezone en la ubicación habitual')
            print('(C:/Program Files/PostgreSQL/<versión>).')
            print()
            print('Opciones:')
            print('  1. Instalar PostgreSQL para Windows y volver a correr este script:')
            print('       winget install PostgreSQL.PostgreSQL.17')
            print('  2. Si ya tienes una instalación en otra ruta, indícala con --donante:')
            print('       python pruebas/preparar_timezone_pgserver.py \\')
            print('         --donante "C:/ruta/a/share/timezone"')
            sys.exit(1)

    print(f'Copiando  {origen}')
    print(f'      ->  {destino}')
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(origen, destino, dirs_exist_ok=True)
    print(f'Listo: {len(list(destino.iterdir()))} entradas copiadas.')
    print()
    print('Nota: esta carpeta vive dentro de site-packages, no en el repositorio.')
    print('Si reinstalas pgserver, se borra y hay que volver a correr este script.')


if __name__ == '__main__':
    main()
