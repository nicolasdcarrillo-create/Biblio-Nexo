// Dominio ESCANEO REMOTO SIN SESIÓN — gestión de enlaces (crear, listar,
// revocar), solo para administración. No confundir con js/escaneo-remoto.js,
// que es el script de la propia página que abre quien escanea sin sesión.
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.

import { supabase, conTiempoLimite, ESPERA, esFuncionInexistente } from './compartido.js';

export const enlacesEscaneo = {
    /** Genera un enlace de escaneo remoto. Devuelve {id, token, expira_en}. */
    async crearEnlaceEscaneo(horas = 4) {
        const { data, error } = await conTiempoLimite(supabase.rpc('crear_enlace_escaneo', { p_horas: horas }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo generar el enlace.');
        return data?.[0] || null;
    },

    /** Enlaces de escaneo remoto generados por el personal. Solo administración. */
    async listarEnlacesEscaneo() {
        const { data, error } = await conTiempoLimite(supabase.rpc('listar_enlaces_escaneo'), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) return null;
            throw new Error(error.message || 'No se pudo listar los enlaces.');
        }
        return data || [];
    },

    async revocarEnlaceEscaneo(id) {
        const { error } = await conTiempoLimite(supabase.rpc('revocar_enlace_escaneo', { p_id: id }), ESPERA);
        if (error) throw new Error(error.message || 'No se pudo revocar el enlace.');
    }
};
