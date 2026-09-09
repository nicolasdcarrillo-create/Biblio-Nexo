// Dominio PERSONAL — cuentas de acceso al sistema (migración 008 y la
// invitación por correo). Extraído de js/modules/db.js el 22 de agosto de
// 2026 (división por dominio, ver pendientes-checklist.md). Sin cambios de
// lógica: es el mismo código, solo movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const personal = {
    /** Personal con acceso al sistema. Devuelve null si falta la migración. */
    async listarPersonal() {
        const { data, error } = await conTiempoLimite(supabase.rpc('listar_personal'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo listar el personal.');
        }
        return data || [];
    },

    async asignarRol(usuarioId, rol) {
        const { error } = await conTiempoLimite(supabase.rpc('asignar_rol', { p_usuario_id: usuarioId, p_rol: rol }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo cambiar el rol.');
    },

    /** Elimina por completo la cuenta de otra persona del personal (perfil + acceso). */
    async eliminarPersonal(usuarioId) {
        const { error } = await conTiempoLimite(supabase.rpc('eliminar_personal', { p_usuario_id: usuarioId }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo eliminar la cuenta.');
    },

    /**
     * Invita a una persona nueva por correo (Edge Function `invitar-personal`),
     * ya con su rol asignado. Reemplaza el flujo anterior, que exigía entrar al
     * panel de Supabase (Authentication → Users) para crear la cuenta a mano.
     */
    async invitarPersonal(email, rol) {
        const { data, error } = await conTiempoLimite(
            supabase.functions.invoke('invitar-personal', { body: { email, rol } }),
            ESPERA
        );
        if (error) {
            // FunctionsHttpError trae el cuerpo de la respuesta (con el mensaje
            // real) en error.context; sin eso, el mensaje genérico del SDK
            // ("Edge Function returned a non-2xx status code") no dice nada.
            let mensaje = error.message;
            try {
                const cuerpo = await error.context?.json?.();
                if (cuerpo?.error) mensaje = cuerpo.error;
            } catch { /* sin cuerpo JSON legible: se usa el mensaje genérico */ }
            throw new Error(mensaje || 'No se pudo enviar la invitación.');
        }
        if (data?.error) throw new Error(data.error);
        return data;
    }
};
