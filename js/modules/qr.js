/**
 * Genera el código QR de acceso remoto al escáner, como una etiqueta SVG
 * lista para insertar en la pantalla.
 *
 * La librería (`vendor/js/qrcode.min.js`, ~20 KB) se carga solo al pedir un
 * QR por primera vez, igual que se hace con html5-qrcode.min.js y Chart.js:
 * quien nunca genera un QR no la descarga.
 *
 * Se usa SVG en vez de un <canvas> o una imagen: el resultado es texto,
 * queda dentro de la Política de Seguridad de Contenido sin abrir ningún
 * dominio nuevo (no hay ninguna petición de red de por medio) y se ve nítido
 * a cualquier tamaño en la pantalla del celular que lo escanea.
 */
let promesaLibreria = null;
function cargarLibreria() {
    if (!promesaLibreria) {
        // Extensión .js (no .mjs) a propósito: import() no depende de la
        // extensión para tratarlo como módulo, y así se evita depender de
        // que el servidor sirva .mjs con el tipo MIME correcto.
        promesaLibreria = import('../../vendor/js/qrcode.min.js').then(m => m.default);
    }
    return promesaLibreria;
}

/**
 * @param {string} texto  Lo que codifica el QR (aquí, siempre una URL propia
 *                        del sistema; nunca datos de una persona).
 * @returns {Promise<string>} Una etiqueta <svg ...>...</svg> como texto.
 */
export async function generarSvgQr(texto) {
    const qrcode = await cargarLibreria();
    // typeNumber 0 = que la librería elija el tamaño mínimo que alcance;
    // 'M' = corrección de errores media, el valor por defecto recomendado.
    const qr = qrcode(0, 'M');
    qr.addData(texto);
    qr.make();
    // cellSize 5, margin 2: legible desde una foto de celular sin quedar
    // enorme en pantallas chicas.
    return qr.createSvgTag(5, 2);
}
