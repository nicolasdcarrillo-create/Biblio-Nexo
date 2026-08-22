// Dominio RESPALDOS — exportación manual completa y el estado del respaldo
// automático (migración 018). Extraído de js/modules/db.js el 22 de agosto
// de 2026 (división por dominio, ver pendientes-checklist.md). Sin cambios
// de lógica: es el mismo código, solo movido.

import { supabase, conTiempoLimite, ESPERA, ESPERA_RESPALDO, esFuncionInexistente } from './compartido.js';

export const respaldos = {
    /**
     * Descarga una copia completa de las tablas, para respaldo.
     * Se pagina de a 1000 filas porque ese es el tope por consulta de Supabase:
     * pedir todo de una vez devolvería silenciosamente un resultado incompleto.
     */
    async exportarTodo() {
        const tablas = ['libros', 'lectores', 'prestamos'];
        const respaldo = { generado: new Date().toISOString(), version: 1, tablas: {} };

        for (const tabla of tablas) {
            const filas = [];
            let desde = 0;
            const bloque = 1000;
            // Se repite hasta que una página vuelva incompleta, señal de que se acabó
            for (;;) {
                const { data, error } = await conTiempoLimite(supabase
                    .from(tabla)
                    .select('*')
                    .range(desde, desde + bloque - 1), ESPERA_RESPALDO);
                if (error) throw new Error(`No se pudo respaldar la tabla ${tabla}: ${error.message}`);
                filas.push(...(data || []));
                if (!data || data.length < bloque) break;
                desde += bloque;
            }
            respaldo.tablas[tabla] = filas;
        }
        return respaldo;
    },

    /** Últimas corridas del respaldo automático. Devuelve [] si falta la migración 018. */
    async obtenerRespaldos(limite = 5) {
        const { data, error } = await conTiempoLimite(
            supabase.from('respaldos_log').select('*').order('ejecutado_en', { ascending: false }).limit(limite),
            ESPERA
        );
        if (error) {
            if (error.code === '42P01' || esFuncionInexistente(error)) return [];
            throw new Error(error.message || 'No se pudo consultar el estado de los respaldos.');
        }
        return data || [];
    }
};
