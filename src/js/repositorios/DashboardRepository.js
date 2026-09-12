import { db } from '../modules/db.js';

/**
 * Repositorio para la vista Dashboard.
 * Centraliza todas las consultas de estadisticas y estado general
 * de la biblioteca, desacoplando dashboard.js de db.js directamente.
 */
export const DashboardRepository = {
    /**
     * Obtiene las estadisticas generales del sistema para las tarjetas del dashboard.
     * @returns {Promise<{libros: number, lectores: number, prestamos: number, devueltos: number, noDevueltos: number, enEstante: number}>}
     */
    async obtenerEstadisticas() {
        return db.obtenerEstadisticas();
    },

    /**
     * Obtiene todas las reservas en estado "apartada" (libro esperando retiro).
     * Util para mostrar alertas en el dashboard.
     * @returns {Promise<any[]>}
     */
    async obtenerReservasApartadas() {
        return db.obtenerReservasApartadas();
    }
};
