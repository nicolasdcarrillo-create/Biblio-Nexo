// Dominio PERFIL — la persona con sesión abierta, y el contacto de un
// lector (migración 008). Extraído de js/modules/db.js el 22 de agosto de
// 2026 (división por dominio, ver pendientes-checklist.md). Sin cambios de
// lógica: es el mismo código, solo movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const perfil = {
    /**
     * Perfil de la persona que tiene la sesión abierta.
     * Devuelve null si falta la migración 008, para que la interfaz pueda
     * explicar qué ejecutar en vez de quedarse en blanco.
     */
    async miPerfil() {
        const { data, error } = await conTiempoLimite(supabase.rpc('mi_perfil'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo cargar tu perfil.');
        }
        return Array.isArray(data) ? data[0] : data;
    },

    /**
     * Guarda el perfil propio. No recibe rol ni id a propósito: los toma de la
     * sesión del lado del servidor, así nadie puede ascenderse de rol desde la
     * consola del navegador.
     */
    async actualizarMiPerfil({ nombre, telefono, cargo }) {
        const { error } = await conTiempoLimite(supabase.rpc('actualizar_mi_perfil', {
            p_nombre: nombre,
            p_telefono: telefono || null,
            p_cargo: cargo || null
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 008 en Supabase.');
            throw new Error(error.message || 'No se pudo guardar tu perfil.');
        }
    },

    /**
     * Corrige nombre, correo y teléfono de un lector. Disponible para todo el
     * personal, no solo administradores: sin teléfono no se puede avisar de una
     * devolución, y quien detecta el dato faltante es quien está en el mesón.
     * El RUT no se toca aquí — es la identidad del lector.
     */
    async actualizarContactoLector(lectorId, { nombre, email, telefono }) {
        const { error } = await conTiempoLimite(supabase.rpc('actualizar_contacto_lector', {
            p_lector_id: lectorId,
            p_nombre: nombre,
            p_email: email || null,
            p_telefono: telefono || null
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 008 en Supabase.');
            throw new Error(error.message || 'No se pudo guardar el contacto del lector.');
        }
    }
};
