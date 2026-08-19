import { supabase } from './supabase-init.js';
import * as auth from './modules/auth.js';
import uiManager from './modules/ui.js';
import registroErrores from './modules/errores.js';
import { conTiempoLimite } from './modules/utilidades.js';

// Mensaje honesto: en el cuelgue que motivó este cambio nunca sale ninguna
// petición de red (se comprobó con navigator.locks.query()), así que hablar
// de "conexión" o "servidor" culparía a la red del usuario sin motivo. Es un
// candado interno del cliente de Supabase que no se soltó a tiempo.
const MENSAJE_ARRANQUE_LENTO =
    'No se pudo iniciar la aplicación a tiempo. Recargue la página; si el problema sigue, ' +
    'cierre esta pestaña y ábrala de nuevo.';

/**
 * Descarta el dato de sesión guardado en este navegador.
 *
 * Se usa solo cuando el arranque se cuelga (ver MENSAJE_ARRANQUE_LENTO): un
 * dato de sesión dañado es la causa más probable de que la inicialización de
 * Supabase quede esperando para siempre. Recargar sin limpiar esto reproduce
 * el mismo cuelgue; limpiarlo fuerza un inicio de sesión limpio, sin perder
 * nada, porque este navegador no guarda ningún otro dato en localStorage.
 */
function limpiarSesionLocal() {
    try {
        Object.keys(localStorage)
            .filter(clave => clave.startsWith('sb-') && clave.endsWith('-auth-token'))
            .forEach(clave => localStorage.removeItem(clave));
    } catch (e) {
        // Si el navegador bloquea localStorage no hay nada que limpiar
    }
}

/**
 * Detecta si la página se abrió desde el enlace de recuperación del correo.
 * Supabase devuelve el token en el fragmento de la URL (#type=recovery&...).
 */
function esEnlaceDeRecuperacion() {
    const hash = window.location.hash || '';
    return hash.includes('type=recovery');
}

/**
 * Registro del service worker (Fase 1.1 — funcionamiento sin conexión).
 *
 * Se registra recién después del evento `load`, no antes: así no compite por
 * ancho de banda con los recursos críticos del primer arranque (Supabase,
 * este mismo módulo). Si falla —navegador viejo sin soporte, o cualquier
 * otro motivo— la aplicación sigue funcionando exactamente igual que antes
 * de este cambio: el registro nunca bloquea el arranque ni el inicio de
 * sesión, solo se deja constancia en el registro de errores propio.
 */
function registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            registroErrores.registrarOperacion('arranque', err);
        });
    });
}
registrarServiceWorker();

document.addEventListener('DOMContentLoaded', async () => {
    // Se activa antes que cualquier otra cosa, incluso antes del try: un
    // cuelgue o error durante el propio arranque —como el candado de
    // sesión— antes no quedaba registrado en Administración → Diagnóstico
    // porque el registro solo se activaba después de iniciar sesión.
    registroErrores.iniciar(() => 'arranque');

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

        const { data: { session }, error } = await conTiempoLimite(
            supabase.auth.getSession(),
            8000,
            MENSAJE_ARRANQUE_LENTO
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
        registroErrores.registrarOperacion('arranque', err);

        if (err?.message === MENSAJE_ARRANQUE_LENTO) {
            limpiarSesionLocal();
        }

        if (window.__showCriticalError) {
            window.__showCriticalError(err.message || 'Fallo crítico en el inicio. Verifique su conexión a internet.');
        } else {
            document.body.innerHTML = '<div class="p-10 text-center text-red-600 font-bold">Fallo crítico en el inicio. Verifique la consola de red.</div>';
        }
    }
});
