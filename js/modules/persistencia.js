import { supabase } from '../supabase-init.js';

/**
 * Persistencia local (Fase 1.2 — funcionamiento sin conexión).
 *
 * Qué hace y qué NO hace:
 *
 *   - Guarda una copia del CATÁLOGO completo en IndexedDB, con sincronización
 *     por delta (`actualizado_en`, migración 011): en vez de traer todos los
 *     libros cada vez, solo pide lo que cambió desde la última sincronización.
 *   - Guarda una copia PARCIAL de los LECTORES — nunca el padrón completo.
 *     Todavía NO permite operar sin conexión (eso es la Fase 1.3, la cola de
 *     sincronización, sin escribir): hoy esta capa solo replica y purga en
 *     segundo plano. La pantalla sigue sin leer de aquí.
 *
 * Por qué los lectores se tratan distinto del catálogo — esto no es una
 * decisión de diseño libre, está exigido por CUMPLIMIENTO-LEGAL.md, sección
 * "9 bis" (riesgo abierto identificado el 30 de julio de 2026, al planificar
 * esta misma fase):
 *
 *   1. NUNCA se hace un volcado completo de "lectores" a este almacén. Un
 *      lector entra a la copia local por una de dos vías, ambas acotadas:
 *      - `guardarLectorConsultado()`: alguien lo buscó por RUT en el mesón
 *        (db.estadoLector). Es exactamente el lector que se necesita a mano
 *        para la Fase 1.3, ni uno más.
 *      - `sincronizarLectoresActivos()`: tiene un préstamo activo en este
 *        momento — es información que YA es visible en la vista Préstamos,
 *        no un dato nuevo expuesto.
 *   2. Todo lector local se purga solo por antigüedad
 *      (`purgarLectoresAntiguos`): si nadie lo vuelve a consultar y no tiene
 *      un préstamo activo (que refresca la marca de consulta cada vez que se
 *      sincroniza), desaparece del disco del equipo del mesón a los 30 días.
 *   3. El derecho de supresión SÍ llega hasta acá (`purgarLectoresEliminados`):
 *      un DELETE de verdad en el servidor no se puede transmitir por marca de
 *      tiempo — la fila ya no existe, no queda nada que traiga la fecha —, así
 *      que se consulta aparte la tabla de lápidas
 *      (`elementos_eliminados`, migración 015) para enterarse de qué se borró
 *      y borrarlo también aquí. Sin esto, alguien que ejerce su derecho de
 *      supresión seguiría con sus datos en el disco del mesón indefinidamente.
 *   4. El service worker (sw.js, Fase 1.1) nunca cachea ninguna respuesta de
 *      Supabase — los datos personales entran a este almacén únicamente por
 *      las dos vías controladas de arriba, nunca de rebote por una caché
 *      genérica de red.
 *
 * Lo que sigue sin resolver, y es responsabilidad de la organización, no del
 * código (documentado igual en CUMPLIMIENTO-LEGAL.md): el disco del equipo
 * del mesón no está cifrado. Sin cifrado de disco y bloqueo de sesión del
 * sistema operativo, cualquiera con acceso físico al computador alcanza esta
 * copia local mientras no se haya purgado.
 */

const NOMBRE_BD = 'biblionexo-local';
const VERSION_BD = 1;

// Cuánto puede vivir un lector en el almacén local sin que nadie lo consulte
// ni tenga un préstamo activo. Es una purga por antigüedad, no un permiso de
// conservación distinto al que ya rige en el servidor (CUMPLIMIENTO-LEGAL.md
// sección 7) — es mucho más corta a propósito: esto es una copia de trabajo
// del mesón, no un registro.
const RETENCION_LECTORES_DIAS = 30;

// Tope de páginas por sincronización, para que un error de lógica no termine
// en un bucle infinito pidiendo la misma página para siempre. Con el tamaño
// de esta biblioteca (cientos de títulos, no cientos de miles), nunca debería
// acercarse a este número.
const TOPE_PAGINAS = 50;
const TAMANO_PAGINA = 500;

let promesaBD = null;

/** Abre (o crea) el almacén local. Memoiza la promesa: dos llamadas seguidas
 *  no abren dos conexiones ni disparan `onupgradeneeded` dos veces. */
function abrir() {
    if (promesaBD) return promesaBD;
    promesaBD = new Promise((resolver, rechazar) => {
        if (typeof indexedDB === 'undefined') {
            rechazar(new Error('Este navegador no soporta almacenamiento local (IndexedDB).'));
            return;
        }
        const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD);
        peticion.onupgradeneeded = () => {
            const bd = peticion.result;
            if (!bd.objectStoreNames.contains('libros')) {
                bd.createObjectStore('libros', { keyPath: 'id' });
            }
            if (!bd.objectStoreNames.contains('lectores')) {
                const almacen = bd.createObjectStore('lectores', { keyPath: 'id' });
                // Para poder purgar por antigüedad sin recorrer todo el almacén.
                almacen.createIndex('consultadoEn', 'consultadoEn');
            }
            if (!bd.objectStoreNames.contains('meta')) {
                bd.createObjectStore('meta', { keyPath: 'clave' });
            }
        };
        peticion.onsuccess = () => resolver(peticion.result);
        peticion.onerror = () => {
            promesaBD = null; // permite reintentar en la próxima llamada
            rechazar(peticion.error || new Error('No se pudo abrir el almacén local.'));
        };
    });
    return promesaBD;
}

/** Envuelve una transacción de un solo almacén en una promesa. */
function conAlmacen(bd, nombre, modo, fn) {
    return new Promise((resolver, rechazar) => {
        const tx = bd.transaction(nombre, modo);
        const almacen = tx.objectStore(nombre);
        let resultado;
        Promise.resolve(fn(almacen))
            .then(r => { resultado = r; })
            .catch(rechazar);
        tx.oncomplete = () => resolver(resultado);
        tx.onerror = () => rechazar(tx.error || new Error(`Fallo en el almacén local "${nombre}".`));
        tx.onabort = () => rechazar(tx.error || new Error(`Transacción abortada en "${nombre}".`));
    });
}

function pedido(peticionIDB) {
    return new Promise((resolver, rechazar) => {
        peticionIDB.onsuccess = () => resolver(peticionIDB.result);
        peticionIDB.onerror = () => rechazar(peticionIDB.error);
    });
}

async function leerMeta(clave) {
    const bd = await abrir();
    const fila = await conAlmacen(bd, 'meta', 'readonly', almacen => pedido(almacen.get(clave)));
    return fila ? fila.valor : null;
}

async function escribirMeta(clave, valor) {
    const bd = await abrir();
    await conAlmacen(bd, 'meta', 'readwrite', almacen => almacen.put({ clave, valor }));
}

async function ponerVarios(nombreAlmacen, filas) {
    if (!filas.length) return;
    const bd = await abrir();
    await conAlmacen(bd, nombreAlmacen, 'readwrite', almacen => {
        filas.forEach(fila => almacen.put(fila));
    });
}

async function borrarVarios(nombreAlmacen, ids) {
    if (!ids.length) return;
    const bd = await abrir();
    await conAlmacen(bd, nombreAlmacen, 'readwrite', almacen => {
        ids.forEach(id => almacen.delete(id));
    });
}

async function obtenerTodos(nombreAlmacen) {
    const bd = await abrir();
    return conAlmacen(bd, nombreAlmacen, 'readonly', almacen => pedido(almacen.getAll()));
}

/** Trae, en páginas, todo lo de `tabla` con `actualizado_en` posterior a
 *  `marca` (o toda la tabla si `marca` es null: primera sincronización). */
async function libroLotesDesde(marca) {
    const filas = [];
    let ultimaMarca = marca;
    for (let pagina = 0; pagina < TOPE_PAGINAS; pagina++) {
        let consulta = supabase.from('libros').select('*').order('actualizado_en', { ascending: true }).limit(TAMANO_PAGINA);
        consulta = marca ? consulta.gt('actualizado_en', ultimaMarca) : consulta;
        const { data, error } = await consulta;
        if (error) throw error;
        if (!data || data.length === 0) break;
        filas.push(...data);
        ultimaMarca = data[data.length - 1].actualizado_en;
        if (data.length < TAMANO_PAGINA) break;
    }
    return { filas, marca: filas.length ? filas[filas.length - 1].actualizado_en : marca };
}

/** Lápidas de `tabla` posteriores a `marca` (o todas si es la primera vez). */
async function eliminadosDesde(tabla, marca) {
    let consulta = supabase.from('elementos_eliminados').select('id, eliminado_en').eq('tabla', tabla).order('eliminado_en', { ascending: true }).limit(2000);
    consulta = marca ? consulta.gt('eliminado_en', marca) : consulta;
    const { data, error } = await consulta;
    if (error) throw error;
    return data || [];
}

class PersistentStorage {
    /**
     * Sincroniza el catálogo completo. Delta por `actualizado_en`: la primera
     * vez trae todo; después, solo lo que cambió. También aplica las lápidas
     * de `libros` (borrados reales), aunque para el catálogo — sin datos
     * personales — es más una prolijidad que un requisito legal.
     *
     * Nunca lanza: sin conexión, o si algo falla a mitad de camino, se
     * conserva la copia que ya había y se reintenta en la próxima llamada.
     * Es sincronización en segundo plano — no debe interrumpir nada.
     */
    async sincronizarLibros() {
        try {
            const marcaCambios = await leerMeta('libros_ultima_sync');
            const { filas, marca } = await libroLotesDesde(marcaCambios);
            await ponerVarios('libros', filas);
            if (marca) await escribirMeta('libros_ultima_sync', marca);

            const marcaBajas = await leerMeta('libros_eliminados_ultima_sync');
            const lapidas = await eliminadosDesde('libros', marcaBajas);
            await borrarVarios('libros', lapidas.map(l => l.id));
            if (lapidas.length) {
                await escribirMeta('libros_eliminados_ultima_sync', lapidas[lapidas.length - 1].eliminado_en);
            }
            return { libros: filas.length, eliminados: lapidas.length };
        } catch (e) {
            return { error: e.message || String(e) };
        }
    }

    /**
     * Guarda (o refresca) un lector recién consultado por RUT en el mesón.
     * Es la única vía "manual" de entrada al almacén de lectores — se llama
     * desde db.js justo después de un `estadoLector()` exitoso, nunca en
     * bloque ni por adelantado.
     *
     * Espera la forma que devuelve la función `estado_lector` (existe,
     * lector_id, nombre, rut, email, telefono, bloqueado_manual,
     * motivo_bloqueo, ...) para no obligar a transformar nada en la llamada.
     */
    async guardarLectorConsultado(estadoLector) {
        if (!estadoLector || estadoLector.existe === false || estadoLector.lector_id == null) return;
        try {
            await ponerVarios('lectores', [{
                id: estadoLector.lector_id,
                nombre: estadoLector.nombre ?? null,
                rut: estadoLector.rut ?? null,
                email: estadoLector.email ?? null,
                telefono: estadoLector.telefono ?? null,
                bloqueadoManual: !!estadoLector.bloqueado_manual,
                motivoBloqueo: estadoLector.motivo_bloqueo ?? null,
                consultadoEn: Date.now()
            }]);
        } catch {
            // Nunca debe interrumpir el flujo de préstamo por esto.
        }
    }

    /**
     * Replica (o refresca) solo a los lectores con un préstamo activo AHORA
     * MISMO — información que ya es visible en la vista Préstamos del mesón,
     * no un dato nuevo expuesto. Al refrescar `consultadoEn`, un lector con
     * préstamo activo nunca se purga por antigüedad mientras lo siga
     * teniendo: la purga y esta sincronización trabajan juntas a propósito.
     */
    async sincronizarLectoresActivos() {
        try {
            const { data, error } = await supabase
                .from('prestamos')
                .select('lectores(id, nombre, rut, email, telefono, bloqueado_manual, motivo_bloqueo)')
                .eq('estado', 'activo')
                .limit(2000);
            if (error) throw error;

            const vistos = new Map();
            for (const fila of data || []) {
                const l = fila.lectores;
                if (l && l.id != null) vistos.set(l.id, l);
            }
            const ahora = Date.now();
            const filas = [...vistos.values()].map(l => ({
                id: l.id,
                nombre: l.nombre ?? null,
                rut: l.rut ?? null,
                email: l.email ?? null,
                telefono: l.telefono ?? null,
                bloqueadoManual: !!l.bloqueado_manual,
                motivoBloqueo: l.motivo_bloqueo ?? null,
                consultadoEn: ahora
            }));
            await ponerVarios('lectores', filas);
            return { lectores: filas.length };
        } catch (e) {
            return { error: e.message || String(e) };
        }
    }

    /**
     * Aplica el derecho de supresión a la copia local: cualquier lector
     * borrado de verdad en el servidor (DELETE, no anonimización) desaparece
     * también de aquí. Es el requisito de CUMPLIMIENTO-LEGAL.md sección
     * "9 bis", punto 1 — no es opcional.
     */
    async purgarLectoresEliminados() {
        try {
            const marca = await leerMeta('lectores_eliminados_ultima_sync');
            const lapidas = await eliminadosDesde('lectores', marca);
            await borrarVarios('lectores', lapidas.map(l => l.id));
            if (lapidas.length) {
                await escribirMeta('lectores_eliminados_ultima_sync', lapidas[lapidas.length - 1].eliminado_en);
            }
            return { eliminados: lapidas.length };
        } catch (e) {
            return { error: e.message || String(e) };
        }
    }

    /**
     * Borra de la copia local a todo lector que nadie consultó ni tuvo un
     * préstamo activo en los últimos `diasRetencion` días. Es el requisito
     * de CUMPLIMIENTO-LEGAL.md sección "9 bis", punto 2 — "no se replica el
     * padrón completo... con purga automática por antigüedad".
     */
    async purgarLectoresAntiguos(diasRetencion = RETENCION_LECTORES_DIAS) {
        try {
            const limite = Date.now() - diasRetencion * 24 * 60 * 60 * 1000;
            const bd = await abrir();
            const vencidos = await conAlmacen(bd, 'lectores', 'readonly', almacen =>
                pedido(almacen.getAll()).then(filas => filas.filter(f => (f.consultadoEn ?? 0) < limite).map(f => f.id))
            );
            await borrarVarios('lectores', vencidos);
            return { purgados: vencidos.length };
        } catch (e) {
            return { error: e.message || String(e) };
        }
    }

    /**
     * Corre todo lo de arriba en el orden correcto. Pensado para llamarse una
     * vez después de iniciar sesión y después, cada cierto tiempo, mientras
     * la pestaña siga abierta (ver el enganche en js/main.js). Nunca lanza:
     * cada paso ya atrapa sus propios errores; esto solo los junta para que
     * quien llama pueda registrar un resumen si quiere.
     */
    async sincronizarTodo() {
        const libros = await this.sincronizarLibros();
        const activos = await this.sincronizarLectoresActivos();
        const bajasLectores = await this.purgarLectoresEliminados();
        const purgados = await this.purgarLectoresAntiguos();
        return { libros, activos, bajasLectores, purgados };
    }

    /** Lectura para quien consuma el almacén (Fase 1.3 en adelante). */
    async obtenerLibrosLocal() {
        return obtenerTodos('libros');
    }

    /** Lectura para quien consuma el almacén (Fase 1.3 en adelante). */
    async obtenerLectoresLocal() {
        return obtenerTodos('lectores');
    }

    /** Diagnóstico simple: cuánto hay guardado y cuándo se sincronizó por
     *  última vez cada cosa. Pensado para un futuro indicador de conexión
     *  (Fase 1.4) y para las propias pruebas de este módulo. */
    async estado() {
        const [libros, lectores, librosUltimaSync, lectoresEliminadosUltimaSync] = await Promise.all([
            obtenerTodos('libros'),
            obtenerTodos('lectores'),
            leerMeta('libros_ultima_sync'),
            leerMeta('lectores_eliminados_ultima_sync')
        ]);
        return {
            librosGuardados: libros.length,
            lectoresGuardados: lectores.length,
            librosUltimaSync,
            lectoresEliminadosUltimaSync
        };
    }
}

export default new PersistentStorage();
