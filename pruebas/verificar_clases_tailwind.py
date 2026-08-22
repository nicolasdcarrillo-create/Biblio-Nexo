#!/usr/bin/env python3
"""
Vigila que toda clase CSS usada en el código ya esté compilada.

`vendor/css/tailwind.css` es estático: se generó una vez a mano, no hay paso
de build que lo regenere en cada cambio (no hay `tailwind.config.*` ni
`package.json` en este repositorio — ver PROMPT-produccion.md, sección 12).
Una clase de Tailwind que "se ve" válida pero nunca se usó antes en ningún
otro archivo del proyecto no existe en ese CSS compilado, y no da NINGÚN
error: el elemento queda sin ese estilo, en silencio. Pasó dos veces en la
misma sesión (19 de agosto de 2026, la esquina del escáner; 22 de agosto,
`mx-auto` en escaneo-remoto.js y `hover:bg-rose-100` en perfil.js), y las
dos veces se encontró leyendo el CSS compilado a mano — este script
automatiza exactamente esa lectura.

Esta comprobación lee los archivos, no el navegador, así que atrapa el
problema en el envío al repositorio — antes de que llegue a producción.
Mismo espíritu y mismas limitaciones de fondo que
`pruebas/verificar_llamadas_rpc.py`: es un chequeo estático con regex, no un
parser de CSS ni de JavaScript.

Qué compara:
  · "Compilado" = toda clase que aparece como selector en cualquier .css de
    `vendor/css/` o `css/` (Tailwind vendorizado + FontAwesome vendorizado +
    los estilos propios del proyecto).
  · "Usada" = toda clase que aparece en un atributo `class="..."` /
    `className = "..."` (HTML o plantillas de JS), o como argumento de
    `classList.add/remove/toggle(...)`, en cualquier .js de `js/` o .html de
    la raíz.

Limitaciones conocidas, a propósito (no se resuelven con más regex):
  · Clases armadas con interpolación (`class="... ${variable}"`) solo se
    revisa la parte literal — la parte `${...}` no se puede resolver sin
    ejecutar el código, igual que verificar_llamadas_rpc.py no resuelve
    argumentos dinámicos.
  · Clases usadas solo como gancho para JavaScript (`querySelector`), sin
    ningún estilo asociado a propósito, no son clases CSS que deban estar
    compiladas — van en IGNORAR con el motivo escrito.

Ejecutar:  python3 pruebas/verificar_clases_tailwind.py
Devuelve 0 si todo está en orden, 1 si hay algo que corregir.
"""

import re
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

RAIZ = Path(__file__).resolve().parent.parent
VERDE, ROJO, AMARILLO, FIN = '\033[32m', '\033[31m', '\033[33m', '\033[0m'

# Clases que a propósito no tienen estilo asociado — son ganchos para que el
# propio JavaScript encuentre un elemento (querySelector), no clases de CSS.
# Si una de estas alguna vez necesita estilo de verdad, hay que sacarla de
# aquí y agregarle la regla en css/styles.css.
IGNORAR = {
    # js/modules/ui-base.js: mostrarErrorCampo() la usa para encontrar (y
    # reemplazar) el mensaje de error ya puesto junto a un campo — el estilo
    # visible lo dan las otras clases del mismo className, esta es el gancho.
    'input-error',

    # Ganchos de delegación de eventos: cada uno se busca después con
    # `container.querySelectorAll('.xxx')` para engancharle un listener. El
    # estilo visible siempre lo dan las demás clases del mismo `class="..."`;
    # estas no necesitan regla propia en ningún CSS.
    'admin-tab-btn', 'delete-book-btn', 'delete-personal-btn', 'delete-user-btn',
    'edit-book-btn', 'edit-user-btn', 'fix-inv-btn', 'loan-book-btn',
    'loan-filter-btn', 'notify-loan-btn', 'param-input', 'quick-action-btn',
    'renew-loan-btn', 'report-period-btn', 'retry-chart-btn', 'return-loan-btn',
    'revocar-enlace-btn', 'role-btn', 'unblock-btn',
    # js/modules/portadas.js: marca las imágenes de portada para encontrarlas
    # y reemplazarlas cuando llega la portada real (querySelector + classList.contains).
    'portada-img',
}

PATRON_CLASE_CSS = re.compile(r'\.((?:\\.|[\w-])+)')
PATRON_CLASS_ATTR = re.compile(r'\bclass(?:Name)?\s*=\s*(["\'`])(.*?)\1', re.S)
PATRON_CLASSLIST = re.compile(r'classList\.(?:add|remove|toggle)\(([^)]*)\)')
PATRON_STRING_LITERAL = re.compile(r'''(['"`])((?:(?!\1)[^\\]|\\.)*)\1''')
PATRON_INTERPOLACION = re.compile(r'\$\{[^}]*\}')


def clases_compiladas(texto_css):
    clases = set()
    for m in PATRON_CLASE_CSS.finditer(texto_css):
        crudo = m.group(1)
        limpio = re.sub(r'\\(.)', r'\1', crudo)
        clases.add(limpio)
    return clases


def tokens_de(valor):
    """Divide un valor de `class`/`className` en clases, descartando por
    completo cualquier token que toque una interpolación `${...}` — incluido
    el prefijo literal pegado a ella (`momento-${x}` no debe dejar suelto un
    `momento-` fantasma). Los espacios DENTRO de una interpolación (frecuente
    en un ternario) se protegen antes de dividir, para no partirla en dos."""
    protegido = PATRON_INTERPOLACION.sub(lambda m: re.sub(r'\s', '\x00', m.group(0)), valor)
    return {t for t in protegido.split() if t and '${' not in t}


def clases_usadas_en(texto):
    usadas = set()

    for m in PATRON_CLASS_ATTR.finditer(texto):
        usadas |= tokens_de(m.group(2))

    for m in PATRON_CLASSLIST.finditer(texto):
        for lit in PATRON_STRING_LITERAL.finditer(m.group(1)):
            usadas |= tokens_de(lit.group(2))

    return usadas


def main():
    css_dirs = [RAIZ / 'vendor' / 'css', RAIZ / 'css']
    archivos_css = sorted(
        f for d in css_dirs if d.is_dir() for f in d.glob('*.css')
    )
    if not archivos_css:
        print(f'{ROJO}No encuentro ningún .css en vendor/css/ ni css/{FIN}')
        return 1

    compiladas = set()
    for archivo in archivos_css:
        compiladas |= clases_compiladas(archivo.read_text(encoding='utf-8'))

    print(f'{len(compiladas)} clases compiladas, leídas de {len(archivos_css)} archivo(s) CSS:')
    for archivo in archivos_css:
        print(f'  · {archivo.relative_to(RAIZ)}')

    archivos_fuente = sorted((RAIZ / 'js').rglob('*.js')) + sorted(RAIZ.glob('*.html'))
    faltantes = {}  # clase -> set(archivo relativo)
    total_usadas = set()

    for archivo in archivos_fuente:
        usadas = clases_usadas_en(archivo.read_text(encoding='utf-8'))
        total_usadas |= usadas
        for clase in usadas:
            if clase in compiladas or clase in IGNORAR:
                continue
            faltantes.setdefault(clase, set()).add(str(archivo.relative_to(RAIZ)))

    print(f'{len(total_usadas)} clases usadas, encontradas en {len(archivos_fuente)} archivo(s) fuente '
          f'(.js de js/, .html de la raíz)\n')

    if faltantes:
        print(f'{ROJO}{"─" * 66}{FIN}')
        print(f'{ROJO}{len(faltantes)} clase(s) usada(s) que no están compiladas — no van a hacer nada:{FIN}\n')
        for clase in sorted(faltantes):
            archivos = ', '.join(sorted(faltantes[clase]))
            print(f'  · {clase}\n      usada en: {archivos}')
        print(f'\n  Corrección: si es una clase de Tailwind, agrégala a mano a '
              f'vendor/css/tailwind.css (mismo patrón que las últimas dos veces —\n'
              f'  ver el comentario junto a `.mx-auto` en ese archivo). Si es una clase '
              f'propia del proyecto, agrégale la regla en css/styles.css.\n'
              f'  Si de verdad no necesita estilo (solo la usa JavaScript para encontrar '
              f'el elemento), agrégala a IGNORAR en este script, con el motivo escrito.')
        return 1

    print(f'{VERDE}{"─" * 66}{FIN}')
    print(f'{VERDE}Todas las clases usadas están compiladas.{FIN}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
