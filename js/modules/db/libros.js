// Dominio LIBROS — catálogo: listar, editar, agregar, eliminar.
// Extraído de js/modules/db.js el 22 de agosto de 2026 (división por
// dominio, ver pendientes-checklist.md). Sin cambios de lógica: es el mismo
// código, solo movido.

import { supabase, conTiempoLimite, ESPERA, limpiarBusqueda, esFuncionInexistente } from './compartido.js';

export const libros = {
    /**
     * Lista libros con búsqueda y paginación.
     *
     * Usa el RPC buscar_libros (migración 005), que ignora acentos y devuelve
     * el total de coincidencias en la misma consulta. Si ese RPC todavía no
     * existe, cae automáticamente a una consulta simple para que la aplicación
     * siga funcionando.
     *
     * Devuelve { libros, total }.
     */
    async obtenerLibros(busqueda = '', pagina = 0, porPagina = 25) {
        const desplazamiento = pagina * porPagina;

        const { data, error } = await conTiempoLimite(supabase.rpc('buscar_libros', {
            p_busqueda: busqueda || '',
            p_limite: porPagina,
            p_desplazamiento: desplazamiento
        }), ESPERA);

        if (!error) {
            const libros = data || [];
            return {
                libros,
                total: libros.length ? Number(libros[0].total_coincidencias) : 0
            };
        }

        // Respaldo: la migración 005 no se ha ejecutado todavía.
        // 42883 = la función no existe; PGRST202 = PostgREST no la encuentra.
        if (!esFuncionInexistente(error)) throw error;

        let q = supabase
            .from('libros')
            .select('*', { count: 'exact' })
            .order('titulo')
            .range(desplazamiento, desplazamiento + porPagina - 1);

        const limpia = limpiarBusqueda(busqueda);
        if (limpia) {
            q = q.or(`titulo.ilike.%${limpia}%,autor.ilike.%${limpia}%,isbn.ilike.%${limpia}%`);
        }

        const { data: filas, error: err2, count } = await conTiempoLimite(q, ESPERA);
        if (err2) throw err2;
        return { libros: filas || [], total: count || 0 };
    },

    async actualizarLibro(id, cambios) {
        const { error } = await conTiempoLimite(supabase.from('libros').update({
            titulo: cambios.titulo,
            autor: cambios.autor,
            isbn: cambios.isbn,
            genero: cambios.genero || null,
            ubicacion: cambios.ubicacion || null,
            portada_url: cambios.portada_url || null,
            // null = usa el plazo global (dias_prestamo); 0 = no circula
            // (material de referencia); un número = plazo propio de este
            // libro. Ver 017_plazo_prestamo_por_libro.sql.
            dias_prestamo_override: cambios.diasPrestamoOverride ?? null
            // El número de ejemplares NO se toca aquí: pasa por ajustar_copias,
            // que recalcula las copias disponibles según los préstamos activos.
        }).eq('id', id), ESPERA);
        if (error) throw new Error(error.code === '23505' ? 'Ese ISBN ya pertenece a otro libro.' : 'No se pudo guardar el libro.');
    },

    async agregarLibro(libro) {
        const { error } = await conTiempoLimite(supabase.from('libros').insert([{
            isbn: libro.isbn,
            titulo: libro.titulo,
            autor: libro.autor,
            genero: libro.genero || null,
            ubicacion: libro.ubicacion || null,
            portada_url: libro.portada_url || null,
            copias_totales: libro.stock,
            stock: libro.stock
        }]), ESPERA);
        if (error) throw new Error(error.code === '23505' ? 'El ISBN ya está registrado.' : 'Error al guardar el libro.');
    },

    /**
     * Pasa por el RPC eliminar_libro (migración 020), no un `delete` directo:
     * la función distingue si el rechazo es por un préstamo ACTIVO (el único
     * caso que de verdad bloquea el borrado) de un libro con historial ya
     * devuelto (que sí se puede eliminar — el título y autor quedan
     * archivados en cada préstamo cerrado, para que los reportes de períodos
     * pasados sigan siendo legibles). Antes, cualquier error de un `delete`
     * directo se convertía en el mismo mensaje genérico ("revise si tiene
     * préstamos activos"), aunque el motivo real fuera otro.
     */
    async eliminarLibro(id) {
        const { error } = await conTiempoLimite(supabase.rpc('eliminar_libro', { p_libro_id: id }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 020 en Supabase.');
            throw new Error(error.message || 'No se pudo eliminar el libro.');
        }
    }
};
