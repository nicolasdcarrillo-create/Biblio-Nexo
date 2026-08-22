// Dominio LECTORES — listar, editar, agregar, eliminar, y el bloqueo manual.
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.

import { supabase, conTiempoLimite, ESPERA, limpiarBusqueda, esFuncionInexistente } from './compartido.js';

export const lectores = {
    async obtenerLectores(busqueda = '', pagina = 0, porPagina = 25) {
        const desplazamiento = pagina * porPagina;
        let q = supabase
            .from('lectores')
            .select('*', { count: 'exact' })
            .order('nombre')
            .range(desplazamiento, desplazamiento + porPagina - 1);

        const limpia = limpiarBusqueda(busqueda);
        if (limpia) q = q.or(`nombre.ilike.%${limpia}%,rut.ilike.%${limpia}%,email.ilike.%${limpia}%`);

        const { data, error, count } = await conTiempoLimite(q, ESPERA);
        if (error) throw error;
        return { lectores: data || [], total: count || 0 };
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

    async agregarLector(lector) {
        // Se listan los campos explícitamente para no enviar propiedades
        // inesperadas a la base de datos.
        const { error } = await conTiempoLimite(supabase.from('lectores').insert([{
            rut: lector.rut,
            nombre: lector.nombre,
            email: lector.email,
            telefono: lector.telefono,
            // Trazabilidad del consentimiento, exigida por la Ley 21.719
            consentimiento_fecha: lector.consentimiento_fecha || null,
            consentimiento_version: lector.consentimiento_version || null,
            es_menor: lector.es_menor || false,
            apoderado_nombre: lector.apoderado_nombre || null,
            apoderado_rut: lector.apoderado_rut || null
        }]), ESPERA);
        if (error) throw new Error(error.code === '23505' ? 'El RUT ya está registrado.' : 'Error al guardar lector.');
    },

    async eliminarLector(id) {
        const { error } = await conTiempoLimite(supabase.from('lectores').delete().eq('id', id), ESPERA);
        if (error) throw new Error('No se puede eliminar. El lector tiene historial en el sistema.');
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
