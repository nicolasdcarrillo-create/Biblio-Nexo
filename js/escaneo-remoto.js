/**
 * Página de escaneo remoto SIN sesión (escaneo-remoto.html).
 *
 * Aparte del sistema principal a propósito: la abre el enlace del QR de
 * ui-base.js (showQrRemotoModal), con un token de un solo objetivo en la URL
 * (?token=...). No importa js/main.js ni supabase-init.js — no hace falta
 * iniciar sesión, así que tampoco hace falta gotrue-js (la librería de
 * autenticación de Supabase) ni su candado entre pestañas. Se habla
 * directamente con la API REST de Supabase (PostgREST) con la llave anónima,
 * exactamente lo mismo que hace supabase-js por debajo para llamar una
 * función RPC.
 *
 * El módulo de escaneo (scanner.js) y la búsqueda por ISBN en Open Library
 * (libros-externos.js) se reutilizan tal cual: no dependen de si hay sesión.
 */
import { CONFIG } from './config.js';
import { escapeHtml } from './modules/utilidades.js';
import { buscarPorIsbnExterno } from './modules/libros-externos.js';
import Scanner from './modules/scanner.js';

const ESPERA_MS = 15000;

/**
 * Llama a una función RPC de Postgres directo por la API REST de Supabase.
 * Los parámetros que no se envían usan el valor por defecto de la función
 * (así lo resuelve PostgREST), así que alcanza con mandar los que importan
 * cada vez.
 */
async function rpc(nombre, parametros = {}) {
    const controlador = new AbortController();
    const expira = setTimeout(() => controlador.abort(), ESPERA_MS);
    let respuesta;
    try {
        respuesta = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/${nombre}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: CONFIG.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(parametros),
            signal: controlador.signal
        });
    } catch (e) {
        throw new Error(e.name === 'AbortError'
            ? 'La operación tardó demasiado en responder. Intente nuevamente.'
            : 'No se pudo conectar. Revise su conexión a internet.');
    } finally {
        clearTimeout(expira);
    }

    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        throw new Error((datos && (datos.message || datos.error_description || datos.hint)) ||
            'No se pudo completar la operación.');
    }
    return datos;
}

function token() {
    return new URLSearchParams(window.location.search).get('token') || '';
}

function raiz() {
    return document.getElementById('escaneo-remoto-app');
}

/** Tarjeta de error a pantalla completa: enlace inválido, vencido o revocado. */
function mostrarError(mensaje) {
    raiz().innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl shadow-2xl p-6 text-center space-y-3">
        <i aria-hidden="true" class="fas fa-triangle-exclamation text-3xl text-rose-700"></i>
        <h1 class="font-serif text-lg font-bold text-stone-900">Este enlace no funciona</h1>
        <p class="text-sm text-stone-600">${escapeHtml(mensaje)}</p>
        <p class="text-xs text-stone-500">Pida un enlace nuevo en el mesón de la biblioteca.</p>
      </div>`;
}

let ultimoCodigo = null;
let ultimoEscaneo = 0;
function esRepetido(codigo) {
    const ahora = Date.now();
    if (codigo === ultimoCodigo && ahora - ultimoEscaneo < 3000) return true;
    ultimoCodigo = codigo;
    ultimoEscaneo = ahora;
    return false;
}

function toast(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('er-toast');
    if (!contenedor) return;
    const colores = tipo === 'error'
        ? 'bg-rose-50 border-rose-200 text-rose-800'
        : 'bg-emerald-50 border-emerald-200 text-emerald-800';
    contenedor.innerHTML = `<div class="border rounded-xl px-3 py-2 text-xs font-medium ${colores}" role="status">${escapeHtml(mensaje)}</div>`;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { if (contenedor) contenedor.innerHTML = ''; }, 5000);
}

/** Pantalla principal: vence-en, cámara, entrada manual, resultado. */
function pintarPrincipal(vence) {
    raiz().innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="text-center">
          <i aria-hidden="true" class="fas fa-barcode text-2xl text-patrimonio-madera"></i>
          <h1 class="font-serif text-lg font-bold text-stone-900 mt-1">Escaneo remoto de libros</h1>
          <p class="text-xs text-stone-500 mt-1">
            Sin iniciar sesión. Solo agrega o suma ejemplares al catálogo — nada más.
            ${vence ? `Este enlace vence a las ${escapeHtml(vence)}.` : ''}
          </p>
        </div>
        <div id="er-toast"></div>
        <div class="flex gap-3">
          <button id="er-start" class="btn-madera flex-1 text-white font-sans font-medium rounded-xl shadow px-4 py-2 text-sm">
            <i aria-hidden="true" class="fas fa-camera mr-1.5"></i>Iniciar cámara
          </button>
          <button id="er-stop" class="bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-medium px-4 py-2 text-sm">
            Detener
          </button>
        </div>
        <div id="reader" class="w-full"></div>
        <div class="flex gap-3">
          <input id="er-manual" inputmode="numeric" aria-label="Escribir el ISBN manualmente"
            placeholder="O ingrese el ISBN manualmente"
            class="flex-1 px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          <button id="er-buscar" class="bg-patrimonio-lago hover:bg-[#14303c] text-white font-sans font-medium rounded-xl shadow px-4 py-2 text-sm">Agregar</button>
        </div>
        <div id="er-resultado"></div>
      </div>`;

    document.getElementById('er-start').addEventListener('click', async e => {
        const boton = e.currentTarget;
        const original = boton.innerHTML;
        boton.disabled = true;
        boton.textContent = 'Preparando cámara…';
        try {
            await Scanner.start(
                codigo => { if (!esRepetido(codigo)) manejarCodigo(codigo); },
                mensaje => toast(mensaje, 'error')
            );
        } finally {
            boton.disabled = false;
            boton.innerHTML = original;
        }
    });
    document.getElementById('er-stop').addEventListener('click', () => Scanner.stop());

    const buscarManual = () => {
        const campo = document.getElementById('er-manual');
        const codigo = campo.value.trim();
        if (codigo) { campo.value = ''; manejarCodigo(codigo); }
    };
    document.getElementById('er-buscar').addEventListener('click', buscarManual);
    document.getElementById('er-manual').addEventListener('keydown', e => {
        if (e.key === 'Enter') buscarManual();
    });
}

/** Intenta agregar/reponer un libro por su ISBN; si falta info, pide los datos. */
async function manejarCodigo(codigo) {
    const resultado = document.getElementById('er-resultado');
    if (!resultado) return;
    resultado.innerHTML = '<p class="text-xs text-stone-500"><i aria-hidden="true" class="fas fa-spinner fa-spin mr-1"></i>Consultando…</p>';

    try {
        const filas = await rpc('agregar_libro_remoto', { p_token: token(), p_isbn: codigo });
        const fila = filas?.[0];
        if (!fila) throw new Error('El sistema no respondió con datos.');

        if (fila.estado === 'falta_info') {
            await mostrarFormularioDatos(resultado, codigo);
            return;
        }

        const accion = fila.estado === 'creado' ? 'Se agregó' : 'Se repuso';
        resultado.innerHTML = `
          <div class="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-sm">
            <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>${accion} al catálogo</p>
            <p class="text-emerald-700 mt-1">${escapeHtml(fila.titulo || fila.isbn)}${fila.autor ? ` — ${escapeHtml(fila.autor)}` : ''}</p>
            <p class="text-xs text-emerald-600 mt-1">Ahora hay ${fila.stock} de ${fila.copias_totales} ejemplar(es) disponibles.</p>
          </div>`;
        toast('Listo. Puede seguir escaneando.', 'success');
    } catch (err) {
        const mensaje = err.message || 'No se pudo completar la operación.';
        resultado.innerHTML = `<p class="text-rose-700 text-sm font-bold"><i aria-hidden="true" class="fas fa-circle-exclamation mr-1.5"></i>${escapeHtml(mensaje)}</p>`;
        // Un enlace vencido o revocado a mitad de sesión no se recupera solo:
        // se corta aquí para que la persona no siga escaneando en vano.
        if (/no es válido|expiró|revocado/i.test(mensaje)) {
            Scanner.stop();
        }
    }
}

/** El ISBN es nuevo: pide título/autor (con ayuda de Open Library) y reintenta. */
async function mostrarFormularioDatos(resultado, codigo) {
    const campo = (id, etiqueta, extra = '') => `
      <div>
        <label for="${id}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${etiqueta}</label>
        <input id="${id}" ${extra}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;

    resultado.innerHTML = `
      <div class="border border-stone-300 rounded-xl p-4">
        <p class="text-sm text-stone-600 mb-1">Ningún libro registrado con el código <span class="font-mono font-bold">${escapeHtml(codigo)}</span>.</p>
        <p id="er-buscando" class="text-xs text-stone-500 mb-3"><i aria-hidden="true" class="fas fa-spinner fa-spin"></i> Buscando título y autor en Open Library…</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${campo('er-nuevo-titulo', 'Título')}
          ${campo('er-nuevo-autor', 'Autor')}
          ${campo('er-nuevo-cantidad', 'Ejemplares', 'type="number" min="1" value="1"')}
        </div>
        <div class="flex justify-end gap-3 pt-3">
          <button id="er-nuevo-guardar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-plus mr-1"></i>Agregar al catálogo
          </button>
        </div>
      </div>`;

    document.getElementById('er-nuevo-guardar').addEventListener('click', async e => {
        const titulo = document.getElementById('er-nuevo-titulo').value.trim();
        const autor = document.getElementById('er-nuevo-autor').value.trim();
        const cantidad = Number(document.getElementById('er-nuevo-cantidad').value || 1);
        if (!titulo) { toast('El título es obligatorio.', 'error'); return; }

        const boton = e.currentTarget;
        boton.disabled = true;
        try {
            const filas = await rpc('agregar_libro_remoto', {
                p_token: token(), p_isbn: codigo, p_titulo: titulo, p_autor: autor || null, p_stock: cantidad
            });
            const fila = filas?.[0];
            resultado.innerHTML = `
              <div class="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-sm">
                <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Se agregó al catálogo</p>
                <p class="text-emerald-700 mt-1">${escapeHtml(fila?.titulo || titulo)}</p>
              </div>`;
            toast('Listo. Puede seguir escaneando.', 'success');
        } catch (err) {
            toast(err.message || 'No se pudo agregar el libro.', 'error');
            boton.disabled = false;
        }
    });

    // Se completa DESPUÉS de pintar el formulario, igual que en el escáner
    // del personal (ui-base.js, _formularioAltaRapida): si Open Library no
    // responde a tiempo, el formulario queda intacto para llenarlo a mano.
    const datos = await buscarPorIsbnExterno(codigo);
    document.getElementById('er-buscando')?.remove();
    if (datos) {
        const tituloInput = document.getElementById('er-nuevo-titulo');
        const autorInput = document.getElementById('er-nuevo-autor');
        if (tituloInput && !tituloInput.value.trim() && datos.titulo) tituloInput.value = datos.titulo;
        if (autorInput && !autorInput.value.trim() && datos.autor) autorInput.value = datos.autor;
    }
}

/**
 * Exportada a propósito: para que el banco de pruebas (pruebas/probar-
 * escaneo-remoto.mjs) pueda llamarla directo, en vez de depender de que
 * jsdom dispare DOMContentLoaded en el momento justo — main.js tiene el mismo
 * problema y por eso el resto de las pruebas nunca lo importa, sino que
 * llaman directo a las funciones de ui.js.
 */
export async function iniciar() {
    const t = token();
    if (!t) {
        mostrarError('Falta el código del enlace en la dirección. Pida uno nuevo en el mesón.');
        return;
    }

    let fila;
    try {
        const filas = await rpc('validar_enlace_escaneo', { p_token: t });
        fila = filas?.[0];
    } catch (err) {
        mostrarError(err.message || 'No se pudo comprobar el enlace.');
        return;
    }

    if (!fila || !fila.valido) {
        mostrarError(fila?.motivo || 'Este enlace ya no es válido.');
        return;
    }

    const vence = fila.expira_en ? new Date(fila.expira_en).toLocaleString('es-CL', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }) : '';
    pintarPrincipal(vence);
}

document.addEventListener('DOMContentLoaded', () => {
    iniciar().catch(() => mostrarError('No se pudo cargar la página. Revise su conexión e intente de nuevo.'));
});
