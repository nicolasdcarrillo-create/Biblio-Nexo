/**
 * Utilidades compartidas entre módulos.
 */

/**
 * Limita el tiempo de espera de una promesa.
 *
 * Sin este límite, una llamada a Supabase que se queda colgada (por ejemplo,
 * por el candado de sesión de gotrue-js, ver MIGRACIONES.md) deja un botón o
 * una pantalla esperando para siempre, sin ningún aviso a la persona que está
 * usando el sistema. El resto de la aplicación ya sabe manejar un error — con
 * esto, un cuelgue se convierte en un error como cualquier otro en vez de en
 * una pantalla congelada.
 */
export function conTiempoLimite(
    promesa,
    ms = 15000,
    mensaje = 'La operaci\u00f3n tard\u00f3 demasiado en responder. Intente nuevamente; si el problema persiste, recargue la p\u00e1gina.'
) {
    let idTemporizador;
    const temporizador = new Promise((_, rechazar) => {
        idTemporizador = setTimeout(() => rechazar(new Error(mensaje)), ms);
    });
    return Promise.race([promesa, temporizador]).finally(() => clearTimeout(idTemporizador));
}

/**
 * Escapa caracteres especiales de HTML.
 *
 * Se compara con null/undefined y no con !valor: el número 0 y la cadena "0"
 * son datos legítimos que se perdían por el camino.
 */
export function escapeHtml(valor) {
    if (valor === null || valor === undefined) return '';
    return valor.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/** Marca una cadena como HTML ya seguro, para que html\`...\` no la vuelva a escapar. */
class HtmlSeguro {
    constructor(valor) {
        this.valor = valor;
    }
    toString() {
        return this.valor;
    }
}

/**
 * Envuelve HTML ya armado —por ejemplo, el resultado de una función auxiliar
 * que ya llamó a escapeHtml sobre sus propios datos— para interpolarlo dentro
 * de una plantilla html\`...\` sin que se vuelva a escapar.
 */
export function crudo(htmlYaSeguro) {
    return new HtmlSeguro(htmlYaSeguro ?? '');
}

function valorSeguro(valor) {
    if (valor instanceof HtmlSeguro) return valor.valor;
    if (Array.isArray(valor)) return valor.map(valorSeguro).join('');
    return escapeHtml(valor);
}

/**
 * Plantilla etiquetada que escapa cada valor interpolado por defecto.
 *
 * Uso: contenedor.innerHTML = html\`<p>${libro.titulo}</p>\`; el título queda
 * escapado sin que nadie tenga que acordarse de llamar a escapeHtml. Para
 * interpolar HTML de confianza (el resultado de otra llamada a html\`...\`, o
 * de una función auxiliar que ya escapó sus propios datos por su cuenta),
 * envuélvelo con crudo(...). Los arreglos se unen automáticamente: no hace
 * falta \`.join('')\`, y cada elemento pasa por la misma comprobación.
 */
export function html(partesFijas, ...valores) {
    let resultado = partesFijas[0];
    for (let i = 0; i < valores.length; i++) {
        resultado += valorSeguro(valores[i]) + partesFijas[i + 1];
    }
    return new HtmlSeguro(resultado);
}

/**
 * Nombre del canal de Supabase Realtime (Broadcast) para avisar, en vivo, que
 * se escaneó un libro desde el enlace remoto — sección "Escaneo/Mesón" del
 * 22 de agosto de 2026 (ver claude/reservas-whatsapp-meson-2026-08-22.md).
 *
 * Se deriva del propio token del enlace con SHA-256 en vez de mandar el
 * enlace_id: cualquiera de las dos partes —el celular sin sesión
 * (escaneo-remoto.js) y el mesón con sesión (mostrador.js)— puede calcular
 * el mismo nombre de canal por su cuenta a partir del token que ya tiene
 * (el celular, de la URL; el mesón, de la respuesta de crear_enlace_escaneo),
 * sin una ida y vuelta extra al servidor y sin necesidad de exponer el
 * enlace_id numérico en la URL pública. Usa Broadcast, no postgres_changes:
 * el camino "el código ya existe, solo mostrar los datos" no escribe nada en
 * la base (a propósito, ver agregar_libro_remoto en 010_consolidacion.sql),
 * así que no habría ninguna fila que cambiara para que postgres_changes
 * pudiera detectar.
 */
export async function canalEscaneo(token) {
    const datos = new TextEncoder().encode(token || '');
    const huella = await crypto.subtle.digest('SHA-256', datos);
    const hex = Array.from(new Uint8Array(huella)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `escaneo-remoto-${hex}`;
}
