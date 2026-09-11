// Dominio RESERVAS — fila de espera de un título sin ejemplares disponibles
// (022_reservas.sql). reservarLibro()/retirarReserva() viven en js/modules/db.js,
// no aquí: son tan urgentes en el mesón como prestar/devolver, y siguen el
// mismo patrón de SyncQueue (sin conexión, se encolan y se reintentan solas)
// — ver el comentario al principio de db.js. cancelarReserva() y
// listarReservas() son menos urgentes (no pasan por el mesón sin conexión),
// así que siguen el patrón más simple del resto de los dominios: si la
// migración 022 todavía no se ejecutó, devuelven null en vez de encolarse.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const reservas = {
    /**
     * Trae todas las reservas que ya tienen un libro apartado (esperando retiro en mesón).
     * Útil para alertar en el dashboard.
     */
    async obtenerReservasApartadas() {
        const { data, error } = await conTiempoLimite(
            supabase.rpc('listar_reservas', { p_libro_id: null })
        ).catch(() => ({ data: null, error: null })); // Ignora si la rpc falla
        
        if (error || !data) return [];
        return data.filter(r => r.estado === 'apartada');
    },

    /**
     * El lector desiste, o el personal la cancela por otro motivo. Si la
     * reserva ya tenía un ejemplar apartado, ese ejemplar pasa a quien sigue
     * en la fila o vuelve a stock general (ver cancelar_reserva() en
     * 010_consolidacion.sql) — todo eso lo resuelve el servidor, aquí solo
     * se llama al RPC.
     */
    async cancelarReserva(reservaId) {
        const { error } = await conTiempoLimite(supabase.rpc('cancelar_reserva', {
            p_reserva_id: reservaId
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 022 en Supabase para poder cancelar una reserva.');
            throw new Error(error.message || 'No se pudo cancelar la reserva.');
        }
    },

    /**
     * Lista las reservas vigentes (o, con `incluirHistorial`, también las
     * cumplidas/canceladas/expiradas) de un libro puntual, o de todos si no
     * se pasa `libroId`. Para la pestaña "Reservas" de Administración y para
     * mostrar la fila de espera en el mesón / escaneo remoto.
     *
     * Devuelve `null` si la migración 022 no se ha ejecutado (mismo patrón
     * que el resto de `db.*`, para que la pantalla explique qué falta en vez
     * de mostrar un error genérico).
     */
    async listarReservas(libroId = null, incluirHistorial = false) {
        const { data, error } = await conTiempoLimite(supabase.rpc('listar_reservas', {
            p_libro_id: libroId,
            p_incluir_historial: incluirHistorial
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudieron listar las reservas.');
        }
        return data || [];
    }
};
