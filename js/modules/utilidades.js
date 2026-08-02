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
    mensaje = 'La operación tardó demasiado en responder. Intente nuevamente; si el problema persiste, recargue la página.'
) {
    return Promise.race([
        promesa,
        new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms))
    ]);
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
