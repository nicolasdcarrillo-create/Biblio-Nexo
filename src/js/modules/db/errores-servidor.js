// Dominio REGISTRO DE ERRORES (migración 009) — el panel de errores que ve
// la administración. No confundir con js/modules/errores.js
// (`registroErrores`), que es quien los CREA desde el navegador; este
// archivo es solo la lectura/gestión del lado del servidor.
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const erroresServidor = {
    /** Resumen para el panel. Devuelve null si falta la migración. */
    async resumenErrores() {
        const { data, error } = await conTiempoLimite(supabase.rpc('resumen_errores'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo leer el registro de errores.');
        }
        return Array.isArray(data) ? data[0] : data;
    },

    async listarErrores(limite = 100, soloNuevos = false) {
        const { data, error } = await conTiempoLimite(supabase.rpc('listar_errores', {
            p_limite: limite, p_solo_nuevos: soloNuevos
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo leer el registro de errores.');
        }
        return data || [];
    },

    /** Marca uno como revisado, o todos si no se indica cuál. */
    async marcarErrorVisto(id = null) {
        const { error } = await conTiempoLimite(supabase.rpc('marcar_error_visto', { p_id: id }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo marcar el error.');
    },

    async purgarErrores(dias = 90) {
        const { data, error } = await conTiempoLimite(supabase.rpc('purgar_errores', { p_dias: dias }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo purgar el registro.');
        return data ?? 0;
    }
};
