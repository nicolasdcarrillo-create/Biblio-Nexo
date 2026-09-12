import { db } from '../modules/db.js';

/**
 * Repositorio para la gestion de perfiles de usuario y sesion.
 * Desacopla perfil.js y ui-base.js de db.js directamente.
 */
export const UsuarioRepository = {
    /**
     * Obtiene el perfil del usuario actualmente autenticado.
     * @returns {Promise<any>}
     */
    async miPerfil() {
        return db.miPerfil();
    },

    /**
     * Actualiza los datos del perfil del usuario autenticado.
     * @param {{ nombre?: string, cargo?: string, telefono?: string }} datos
     * @returns {Promise<void>}
     */
    async actualizarMiPerfil(datos) {
        return db.actualizarMiPerfil(datos);
    },

    /**
     * Obtiene los parametros de configuracion del sistema (plazo de prestamo, etc.).
     * @returns {Promise<{clave: string, valor: string}[]>}
     */
    async obtenerParametros() {
        return db.obtenerParametros();
    }
};
