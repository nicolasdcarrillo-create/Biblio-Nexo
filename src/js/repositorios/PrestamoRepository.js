import { db } from '../modules/db.js';

/**
 * Repositorio para la entidad Préstamo.
 * Maneja el ciclo de vida de los préstamos: registro, renovación y devolución.
 */
export const PrestamoRepository = {
    /**
     * @param {string} filtro ('activos', 'historial', 'atrasados', 'por_vencer')
     * @param {number} pagina
     * @param {number} porPagina
     * @param {number} diasAvisoPrevio
     * @returns {Promise<{prestamos: any[], total: number}>}
     */
    async obtenerPrestamos(filtro = 'activos', pagina = 0, porPagina = 25, diasAvisoPrevio = 2) {
        return db.obtenerPrestamos(filtro, pagina, porPagina, diasAvisoPrevio);
    },

    /**
     * @param {number} diasAvisoPrevio
     * @returns {Promise<any[]>}
     */
    async obtenerPendientesDeAviso(diasAvisoPrevio = 2) {
        return db.obtenerPendientesDeAviso(diasAvisoPrevio);
    },

    /**
     * @param {number} libroId
     * @param {string} lectorRut
     * @returns {Promise<any>}
     */
    async registrarPrestamo(libroId, lectorRut) {
        return db.registrarPrestamo(libroId, lectorRut);
    },

    /**
     * @param {number} prestamoId
     * @returns {Promise<any>}
     */
    async devolverPrestamo(prestamoId) {
        return db.devolverPrestamo(prestamoId);
    },

    /**
     * @param {number} prestamoId
     * @returns {Promise<any>}
     */
    async renovarPrestamo(prestamoId) {
        return db.renovarPrestamo(prestamoId);
    }
};
