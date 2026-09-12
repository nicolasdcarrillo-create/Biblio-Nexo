import { db } from '../modules/db.js';

/**
 * Repositorio para la vista de Reportes.
 * Desacopla reportes.js de db.js directamente.
 */
export const ReportesRepository = {
    /**
     * Obtiene el reporte de movimiento de la biblioteca en un rango de fechas.
     * @param {string} desde Fecha inicio en formato YYYY-MM-DD
     * @param {string} hasta Fecha fin en formato YYYY-MM-DD
     * @returns {Promise<any>}
     */
    async obtenerReporte(desde, hasta) {
        return db.obtenerReporte(desde, hasta);
    },

    /**
     * Exporta todos los datos de la biblioteca en formato JSON para respaldo manual.
     * @returns {Promise<{tablas: Record<string, any[]>}>}
     */
    async exportarTodo() {
        return db.exportarTodo();
    }
};
