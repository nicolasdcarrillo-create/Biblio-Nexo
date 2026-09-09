// Dominio CUMPLIMIENTO LEY 21.719 — derechos del titular (migración 007).
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const cumplimiento = {
    /**
     * Derecho de acceso y portabilidad: entrega todos los datos personales
     * que la biblioteca tiene sobre un titular, en formato reutilizable.
     */
    async exportarDatosLector(rut) {
        const { data, error } = await conTiempoLimite(supabase.rpc('exportar_datos_lector', { p_rut: rut }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 007 en Supabase.');
            throw new Error(error.message || 'No se pudo exportar los datos.');
        }
        return data;
    },

    /**
     * Derecho de supresión: borra los datos personales conservando el registro
     * estadístico. No es un DELETE porque la Municipalidad debe conservar
     * constancia de su gestión (Ley 20.285 y normas de rendición).
     */
    async anonimizarLector(lectorId, motivo) {
        const { error } = await conTiempoLimite(supabase.rpc('anonimizar_lector', { p_lector_id: lectorId, p_motivo: motivo }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 007 en Supabase.');
            throw new Error(error.message || 'No se pudo suprimir los datos.');
        }
    },

    /** Anonimiza titulares que superaron el plazo de conservación. */
    async purgarDatosAntiguos() {
        const { data, error } = await conTiempoLimite(supabase.rpc('purgar_datos_antiguos'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 007 en Supabase.');
            throw new Error(error.message || 'No se pudo ejecutar la purga.');
        }
        return data ?? 0;
    },

    /** Evidencia de actividad para un reporte de incidente (Ley 21.663). */
    async evidenciaIncidente(desde, hasta) {
        const { data, error } = await conTiempoLimite(supabase.rpc('evidencia_incidente', { p_desde: desde, p_hasta: hasta }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 007 en Supabase.');
            throw new Error(error.message || 'No se pudo extraer la evidencia.');
        }
        return data;
    }
};
