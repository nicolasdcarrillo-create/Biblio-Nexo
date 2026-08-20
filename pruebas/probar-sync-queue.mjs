/**
 * Prueba de la cola de sincronización (Fase 1.3 — funcionamiento sin
 * conexión): la clase SyncQueue en js/modules/db.js, y el respaldo sin
 * conexión de estadoLector()/consultarLibro() que se apoya en
 * js/modules/persistencia.js (Fase 1.2).
 *
 * Cubre lo que pide PROMPT-produccion.md §7 (1.3):
 *   1. Un fallo de RED en préstamo/devolución/renovación se encola, nunca se
 *      pierde ni se muestra como un error normal.
 *   2. Un rechazo REAL del servidor (con código) se lanza tal cual — nunca
 *      se encola algo que el servidor ya dijo que no.
 *   3. La cola reproduce la MISMA llamada que se habría hecho con conexión
 *      (sin reinventar ninguna lógica de negocio — esa la revalida el
 *      servidor al reintentar).
 *   4. Reintento con espera exponencial, y un aviso visible (nunca en
 *      silencio) tanto en un rechazo real al reintentar como al acumular
 *      varios fallos de red seguidos.
 *   5. estadoLector()/consultarLibro() caen a la copia local (Fase 1.2)
 *      cuando la red falla, sin inventar nunca un "no existe" que no se
 *      pueda comprobar sin conexión.
 *
 * No sustituye a una prueba en un navegador real: usa fake-indexeddb (para
 * persistencia.js) y un cliente de Supabase falso hecho a mano, con control
 * total sobre qué responde cada llamada RPC.
 *
 * Ejecutar:
 *   npm install jsdom fake-indexeddb --no-save   (una sola vez, las dos
 *                                                  juntas — ver LEEME.md)
 *   node pruebas/probar-sync-queue.mjs
 */

import 'fake-indexeddb/auto';

// ---------------------------------------------------------------------------
// Registro de resultados
// ---------------------------------------------------------------------------
let pasadas = 0, fallidas = 0;
const comprobar = (descripcion, condicion, detalle = '') => {
    if (condicion) {
        pasadas++;
        console.log(`  ✓ ${descripcion}`);
    } else {
        fallidas++;
        console.log(`  ✗ ${descripcion}${detalle ? ' — ' + detalle : ''}`);
    }
};

// ---------------------------------------------------------------------------
// Entorno mínimo: db.js y errores.js esperan que exista `window`
// (supabase-init.js lo lee directo, sin `typeof window`), y db.js se
// suscribe a `window.addEventListener('online', ...)` al importarse.
// ---------------------------------------------------------------------------
globalThis.window = globalThis.window || {};
globalThis.window.addEventListener = () => {}; // no hace falta que haga nada real aquí
globalThis.window.innerWidth = 0;
globalThis.window.innerHeight = 0;
// Node ya trae un `navigator` global propio (de solo lectura, no se puede
// reemplazar) — no hace falta: errores.js solo lo usa para un diagnóstico
// informativo que no participa en ninguna de estas pruebas.

// ---------------------------------------------------------------------------
// Cliente de Supabase falso.
//
//   .from(tabla)  — mismo "query builder" mínimo que usa
//                   probar-persistencia.mjs, para que persistencia.js pueda
//                   sincronizar el catálogo cuando hace falta sembrar datos.
//   .rpc(nombre)  — con control total: cada llamada consume el próximo
//                   "paso" programado con programarRpc(), o repite el
//                   último si no queda ninguno. Registra cada llamada en
//                   `llamadasRpc` para poder comprobar que la cola reproduce
//                   EXACTAMENTE los mismos parámetros al reintentar.
// ---------------------------------------------------------------------------
const tablas = { libros: [], elementos_eliminados: [], prestamos: [] };

class ConsultaFalsa {
    constructor(filas) {
        this._filas = filas;
        this._filtros = [];
        this._orden = null;
    }
    select() { return this; }
    eq(col, val) { this._filtros.push(f => f[col] === val); return this; }
    gt(col, val) { this._filtros.push(f => f[col] > val); return this; }
    order(col, { ascending = true } = {}) { this._orden = { col, ascending }; return this; }
    limit() { return this; }
    then(resolver, rechazar) {
        try {
            let filas = this._filas.filter(f => this._filtros.every(fn => fn(f)));
            if (this._orden) {
                const { col, ascending } = this._orden;
                filas = [...filas].sort((a, b) => {
                    if (a[col] === b[col]) return 0;
                    return (a[col] > b[col] ? 1 : -1) * (ascending ? 1 : -1);
                });
            }
            resolver({ data: filas, error: null });
        } catch (e) {
            rechazar(e);
        }
    }
}

const llamadasRpc = [];
const comportamientos = {}; // nombre de la función RPC -> lista de pasos pendientes

/** Programa qué debe responder la próxima (o próximas) llamada(s) a este RPC. */
function programarRpc(nombre, pasos) {
    comportamientos[nombre] = [...pasos];
}

function proximoPaso(nombre) {
    const pasos = comportamientos[nombre];
    if (!pasos || pasos.length === 0) return { tipo: 'exito', data: null };
    // Si queda uno solo, se repite (para probar fallos de red persistentes
    // sin tener que programar decenas de pasos idénticos a mano).
    return pasos.length > 1 ? pasos.shift() : pasos[0];
}

const clienteFalso = {
    from(nombre) {
        return new ConsultaFalsa(tablas[nombre] || []);
    },
    rpc(nombre, params) {
        llamadasRpc.push({ nombre, params });
        const paso = proximoPaso(nombre);
        if (paso.tipo === 'red') {
            // Simula un fetch que nunca llegó a hablar con el servidor: una
            // excepción SIN .code, exactamente como distingue esFalloDeRed().
            return Promise.reject(paso.error || new TypeError('Failed to fetch'));
        }
        if (paso.tipo === 'sin_codigo') {
            // Simula el otro camino hacia el mismo diagnóstico: un {error}
            // devuelto (no lanzado) pero sin .code — también debe tratarse
            // como fallo de red, no como rechazo del servidor.
            return Promise.resolve({ data: null, error: { message: paso.mensaje || 'Error sin código.' } });
        }
        if (paso.tipo === 'rechazo') {
            // Rechazo REAL del servidor: siempre con .code, como cualquier
            // error genuino de Postgres/PostgREST.
            return Promise.resolve({
                data: null,
                error: { code: paso.code || 'P0001', message: paso.mensaje || 'Rechazado por el servidor.' }
            });
        }
        return Promise.resolve({ data: paso.data ?? null, error: null });
    }
};

globalThis.window.supabase = { createClient: () => clienteFalso };

// ---------------------------------------------------------------------------
// Módulos bajo prueba (importados recién ahora: supabase-init.js lee
// window.supabase al importarse, así que el mock tiene que existir antes).
// ---------------------------------------------------------------------------
const { default: persistencia } = await import('../js/modules/persistencia.js');
const { default: registroErrores } = await import('../js/modules/errores.js');
const { db, colaSync } = await import('../js/modules/db.js');

// Se reemplaza por un espía: así se puede comprobar que un rechazo real (o
// varios fallos de red seguidos) deja un aviso VISIBLE, sin depender de que
// el registro de errores real llegue a hablar con ningún servidor.
const avisos = [];
registroErrores.registrarOperacion = (accion, error) => {
    avisos.push({ accion, mensaje: error?.message || String(error) });
};

async function vaciarCola() {
    const pendientes = await persistencia.listarOperacionesPendientes();
    for (const op of pendientes) await persistencia.quitarOperacion(op.id);
}

// ---------------------------------------------------------------------------
// 1. Fallo de red al ejecutar una escritura: se encola, no se pierde
// ---------------------------------------------------------------------------
console.log('\n1. Fallo de red al ejecutar una escritura: se encola, no se pierde');

programarRpc('prestar_libro', [{ tipo: 'red' }]);
let resultado = await db.registrarPrestamo(5, '11111111-1');
comprobar('registrarPrestamo() devuelve encolado:true cuando la red falla',
    resultado?.encolado === true, JSON.stringify(resultado));
comprobar('trae un mensaje explicando que se completará sola',
    typeof resultado.mensaje === 'string' && resultado.mensaje.length > 0);

let pendientes = await persistencia.listarOperacionesPendientes();
comprobar('la operación quedó guardada en la cola', pendientes.length === 1, JSON.stringify(pendientes));
comprobar('se guardó con los MISMOS parámetros que se habrían mandado con conexión',
    pendientes[0]?.tipo === 'prestar_libro' &&
    pendientes[0]?.params?.p_libro_id === 5 &&
    pendientes[0]?.params?.p_lector_rut === '11111111-1',
    JSON.stringify(pendientes[0]));

await vaciarCola();

// ---------------------------------------------------------------------------
// 2. Rechazo real del servidor: se lanza, NUNCA se encola
// ---------------------------------------------------------------------------
console.log('\n2. Rechazo real del servidor (con código): se lanza, nunca se encola');

programarRpc('prestar_libro', [{ tipo: 'rechazo', code: '23514', mensaje: 'No hay ejemplares disponibles.' }]);
let lanzo = null;
try {
    await db.registrarPrestamo(6, '22222222-2');
} catch (e) {
    lanzo = e;
}
comprobar('un rechazo real lanza el error del servidor tal cual',
    lanzo?.message === 'No hay ejemplares disponibles.', String(lanzo));
pendientes = await persistencia.listarOperacionesPendientes();
comprobar('un rechazo real no deja nada en la cola', pendientes.length === 0, JSON.stringify(pendientes));

// ---------------------------------------------------------------------------
// 3. Un error devuelto sin código también cuenta como fallo de red
// ---------------------------------------------------------------------------
console.log('\n3. Un {error} devuelto sin código (no una excepción) también se trata como fallo de red');

programarRpc('devolver_prestamo', [{ tipo: 'sin_codigo', mensaje: 'Se cortó a mitad de camino.' }]);
resultado = await db.devolverPrestamo(77);
comprobar('devolverPrestamo() también encola cuando el error viene sin .code',
    resultado?.encolado === true, JSON.stringify(resultado));

await vaciarCola();

// ---------------------------------------------------------------------------
// 4. Falta la migración: mensaje específico, tampoco se encola
// ---------------------------------------------------------------------------
console.log('\n4. Falta la migración (función inexistente): mensaje específico, tampoco se encola');

programarRpc('renovar_prestamo', [{ tipo: 'rechazo', code: '42883', mensaje: 'function renovar_prestamo does not exist' }]);
lanzo = null;
try {
    await db.renovarPrestamo(9);
} catch (e) {
    lanzo = e;
}
comprobar('función inexistente da el mensaje de "falta la migración", no el genérico ni el de encolado',
    /migración 005/.test(lanzo?.message || ''), String(lanzo));
pendientes = await persistencia.listarOperacionesPendientes();
comprobar('tampoco se encola cuando lo que falta es la migración', pendientes.length === 0, JSON.stringify(pendientes));

// ---------------------------------------------------------------------------
// 5. Reintento exitoso: al reconectar, se reproduce y sale de la cola
// ---------------------------------------------------------------------------
console.log('\n5. Reintento exitoso: al "reconectar" la operación se reproduce y sale de la cola');

const idReplay = await persistencia.encolarOperacion('prestar_libro',
    { p_libro_id: 8, p_lector_rut: '33333333-3' }, 'Préstamo de prueba');
programarRpc('prestar_libro', [{ tipo: 'exito', data: [{ prestamo_id: 123 }] }]);
llamadasRpc.length = 0;
await colaSync.reintentarPendientes();

pendientes = await persistencia.listarOperacionesPendientes();
comprobar('la operación sale de la cola cuando el reintento tiene éxito',
    !pendientes.some(o => o.id === idReplay), JSON.stringify(pendientes));
comprobar('el reintento llamó al MISMO rpc con los MISMOS parámetros que se habrían usado con conexión ' +
    '(la cola no reinventa la lógica de negocio, solo repite la llamada)',
    llamadasRpc.some(l => l.nombre === 'prestar_libro' && l.params.p_libro_id === 8 && l.params.p_lector_rut === '33333333-3'),
    JSON.stringify(llamadasRpc));

// ---------------------------------------------------------------------------
// 6. Rechazo real al reintentar: sale de la cola, y queda un aviso visible
// ---------------------------------------------------------------------------
console.log('\n6. Rechazo real al reintentar: se saca de la cola y se avisa (nunca en silencio)');

const idFalla = await persistencia.encolarOperacion('devolver_prestamo',
    { p_prestamo_id: 55 }, 'Devolución de prueba');
programarRpc('devolver_prestamo', [{ tipo: 'rechazo', code: '23514', mensaje: 'El préstamo ya estaba devuelto.' }]);
avisos.length = 0;
await colaSync.reintentarPendientes();

pendientes = await persistencia.listarOperacionesPendientes();
comprobar('un rechazo real al reintentar saca la operación de la cola (no tiene sentido reintentar para ' +
    'siempre algo que el servidor ya rechazó de verdad)',
    !pendientes.some(o => o.id === idFalla), JSON.stringify(pendientes));
comprobar('queda un aviso visible en el registro de errores propio, nunca se pierde en silencio',
    avisos.some(a => a.accion === 'sincronizacion' && /rechazada al sincronizar/.test(a.mensaje)),
    JSON.stringify(avisos));

// ---------------------------------------------------------------------------
// 7. Fallo de red persistente: espera exponencial y aviso al quinto intento
// ---------------------------------------------------------------------------
console.log('\n7. Fallo de red persistente al reintentar: espera exponencial, aviso al quinto intento');

const idBackoff = await persistencia.encolarOperacion('renovar_prestamo',
    { p_prestamo_id: 66 }, 'Renovación de prueba');
programarRpc('renovar_prestamo', [{ tipo: 'red' }]); // un solo paso: se repite en cada intento
avisos.length = 0;

// 30 s, 1 min, 2 min, 4 min, 8 min — duplica en cada intento, tal como
// documenta REINTENTO_BASE_MS/REINTENTO_MAX_MS en db.js.
const esperasEsperadas = [30000, 60000, 120000, 240000, 480000];
for (let i = 0; i < 5; i++) {
    // Se fuerza el turno a "ahora" para no depender de temporizadores reales
    // de hasta 8 minutos en una prueba automatizada.
    await persistencia.actualizarOperacion(idBackoff, { proximoIntentoEn: Date.now() });
    const antes = Date.now();
    await colaSync.reintentarPendientes();
    const [op] = (await persistencia.listarOperacionesPendientes()).filter(o => o.id === idBackoff);
    comprobar(`intento ${i + 1}: sigue en cola (fallo de red: se reintenta, no se pierde)`, !!op);
    if (op) {
        const delta = op.proximoIntentoEn - antes;
        comprobar(`intento ${i + 1}: la próxima espera es ~${esperasEsperadas[i] / 1000}s (backoff exponencial)`,
            Math.abs(delta - esperasEsperadas[i]) < 3000, `delta=${delta}ms`);
        comprobar(`intento ${i + 1}: el contador de intentos avanzó a ${i + 1}`,
            op.intentos === i + 1, `intentos=${op.intentos}`);
    }
}
comprobar('al quinto intento seguido sin poder sincronizar, queda un aviso (sigue en cola, pero ya es visible)',
    avisos.some(a => a.accion === 'sincronizacion' && /5 intentos/.test(a.mensaje)), JSON.stringify(avisos));

await vaciarCola();

// ---------------------------------------------------------------------------
// 8. estadoLector(): respaldo sin conexión con la copia local (Fase 1.2)
// ---------------------------------------------------------------------------
console.log('\n8. estadoLector() cae a la copia local cuando la red falla');

await persistencia.guardarLectorConsultado({
    existe: true, lector_id: 50, nombre: 'Lector Offline', rut: '55555555-5',
    email: 'off@x.cl', telefono: '+56955555555', bloqueado_manual: false, motivo_bloqueo: null
});

programarRpc('estado_lector', [{ tipo: 'red' }]);
const estadoOffline = await db.estadoLector('55555555-5');
comprobar('con la red caída y el lector ya en la copia local, estadoLector() responde igual (offline:true)',
    estadoOffline?.existe === true && estadoOffline?.offline === true && estadoOffline?.lector_id === 50,
    JSON.stringify(estadoOffline));
comprobar('puede_prestar se calcula de forma conservadora, solo por el bloqueo manual ' +
    '(no hay forma de revisar préstamos atrasados sin conexión)',
    estadoOffline?.puede_prestar === true);

programarRpc('estado_lector', [{ tipo: 'red' }]);
lanzo = null;
try {
    await db.estadoLector('99999999-9'); // nunca se guardó localmente
} catch (e) {
    lanzo = e;
}
comprobar('un lector que nunca se guardó localmente lanza un error claro en vez de existe:false ' +
    '(evita el flujo de "lector nuevo" y un posible duplicado al reconectar)',
    lanzo instanceof Error && /copia local/.test(lanzo.message), String(lanzo));

await persistencia.guardarLectorConsultado({
    existe: true, lector_id: 51, nombre: 'Lector Bloqueado', rut: '66666666-6',
    email: null, telefono: null, bloqueado_manual: true, motivo_bloqueo: 'Libro perdido'
});
programarRpc('estado_lector', [{ tipo: 'red' }]);
const estadoBloqueado = await db.estadoLector('66666666-6');
comprobar('un lector bloqueado manualmente sigue bloqueado sin conexión (el único dato local confiable)',
    estadoBloqueado?.puede_prestar === false && /Libro perdido/.test(estadoBloqueado?.motivo_rechazo || ''),
    JSON.stringify(estadoBloqueado));

// ---------------------------------------------------------------------------
// 9. consultarLibro(): respaldo sin conexión con el catálogo local
// ---------------------------------------------------------------------------
console.log('\n9. consultarLibro() cae a la copia local cuando la red falla');

tablas.libros = [
    { id: 40, isbn: '999888', titulo: 'Libro de prueba offline', autor: 'Autora Test',
      stock: 2, copias_totales: 2, actualizado_en: '2026-08-10T00:00:00Z' }
];
await persistencia.sincronizarLibros();

programarRpc('consultar_libro', [{ tipo: 'red' }]);
const consultaOffline = await db.consultarLibro('999888');
comprobar('con la red caída, un libro ya replicado se puede consultar igual (offline:true, sin préstamos)',
    consultaOffline?.libro?.id === 40 && consultaOffline?.offline === true &&
    Array.isArray(consultaOffline?.prestamos) && consultaOffline.prestamos.length === 0,
    JSON.stringify(consultaOffline));

programarRpc('consultar_libro', [{ tipo: 'red' }]);
lanzo = null;
try {
    await db.consultarLibro('codigo-que-no-existe-en-ningun-lado');
} catch (e) {
    lanzo = e;
}
comprobar('un código que no está en la copia local da un error claro en vez de ofrecer darlo de alta a ciegas',
    lanzo instanceof Error && /copia local/.test(lanzo.message), String(lanzo));

// ---------------------------------------------------------------------------
// 10. colaSync.estado(): diagnóstico para un futuro indicador (Fase 1.4)
// ---------------------------------------------------------------------------
console.log('\n10. colaSync.estado(): diagnóstico');

await vaciarCola();
let estadoCola = await colaSync.estado();
comprobar('sin nada pendiente, reporta 0', estadoCola.pendientes === 0, JSON.stringify(estadoCola));

await persistencia.encolarOperacion('prestar_libro', { p_libro_id: 1, p_lector_rut: '11111111-1' }, 'Diagnóstico');
estadoCola = await colaSync.estado();
comprobar('con una operación en cola, reporta 1', estadoCola.pendientes === 1, JSON.stringify(estadoCola));

await vaciarCola();

// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(60)}`);
console.log(`${pasadas} comprobaciones correctas, ${fallidas} con fallo`);
process.exit(fallidas === 0 ? 0 : 1);
