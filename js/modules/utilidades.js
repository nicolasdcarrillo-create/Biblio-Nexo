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
