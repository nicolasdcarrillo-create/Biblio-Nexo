import { db } from '../modules/db.js';

/**
 * Repositorio para Enlaces de Escaneo Remoto (Pistola de código de barras virtual).
 */
export const EscaneoRepository = {
    /**
     * @param {number} horasValidez
     * @returns {Promise<any>}
     */
    async crearEnlaceEscaneo(horasValidez) {
        return db.crearEnlaceEscaneo(horasValidez);
    },

    /**
     * @param {string} id
     * @returns {Promise<void>}
     */
    async revocarEnlaceEscaneo(id) {
        return db.revocarEnlaceEscaneo(id);
    }
};
