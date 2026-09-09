/**
 * Portada de un libro por ISBN, vía Open Library — compartido entre el panel
 * del personal (ui-base.js) y el escaneo remoto sin sesión (escaneo-remoto.js,
 * ítem 11), para no duplicar la misma lógica en dos archivos y arreglarla una
 * sola vez si algún día cambia.
 *
 * Es gratuita y no necesita clave. El parámetro default=false hace que
 * Open Library responda 404 cuando no tiene portada, en vez de devolver una
 * imagen de 1 píxel — así el error se puede detectar y mostrar un respaldo.
 */
import { escapeHtml } from './utilidades.js';

/** URL de portada de un libro, o null si no hay ninguna disponible. */
export function portadaUrl(libro) {
  if (libro.portada_url) return libro.portada_url;
  const isbn = (libro.isbn || '').replace(/[^0-9Xx]/g, '');
  if (isbn.length !== 10 && isbn.length !== 13) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
}

/**
 * Miniatura de portada (ancho w-10 h-14 por defecto). Si la imagen falla
 * (sin conexión, o el libro no está en Open Library) queda a la vista el
 * lomo dibujado con las iniciales que hay debajo, en vez de un ícono roto.
 *
 * Sin onerror en línea: la Política de Seguridad de Contenido no permite
 * scripts incrustados. La caída se maneja con vigilarPortadas() (un único
 * escuchador global en fase de captura, porque el evento 'error' de una
 * imagen no burbujea).
 */
export function portadaHtml(libro, clases = 'w-10 h-14') {
  const url = portadaUrl(libro);
  const inicial = escapeHtml((libro.titulo || '?').trim().charAt(0).toUpperCase());
  const respaldo = `<div class="portada-respaldo ${clases} rounded shrink-0 flex items-center justify-center font-serif font-bold text-white text-lg select-none">${inicial}</div>`;

  if (!url) return respaldo;

  return `
    <div class="relative ${clases} shrink-0">
      ${respaldo}
      <img src="${escapeHtml(url)}" alt="" loading="lazy" class="portada-img absolute inset-0 ${clases} object-cover rounded shadow-sm" />
    </div>`;
}

let vigilando = false;
/**
 * Quita las portadas que no cargaron, para que quede a la vista el lomo
 * dibujado que hay debajo en vez de un ícono roto.
 *
 * Se instala una sola vez por página y en fase de captura: los eventos
 * 'error' de las imágenes no burbujean, así que un escuchador normal en
 * document nunca los vería.
 */
export function vigilarPortadas() {
  if (vigilando) return;
  vigilando = true;
  document.addEventListener('error', evento => {
    const el = evento.target;
    if (el instanceof HTMLImageElement && el.classList.contains('portada-img')) {
      el.remove();
    }
  }, true);
}
