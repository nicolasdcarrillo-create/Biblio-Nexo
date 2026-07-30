import { supabase } from './supabase-init.js';
import * as auth from './modules/auth.js';
import uiManager from './modules/ui.js';

function withTimeout(promise, ms, message) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
    ]);
}

/**
 * Detecta si la página se abrió desde el enlace de recuperación del correo.
 * Supabase devuelve el token en el fragmento de la URL (#type=recovery&...).
 */
function esEnlaceDeRecuperacion() {
    const hash = window.location.hash || '';
    return hash.includes('type=recovery');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!supabase) {
            throw new Error('No se pudo inicializar la conexión con Supabase (CDN no disponible).');
        }

        // El enlace del correo trae el token en la URL. Se muestra la pantalla de
        // contraseña nueva antes de cualquier otra cosa, porque en ese momento ya
        // existe una sesión válida y sin esto el usuario entraría directo al panel
        // sin haber cambiado nada.
        if (esEnlaceDeRecuperacion()) {
            uiManager.renderNuevaPassword();
            window.__appBooted = true;
            return;
        }

        // Google y el enlace de correo devuelven la sesión después de que la
        // página cargó, así que hay que escuchar el cambio y no solo consultar
        // una vez al inicio.
        auth.alCambiarSesion(async (evento, sesion) => {
            if (evento === 'PASSWORD_RECOVERY') {
                uiManager.renderNuevaPassword();
                return;
            }
            if (evento === 'SIGNED_IN' && sesion && !uiManager.sesionRenderizada) {
                uiManager.sesionRenderizada = true;
                await uiManager.renderShell(sesion.user);
            }
            if (evento === 'SIGNED_OUT') {
                uiManager.sesionRenderizada = false;
                uiManager.renderLogin();
            }
        });

        const { data: { session }, error } = await withTimeout(
            supabase.auth.getSession(),
            8000,
            'La conexión con el servidor tardó demasiado en responder.'
        );
        if (error) throw error;

        if (session) {
            uiManager.sesionRenderizada = true;
            await uiManager.renderShell(session.user);
        } else {
            uiManager.renderLogin();
        }
        window.__appBooted = true;
    } catch (err) {
        window.__appBooted = true; // evita que el timeout de respaldo pise este mensaje más específico
        if (window.__showCriticalError) {
            window.__showCriticalError(err.message || 'Fallo crítico en el inicio. Verifique su conexión a internet.');
        } else {
            document.body.innerHTML = '<div class="p-10 text-center text-red-600 font-bold">Fallo crítico en el inicio. Verifique la consola de red.</div>';
        }
    }
});
