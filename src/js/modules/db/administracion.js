// Dominio ADMINISTRACIÓN — inventario y parámetros del sistema.
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const administracion = {
    /** Ajusta el total de ejemplares y recalcula las copias disponibles. */
    async ajustarCopias(libroId, copiasTotales) {
        const { data, error } = await conTiempoLimite(supabase.rpc('ajustar_copias', {
            p_libro_id: libroId, p_copias_totales: copiasTotales
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 006 en Supabase.');
            throw new Error(error.message || 'No se pudo ajustar los ejemplares.');
        }
        return Array.isArray(data) ? data[0] : data;
    },

    /** Libros cuyo inventario no cuadra. Devuelve null si falta la migración. */
    async revisarInventario() {
        const { data, error } = await conTiempoLimite(supabase.rpc('revisar_inventario'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo revisar el inventario.');
        }
        return data || [];
    },

    async corregirInventario(libroId) {
        const { data, error } = await conTiempoLimite(supabase.rpc('corregir_inventario', { p_libro_id: libroId }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo corregir el inventario.');
        return Array.isArray(data) ? data[0] : data;
    },

    /** Parámetros del sistema, ahora definidos en la base de datos. */
    async obtenerParametros() {
        const { data, error } = await conTiempoLimite(supabase.from('parametros').select('clave, valor, descripcion').order('clave'), ESPERA);
        if (error) {
            if (/does not exist/i.test(error.message || '')) return null;
            throw error;
        }
        return data || [];
    },

    async actualizarParametro(clave, valor) {
        const { error } = await conTiempoLimite(supabase.from('parametros')
            .update({ valor: String(valor), actualizado_en: new Date().toISOString() })
            .eq('clave', clave), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo guardar el parámetro.');
    }
};
