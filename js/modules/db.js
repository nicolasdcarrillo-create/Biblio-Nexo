import { supabase } from '../supabase-init.js';
import { conTiempoLimite } from './utilidades.js';

// Límite normal para una consulta o RPC. Ver utilidades.js: sin esto, una
// llamada colgada deja la pantalla esperando para siempre.
const ESPERA = 15000;
// exportarTodo mueve páginas de hasta 1000 filas: se le da más margen.
const ESPERA_RESPALDO = 25000;

/**
 * Prepara un texto de búsqueda para usarlo dentro de un filtro `or()` de PostgREST.
 *
 * Hace falta porque PostgREST separa las condiciones por coma y usa comillas y
 * paréntesis como sintaxis. Buscar «García, Gabriel» partía el filtro en pedazos
 * y producía una consulta distinta a la pedida (o directamente inválida).
 *
 * Se eliminan los caracteres que forman parte de la sintaxis del filtro y se
 * escapan los comodines de LIKE para que se busquen literalmente.
 */
function limpiarBusqueda(texto) {
    return (texto || '')
        .toString()
        .replace(/[,()"'\\]/g, ' ')   // sintaxis de PostgREST
        .replace(/[%_]/g, '')          // comodines de LIKE
        .trim();
}

/**
 * Fecha de hoy en horario de Chile, en formato YYYY-MM-DD.
 *
 * No se usa toISOString() porque devuelve UTC: en Chile (UTC-3/-4) eso
 * adelanta la fecha desde las 20:00 o 21:00, lo que desfasaba en un día el
 * conteo de préstamos atrasados. Debe coincidir con hoy_chile() en Postgres.
 */
export function hoyEnChile() {
    // en-CA produce el formato YYYY-MM-DD directamente
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

/**
 * Devuelve el desfase horario de Chile para una fecha dada, en formato ±HH:MM.
 * Se calcula por fecha porque Chile cambia entre UTC-4 y UTC-3 con el horario
 * de verano, así que un valor fijo daría resultados incorrectos medio año.
 */
function desfaseChile(fechaISO) {
    const instante = new Date(`${fechaISO}T12:00:00Z`); // mediodía UTC, dentro del día en cualquier caso
    const enUtc = new Date(instante.toLocaleString('en-US', { timeZone: 'UTC' }));
    const enSantiago = new Date(instante.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
    const minutos = Math.round((enSantiago - enUtc) / 60000);
    const signo = minutos <= 0 ? '-' : '+';
    const abs = Math.abs(minutos);
    return `${signo}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/**
 * Detecta el error que devuelve Supabase cuando una función RPC todavía no
 * existe, es decir, cuando falta ejecutar la migración correspondiente.
 * Permite que la aplicación degrade con un mensaje claro en vez de romperse.
 */
function esFuncionInexistente(error) {
    return error?.code === '42883' || error?.code === 'PGRST202' ||
           /function .* does not exist|could not find/i.test(error?.message || '');
}

export const db = {
    async obtenerEstadisticas() {
        try {
            const hoy = hoyEnChile();

            const [libros, lectores, activos, devueltos, vencidos, stockRows] = await conTiempoLimite(Promise.all([
                supabase.from('libros').select('*', { count: 'exact', head: true }),
                supabase.from('lectores').select('*', { count: 'exact', head: true }),
                supabase.from('prestamos').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
                supabase.from('prestamos').select('*', { count: 'exact', head: true }).eq('estado', 'devuelto'),
                supabase.from('prestamos').select('*', { count: 'exact', head: true }).eq('estado', 'activo').lt('fecha_devolucion_esperada', hoy),
                supabase.from('libros').select('stock')
            ]), ESPERA);

            // "En estante" = suma del stock disponible de todos los libros (copias que no están prestadas ahora mismo)
            const enEstante = (stockRows.data || []).reduce((sum, b) => sum + (b.stock || 0), 0);

            return {
                libros: libros.count || 0,
                lectores: lectores.count || 0,
                prestamos: activos.count || 0,
                devueltos: devueltos.count || 0,
                noDevueltos: vencidos.count || 0,
                enEstante
            };
        } catch (e) {
            return { libros: 0, lectores: 0, prestamos: 0, devueltos: 0, noDevueltos: 0, enEstante: 0 };
        }
    },

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
            portada_url: cambios.portada_url || null
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

    async eliminarLibro(id) {
        const { error } = await conTiempoLimite(supabase.from('libros').delete().eq('id', id), ESPERA);
        if (error) throw new Error('No se puede eliminar. Revise si el libro tiene préstamos activos.');
    },

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

    /**
     * Préstamos activos, filtrados y paginados.
     *
     * El filtro y el conteo se hacen en la base de datos, no en el navegador.
     * Antes se traía todo y se contaba en memoria: Supabase corta en 1000 filas
     * en silencio, así que con muchos préstamos los contadores de "Atrasados" y
     * "Por vencer" mostraban números falsos sin ningún aviso.
     *
     * `filtro` puede ser 'todos', 'vencidos' o 'porVencer'.
     */
    async obtenerPrestamos(filtro = 'todos', pagina = 0, porPagina = 25, diasAviso = 3) {
        const hoy = hoyEnChile();
        const limite = new Date(`${hoy}T12:00:00`);
        limite.setDate(limite.getDate() + diasAviso);
        const hastaAviso = limite.toISOString().split('T')[0];

        const campos = 'id, fecha_prestamo, fecha_devolucion_esperada, estado, renovaciones, libros(id, titulo, stock), lectores(id, nombre, rut, email, telefono)';

        const aplicarFiltro = q => {
            if (filtro === 'vencidos') return q.lt('fecha_devolucion_esperada', hoy);
            if (filtro === 'porVencer') return q.gte('fecha_devolucion_esperada', hoy).lte('fecha_devolucion_esperada', hastaAviso);
            return q;
        };

        const desplazamiento = pagina * porPagina;
        let consulta = supabase.from('prestamos')
            .select(campos, { count: 'exact' })
            .eq('estado', 'activo');
        consulta = aplicarFiltro(consulta)
            .order('fecha_devolucion_esperada')
            .range(desplazamiento, desplazamiento + porPagina - 1);

        // Los conteos usan head: true, así que la base de datos devuelve solo el
        // número y no transfiere ninguna fila.
        const contar = f => {
            let q = supabase.from('prestamos')
                .select('id', { count: 'exact', head: true })
                .eq('estado', 'activo');
            if (f === 'vencidos') q = q.lt('fecha_devolucion_esperada', hoy);
            if (f === 'porVencer') q = q.gte('fecha_devolucion_esperada', hoy).lte('fecha_devolucion_esperada', hastaAviso);
            return q;
        };

        const [lista, cTodos, cVencidos, cPorVencer] = await conTiempoLimite(Promise.all([
            consulta, contar('todos'), contar('vencidos'), contar('porVencer')
        ]), ESPERA);

        if (lista.error) throw lista.error;

        return {
            prestamos: lista.data || [],
            total: lista.count || 0,
            conteos: {
                todos: cTodos.count || 0,
                vencidos: cVencidos.count || 0,
                porVencer: cPorVencer.count || 0
            }
        };
    },

    /**
     * Todos los préstamos pendientes de aviso (atrasados y por vencer), sin
     * paginar. Se usa para el envío masivo, donde hace falta la lista completa.
     * Se limita a 500 para no bloquear el navegador con una lista enorme.
     */
    async obtenerPendientesDeAviso(diasAviso = 3) {
        const hoy = hoyEnChile();
        const limite = new Date(`${hoy}T12:00:00`);
        limite.setDate(limite.getDate() + diasAviso);

        const { data, error } = await conTiempoLimite(supabase.from('prestamos')
            .select('id, fecha_devolucion_esperada, renovaciones, libros(id, titulo), lectores(id, nombre, rut, email, telefono)')
            .eq('estado', 'activo')
            .lte('fecha_devolucion_esperada', limite.toISOString().split('T')[0])
            .order('fecha_devolucion_esperada')
            .limit(500), ESPERA);
        if (error) throw error;
        return data || [];
    },

    async registrarPrestamo(libroId, lectorRut) {
        // Usa la función RPC atómica prestar_libro (ver supabase/migrations/001_prestamos_atomicos.sql):
        // el chequeo de stock y el descuento ocurren en una sola transacción con bloqueo de fila,
        // así dos préstamos simultáneos del último ejemplar nunca dejan el stock negativo.
        const { data, error } = await conTiempoLimite(supabase.rpc('prestar_libro', {
            p_libro_id: libroId,
            p_lector_rut: lectorRut
        }), ESPERA);
        if (error) throw new Error(error.message || 'Fallo al registrar préstamo.');
        return data;
    },

    async devolverPrestamo(prestamoId) {
        // Usa la función RPC atómica devolver_prestamo: recalcula el libro y el stock
        // del lado del servidor a partir del préstamo real, sin confiar en valores del cliente.
        const { error } = await conTiempoLimite(supabase.rpc('devolver_prestamo', {
            p_prestamo_id: prestamoId
        }), ESPERA);
        if (error) throw new Error(error.message || 'Error en devolución.');
    },

    /**
     * Extiende el plazo de un préstamo activo (migración 005).
     * El límite de renovaciones y la regla de "no se renueva si está atrasado"
     * se aplican en Postgres, no aquí.
     */
    async renovarPrestamo(prestamoId) {
        const { data, error } = await conTiempoLimite(supabase.rpc('renovar_prestamo', {
            p_prestamo_id: prestamoId
        }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) throw new Error('Falta ejecutar la migración 005 en Supabase para poder renovar.');
            throw new Error(error.message || 'No se pudo renovar el préstamo.');
        }
        return Array.isArray(data) ? data[0] : data;
    },

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
    },

    // ------------------------------------------------------------------
    // MESÓN DE CIRCULACIÓN (migración 006)
    // ------------------------------------------------------------------

    /**
     * Todo lo que hace falta saber al escanear un código: el libro, si está
     * prestado, a quién, con qué RUT y en qué situación está esa persona.
     *
     * Devuelve { libro, prestamos } o null si el código no existe.
     */
    async consultarLibro(codigo) {
        const { data, error } = await conTiempoLimite(supabase.rpc('consultar_libro', { p_codigo: codigo }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) {
                throw new Error('Falta ejecutar la migración 006 en Supabase para usar el mesón.');
            }
            throw new Error(error.message || 'No se pudo consultar el libro.');
        }
        if (!data || data.length === 0) return null;

        const f = data[0];
        const libro = {
            id: f.libro_id, isbn: f.isbn, titulo: f.titulo, autor: f.autor,
            genero: f.genero, ubicacion: f.ubicacion, portada_url: f.portada_url,
            copias_totales: f.copias_totales, stock: f.stock
        };
        // Las filas sin prestamo_id significan "no hay préstamos activos"
        const prestamos = data.filter(r => r.prestamo_id != null).map(r => ({
            id: r.prestamo_id,
            fecha_prestamo: r.fecha_prestamo,
            fecha_devolucion_esperada: r.fecha_devolucion_esperada,
            dias_restantes: r.dias_restantes,
            renovaciones: r.renovaciones,
            lector: {
                id: r.lector_id, nombre: r.lector_nombre, rut: r.lector_rut,
                email: r.lector_email, telefono: r.lector_telefono,
                bloqueado_manual: r.lector_bloqueado, atrasados: r.lector_atrasados
            }
        }));
        return { libro, prestamos };
    },

    /**
     * Situación de un lector antes de prestarle: si existe, cuántos libros
     * tiene, cuántos atrasados, si está bloqueado y si puede pedir prestado.
     */
    async estadoLector(rut) {
        const { data, error } = await conTiempoLimite(supabase.rpc('estado_lector', { p_rut: rut }), ESPERA);
        if (error) {
            if (esFuncionInexistente(error)) {
                throw new Error('Falta ejecutar la migración 006 en Supabase.');
            }
            throw new Error(error.message || 'No se pudo consultar el lector.');
        }
        return Array.isArray(data) ? data[0] : data;
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

    // ------------------------------------------------------------------
    // HERRAMIENTAS DE ADMINISTRACIÓN (migración 006)
    // ------------------------------------------------------------------

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

    // ------------------------------------------------------------------
    // PERFIL DE QUIEN USA EL SISTEMA (migración 008)
    // ------------------------------------------------------------------

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
    },

    /**
     * Estado de las funciones que escriben en la base de datos.
     * Detecta el fallo que dejaba al librero sin poder prestar ni devolver.
     */
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

    // ------------------------------------------------------------------
    // REGISTRO DE ERRORES (migración 009)
    // ------------------------------------------------------------------

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
    },

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
    },

    // ------------------------------------------------------------------
    // CUMPLIMIENTO LEY 21.719 — derechos del titular (migración 007)
    // ------------------------------------------------------------------

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
    },

    /**
     * Reúne todo el movimiento de la biblioteca entre dos fechas (inclusive).
     * Ambas en formato 'YYYY-MM-DD'.
     *
     * Requiere la migración 004 (columnas fecha_prestamo y created_at). Si esas
     * columnas no existen todavía, se devuelve un objeto con `faltaMigracion`
     * en vez de lanzar un error, para que la aplicación siga funcionando y
     * pueda explicarle al usuario qué le falta.
     */
    async obtenerReporte(desde, hasta) {
        const [prestamosRes, devolucionesRes, lectoresRes] = await conTiempoLimite(Promise.all([
            supabase.from('prestamos')
                .select('id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, libros(id, titulo, autor), lectores(id, nombre, rut)')
                .gte('fecha_prestamo', desde)
                .lte('fecha_prestamo', hasta),
            supabase.from('prestamos')
                .select('id, fecha_devolucion_real, fecha_devolucion_esperada, libros(id, titulo)')
                .gte('fecha_devolucion_real', desde)
                .lte('fecha_devolucion_real', hasta),
            supabase.from('lectores')
                .select('id, nombre, rut, created_at')
                // Con el desfase explícito, Postgres no tiene que suponer la zona:
                // el rango cubre exactamente los días de Chile solicitados.
                .gte('created_at', `${desde}T00:00:00${desfaseChile(desde)}`)
                .lte('created_at', `${hasta}T23:59:59${desfaseChile(hasta)}`)
        ]), ESPERA);

        // 42703 = columna inexistente en Postgres
        const errores = [prestamosRes.error, devolucionesRes.error, lectoresRes.error].filter(Boolean);
        const faltaColumna = errores.some(e => e.code === '42703' || /column .* does not exist/i.test(e.message || ''));
        if (faltaColumna) {
            return { faltaMigracion: true };
        }
        if (errores.length) throw new Error(errores[0].message || 'No se pudo generar el reporte.');

        const prestamos = prestamosRes.data || [];
        const devoluciones = devolucionesRes.data || [];
        const nuevosLectores = lectoresRes.data || [];

        // Devoluciones que llegaron después de la fecha comprometida
        const devolucionesAtrasadas = devoluciones.filter(
            d => d.fecha_devolucion_real && d.fecha_devolucion_esperada &&
                 d.fecha_devolucion_real > d.fecha_devolucion_esperada
        ).length;

        // Rankings: se cuentan en memoria porque el volumen de un período es acotado
        const contar = (items, claveFn, etiquetaFn) => {
            const mapa = new Map();
            items.forEach(i => {
                const clave = claveFn(i);
                if (clave == null) return;
                const actual = mapa.get(clave) || { etiqueta: etiquetaFn(i), total: 0 };
                actual.total++;
                mapa.set(clave, actual);
            });
            return [...mapa.values()].sort((a, b) => b.total - a.total).slice(0, 5);
        };

        return {
            faltaMigracion: false,
            desde,
            hasta,
            totalPrestamos: prestamos.length,
            totalDevoluciones: devoluciones.length,
            totalNuevosLectores: nuevosLectores.length,
            devolucionesAtrasadas,
            topLibros: contar(prestamos, p => p.libros?.id, p => p.libros?.titulo || 'Sin título'),
            topLectores: contar(prestamos, p => p.lectores?.id, p => p.lectores?.nombre || 'Sin nombre'),
            prestamos,
            nuevosLectores
        };
    }
};
