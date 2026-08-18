import { CONFIG } from './config.js';

/**
 * Reemplaza el candado entre pestañas de gotrue-js (navigator.locks) por uno
 * que no bloquea nunca.
 *
 * Por qué: gotrue-js usa navigator.locks para que, con varias pestañas del
 * sistema abiertas, solo una a la vez renueve la sesión. El problema es que
 * ese candado a veces no se suelta —se comprobó con navigator.locks.query(),
 * ver MENSAJE_ARRANQUE_LENTO en main.js— y entonces CUALQUIER pestaña que
 * necesite el mismo candado se queda esperando para siempre: no solo la que
 * lo dejó pegado. Es lo que producía el cuelgue al entrar con correo y
 * contraseña después de que `getSession()` ya se hubiera colgado una vez.
 *
 * El resguardo de 8 segundos en main.js convierte ESE cuelgue puntual en un
 * error, pero no evita que vuelva a pasar en la próxima carga: el candado
 * seguía siendo el mismo. Quitarlo de raíz es más seguro que seguir agregando
 * tiempos de espera alrededor de cada llamada nueva que lo necesite.
 *
 * El costo: si de verdad hay dos pestañas renovando el token al mismo tiempo,
 * puede haber una petición de renovación de más. gotrue-js la maneja sin
 * romper la sesión. Para un mesón de biblioteca, con como mucho un par de
 * pestañas abiertas, es un costo mínimo comparado con que nadie pueda entrar.
 */
async function candadoSinBloqueo(_nombre, _tiempoLimiteMs, fn) {
    return await fn();
}

let client = null;
if (!window.supabase) {
    console.error('Error crítico: Supabase no cargado desde el CDN.');
} else {
    client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: { lock: candadoSinBloqueo }
    });
}

export const supabase = client;
