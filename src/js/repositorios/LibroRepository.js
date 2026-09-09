import { db } from '../modules/db.js';

/**
 * @typedef {Object} Libro
 * @property {number} id
 * @property {string} isbn
 * @property {string} titulo
 * @property {string} autor
 * @property {string} [genero]
 * @property {string} [ubicacion]
 * @property {number} stock
 * @property {number} copias_disponibles
 * @property {string} [portada_url]
 * @property {number} [dias_prestamo_override]
 */

/**
 * Repositorio para la entidad Libro.
 * Desacopla la lógica visual de la fuente de datos subyacente.
 * Mantiene la interfaz consistente independientemente de si los datos
 * vienen de Supabase, IndexedDB o una API REST futura.
 */
export const LibroRepository = {
    /**
     * @param {string} busqueda
     * @param {number} pagina
     * @param {number} porPagina
     * @returns {Promise<{libros: Libro[], total: number}>}
     */
    async obtenerLibros(busqueda = '', pagina = 0, porPagina = 25) {
        return db.obtenerLibros(busqueda, pagina, porPagina);
    },

    /**
     * @param {string} codigo (ISBN o ID interno)
     * @returns {Promise<{libro: Libro, prestamos: any[], offline: boolean}>}
     */
    async consultarLibro(codigo) {
        return db.consultarLibro(codigo);
    },

    /**
     * @param {Partial<Libro>} datos
     * @returns {Promise<any>}
     */
    async agregarLibro(datos) {
        return db.agregarLibro(datos);
    },

    /**
     * @param {number} id
     * @param {Partial<Libro>} cambios
     * @returns {Promise<void>}
     */
    async actualizarLibro(id, cambios) {
        return db.actualizarLibro(id, cambios);
    },

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async eliminarLibro(id) {
        return db.eliminarLibro(id);
    },

    /**
     * @returns {Promise<any[]>}
     */
    async listarLibrosEliminados() {
        return db.listarLibrosEliminados();
    },

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async restaurarLibro(id) {
        return db.restaurarLibro(id);
    },

    /**
     * @param {number} id
     * @param {number} totalCopias
     * @returns {Promise<void>}
     */
    async ajustarCopias(id, totalCopias) {
        return db.ajustarCopias(id, totalCopias);
    }
};
