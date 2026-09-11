import { db } from '../modules/db.js';

/**
 * Repositorio para la entidad Reserva.
 * Permite la gestión de cola de reservas para los libros prestados.
 */
export const ReservaRepository = {
    /**
     * @param {number} libroId
     * @param {string} lectorRut
     * @returns {Promise<any>}
     */
    async reservarLibro(libroId, lectorRut) {
        return db.reservarLibro(libroId, lectorRut);
    },

    /**
     * @param {number} reservaId
     * @returns {Promise<any>}
     */
    async retirarReserva(reservaId) {
        return db.retirarReserva(reservaId);
    },

    /**
     * @param {number} reservaId
     * @returns {Promise<void>}
     */
    async cancelarReserva(reservaId) {
        return db.cancelarReserva(reservaId);
    },

    /**
     * @param {number} libroId
     * @returns {Promise<any[]>}
     */
    async listarReservas(libroId) {
        return db.listarReservas(libroId);
    },

    /**
     * @returns {Promise<any[]>}
     */
    async obtenerReservasApartadas() {
        return db.obtenerReservasApartadas();
    }
};
