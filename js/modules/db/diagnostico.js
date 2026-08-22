// Dominio DIAGNÓSTICO — los autodiagnósticos que ve la administración
// (consolidación de funciones, circulación, RLS) y la auditoría. Extraído
// de js/modules/db.js el 22 de agosto de 2026 (división por dominio, ver
// pendientes-checklist.md). Sin cambios de lógica: es el mismo código, solo
// movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const diagnostico = {
    /**
     * Compara las funciones instaladas contra el manifiesto de la migración 010.
     * Detecta las tres formas de deriva: una función que falta, una que perdió
     * el security definer, y una duplicada por firma.
     */
    async verificarDefiniciones() {
        const { data, error } = await conTiempoLimite(supabase.rpc('verificar_definiciones'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo verificar las definiciones.');
        }
        return data || [];
    },

    async verificarCirculacion() {
        const { data, error } = await conTiempoLimite(supabase.rpc('verificar_circulacion'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo verificar la circulación.');
        }
        return data || [];
    },

    /** Estado de las políticas RLS de las tablas con datos personales. */
    async verificarRls() {
        const { data, error } = await conTiempoLimite(supabase.rpc('verificar_rls'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo verificar RLS.');
        }
        return data || [];
    },

    /**
     * Últimos movimientos registrados por los triggers de auditoría (migración 005).
     * Devuelve null si la tabla todavía no existe.
     */
    async obtenerAuditoria(limite = 50) {
        const { data, error } = await conTiempoLimite(supabase
            .from('auditoria')
            .select('id, tabla, registro_id, accion, usuario_email, created_at')
            .order('created_at', { ascending: false })
            .limit(limite), ESPERA);
        if (error) {
            const noExiste = error.code === '42P01' || /does not exist|could not find/i.test(error.message || '');
            if (noExiste) return null;
            throw error;
        }
        return data || [];
    }
};
