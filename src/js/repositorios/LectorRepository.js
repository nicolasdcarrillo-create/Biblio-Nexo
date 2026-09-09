import { db } from '../modules/db.js';

/**
 * @typedef {Object} Lector
 * @property {number} id
 * @property {string} rut
 * @property {string} nombre
 * @property {string} telefono
 * @property {string} email
 * @property {string} [tipo]
 * @property {string} [apoderado_nombre]
 * @property {string} [apoderado_rut]
 */

/**
 * Repositorio para la entidad Lector.
 * Desacopla la lógica visual de la base de datos y la capa de red.
 */
export const LectorRepository = {
    /**
     * @param {string} busqueda
     * @param {number} pagina
     * @param {number} porPagina
     * @returns {Promise<{lectores: Lector[], total: number}>}
     */
    async obtenerLectores(busqueda = '', pagina = 0, porPagina = 25) {
        return db.obtenerLectores(busqueda, pagina, porPagina);
    },

    /**
     * @param {string} rut
     * @returns {Promise<{lector: Lector, prestamos: any[], advertencia: string|null, offline: boolean}>}
     */
    async estadoLector(rut) {
        return db.estadoLector(rut);
    },

    /**
     * @param {Partial<Lector>} datos
     * @returns {Promise<any>}
     */
    async agregarLector(datos) {
        return db.agregarLector(datos);
    },

    /**
     * @param {number} id
     * @param {Partial<Lector>} cambios
     * @returns {Promise<void>}
     */
    async actualizarLector(id, cambios) {
        return db.actualizarLector(id, cambios);
    },

    /**
     * Operación ARCO - Eliminación (Olvido)
     * @param {number} id
     * @param {string} motivo
     * @returns {Promise<void>}
     */
    async eliminarLector(id, motivo) {
        return db.eliminarLector(id, motivo);
    },

    /**
     * @param {number} id
     * @param {Partial<Lector>} cambios
     * @returns {Promise<void>}
     */
    async actualizarContactoLector(id, cambios) {
        return db.actualizarContactoLector(id, cambios);
    }
};
