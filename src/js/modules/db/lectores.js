// Dominio LECTORES — listar, editar, agregar, eliminar, y el bloqueo manual.
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.
//
// agregarLector() vive en js/modules/db.js, no aquí — usa la cola de
// sincronización sin conexión (SyncQueue), igual que reservarLibro()/
// retirarReserva() en db/reservas.js (ver el comentario ahí). A propósito
// NO hay ninguna clave "agregarLector" en este objeto: como el `db` final
// se arma con `{ ...definiciones de db.js, ...lectores }` (spread al
// final), cualquier clave repetida acá pisaría silenciosamente la versión
// con soporte offline de db.js.

import { supabase, conTiempoLimite, ESPERA, limpiarBusqueda, esFuncionInexistente, MENSAJE_TIMEOUT } from './compartido.js';
import persistencia from '../persistencia.js';

export const lectores = {
    async obtenerLectores(busqueda = '', pagina = 0, porPagina = 25) {
        if (!navigator.onLine) {
            return await persistencia.buscarLectoresLocales(busqueda, pagina, porPagina);
        }

        const desplazamiento = pagina * porPagina;
        let q = supabase
            .from('lectores')
            .select('*', { count: 'exact' })
            .order('nombre')
            .range(desplazamiento, desplazamiento + porPagina - 1);

        const limpia = limpiarBusqueda(busqueda);
        if (limpia) q = q.or(`nombre.ilike.%${limpia}%,rut.ilike.%${limpia}%,email.ilike.%${limpia}%`);

        try {
            const { data, error, count } = await conTiempoLimite(q, ESPERA);
            if (error) throw error;
            return { lectores: data || [], total: count || 0 };
        } catch (err) {
            if (err.message === MENSAJE_TIMEOUT || String(err).includes('fetch') || !navigator.onLine) {
                return await persistencia.buscarLectoresLocales(busqueda, pagina, porPagina);
            }
            throw err;
        }
    },

    async actualizarLector(id, cambios) {
        const { error } = await conTiempoLimite(supabase.from('lectores').update({
            nombre: cambios.nombre,
            rut: cambios.rut,
            email: cambios.email,
            telefono: cambios.telefono
        }).eq('id', id), ESPERA);
        if (error) throw new Error(error.code === '23505' ? 'Ese RUT ya pertenece a otro lector.' : 'No se pudo guardar el lector.');
    },

    async eliminarLector(id, motivo = 'Derecho de supresión (ARCO)') {
        const { error } = await conTiempoLimite(supabase.rpc('eliminar_lector', {
            p_id: id,
            p_motivo: motivo
        }), ESPERA);
        if (error) {
            throw new Error(error.message || 'No se pudo eliminar al lector.');
        }
    },

    async bloquearLector(lectorId, bloquear, motivo = null) {
        const { error } = await conTiempoLimite(supabase.rpc('bloquear_lector', {
            p_lector_id: lectorId, p_bloquear: bloquear, p_motivo: motivo
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 006 en Supabase.');
            throw new Error(error.message || 'No se pudo cambiar el bloqueo.');
        }
    },

    /** Lectores actualmente bloqueados a mano. */
    async obtenerBloqueados() {
        const { data, error } = await conTiempoLimite(supabase
            .from('lectores')
            .select('id, nombre, rut, email, telefono, motivo_bloqueo, bloqueado_en')
            .eq('bloqueado_manual', true)
            .order('bloqueado_en', { ascending: false }), ESPERA);
        if (error) {
            if (/does not exist/i.test(error.message || '')) return null;
            throw error;
        }
        return data || [];
    }
};
