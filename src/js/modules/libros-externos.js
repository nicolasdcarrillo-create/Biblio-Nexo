/**
 * Búsqueda de título y autor por ISBN en un catálogo externo, para el
 * registro rápido de libros nuevos desde el escáner.
 *
 * Se usa Open Library porque el sistema ya depende de ella para las
 * portadas (`https://covers.openlibrary.org`, ver ui-base.js) y no agrega
 * un dominio nuevo a la Política de Seguridad de Contenido.
 *
 * Es solo una ayuda para no escribir el título a mano: la persona siempre
 * revisa y puede corregir lo que trae antes de guardar, así que un dato
 * incompleto o equivocado de Open Library nunca llega a la base sin que
 * alguien lo vea primero. Si Open Library no responde, no tiene el ISBN,
 * o no hay conexión, se devuelve null y el formulario queda igual de
 * usable, solo que vacío — nunca bloquea el registro manual.
 */
export async function buscarPorIsbnExterno(isbn) {
    const limpio = (isbn || '').replace(/[^0-9Xx]/g, '');
    if (!limpio) return null;

    try {
        const controlador = new AbortController();
        const expira = setTimeout(() => controlador.abort(), 6000);
        let respuesta;
        try {
            respuesta = await fetch(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(limpio)}&format=json&jscmd=data`,
                { signal: controlador.signal }
            );
        } finally {
            clearTimeout(expira);
        }
        if (!respuesta.ok) return null;

        const datos = await respuesta.json();
        const libro = datos[`ISBN:${limpio}`];
        if (!libro) return null;

        return {
            titulo: libro.title || '',
            autor: (libro.authors || []).map(a => a.name).filter(Boolean).join(', ')
        };
    } catch {
        // Sin conexión, tiempo agotado, o Open Library no respondió: se sigue a mano.
        return null;
    }
}
