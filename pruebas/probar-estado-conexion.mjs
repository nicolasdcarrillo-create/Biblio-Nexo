/**
 * Prueba del indicador de conexión (Fase 1.4 — el último tramo de
 * "funcionamiento sin conexión", ver PROMPT-produccion.md §7).
 *
 * `js/modules/estado-conexion.js` no tiene ninguna lógica propia de
 * sincronización — es "pegamento" entre piezas ya probadas aparte
 * (`persistencia.js` en probar-persistencia.mjs, `SyncQueue` en
 * probar-sync-queue.mjs) y los eventos del navegador. Lo que esta prueba
 * cubre es justo eso: que junte bien las tres señales (en línea/sin
 * conexión, sincronizando, N pendientes) y que avise a quien esté
 * suscrito en el momento correcto, ni antes ni después.
 *
 * Usa fake-indexeddb (para persistencia.js, del que depende db.js) y un
 * Supabase falso mínimo — no hace falta el control fino de
 * probar-sync-queue.mjs, solo lo suficiente para poder encolar una
 * operación y hacer que un reintento tenga éxito o no.
 *
 * Ejecutar:
 *   npm install jsdom fake-indexeddb --no-save
 *   node pruebas/probar-estado-conexion.mjs
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
// Entorno mínimo, con un `window` que de verdad registra y puede disparar
// escuchadores — a diferencia de probar-sync-queue.mjs, aquí SÍ hace falta
// simular "online"/"offline" de verdad, no solo evitar que addEventListener
// lance una excepción.
// ---------------------------------------------------------------------------
const escuchasWindow = {};
globalThis.window = globalThis.window || {};
globalThis.window.addEventListener = (tipo, fn) => {
    (escuchasWindow[tipo] ||= []).push(fn);
};
globalThis.window.innerWidth = 0;
globalThis.window.innerHeight = 0;

function dispararEventoWindow(tipo) {
    (escuchasWindow[tipo] || []).forEach(fn => fn());
}

// ---------------------------------------------------------------------------
// Supabase falso mínimo: solo lo que hace falta para que persistencia.js y
// db.js se importen sin romper, y para poder controlar un reintento exitoso
// o fallido de la cola.
// ---------------------------------------------------------------------------
let proximaRespuestaRpc = { tipo: 'exito' };
function programarRpc(respuesta) { proximaRespuestaRpc = respuesta; }

const clienteFalso = {
    from() {
        return {
            select() { return this; }, eq() { return this; }, gt() { return this; },
            order() { return this; }, limit() { return this; },
            then(resolver) { resolver({ data: [], error: null }); }
        };
    },
    rpc() {
        if (proximaRespuestaRpc.tipo === 'red') {
            return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (proximaRespuestaRpc.tipo === 'rechazo') {
            return Promise.resolve({ data: null, error: { code: 'P0001', message: 'Rechazado.' } });
        }
        return Promise.resolve({ data: null, error: null });
    }
};

globalThis.window.supabase = { createClient: () => clienteFalso };

// ---------------------------------------------------------------------------
// Módulos bajo prueba
// ---------------------------------------------------------------------------
const { default: persistencia } = await import('../js/modules/persistencia.js');
const { colaSync } = await import('../js/modules/db.js');
const { default: registroErrores } = await import('../js/modules/errores.js');
registroErrores.registrarOperacion = () => {}; // silenciado: no es lo que se prueba aquí

const { default: estadoConexion } = await import('../js/modules/estado-conexion.js');

async function vaciarCola() {
    const pendientes = await persistencia.listarOperacionesPendientes();
    for (const op of pendientes) await persistencia.quitarOperacion(op.id);
}

// ---------------------------------------------------------------------------
// 1. iniciar() no explota si se llama más de una vez, y arranca con el
//    estado real de la cola (no "en línea" a ciegas)
// ---------------------------------------------------------------------------
console.log('\n1. iniciar(): estado inicial correcto, idempotente');

estadoConexion.iniciar();
// Nota: db.js ya registra POR SU CUENTA un escuchador de "online" para
// colaSync (ver el final de la clase SyncQueue) — así que aquí ya hay al
// menos ese, más el que acaba de agregar estado-conexion.js. Lo que importa
// comprobar es que una SEGUNDA llamada a iniciar() no agrega otro de más.
const antesOnline = (escuchasWindow.online || []).length;
const antesOffline = (escuchasWindow.offline || []).length;
estadoConexion.iniciar(); // segunda vez: no debe duplicar escuchadores ni romper nada
comprobar('una segunda llamada a iniciar() no agrega otro escuchador de "online" (idempotente)',
    (escuchasWindow.online || []).length === antesOnline, `${(escuchasWindow.online || []).length} vs ${antesOnline}`);
comprobar('tampoco agrega otro de "offline"',
    (escuchasWindow.offline || []).length === antesOffline);

// El primer estado real tarda una vuelta de microtareas en llegar (consulta
// async a colaSync.estado()) — se espera antes de comprobar.
await new Promise(r => setTimeout(r, 20));
comprobar('arranca en línea por defecto (no hay ninguna señal de lo contrario en esta prueba)',
    estadoConexion.obtener().enLinea === true, JSON.stringify(estadoConexion.obtener()));
comprobar('arranca sin nada pendiente (la cola está vacía al empezar)',
    estadoConexion.obtener().pendientes === 0, JSON.stringify(estadoConexion.obtener()));

// ---------------------------------------------------------------------------
// 2. suscribir(): avisa de inmediato con el estado actual
// ---------------------------------------------------------------------------
console.log('\n2. suscribir(): avisa de inmediato, sin esperar al primer cambio');

let ultimoEstado = null;
let llamadas = 0;
const detener = estadoConexion.suscribir(estado => { ultimoEstado = estado; llamadas++; });
comprobar('se llama de inmediato al suscribirse', llamadas === 1);
comprobar('el estado inicial recibido trae las tres señales', 'enLinea' in ultimoEstado && 'sincronizando' in ultimoEstado && 'pendientes' in ultimoEstado);

// ---------------------------------------------------------------------------
// 3. Eventos "online"/"offline" del navegador
// ---------------------------------------------------------------------------
console.log('\n3. Eventos "online"/"offline" del navegador se reflejan de inmediato');

dispararEventoWindow('offline');
comprobar('al perder la conexión, el estado pasa a sin conexión', ultimoEstado.enLinea === false);
comprobar('el suscriptor se enteró sin tener que preguntar (push, no polling)', llamadas === 2);

dispararEventoWindow('online');
comprobar('al recuperar la conexión, el estado vuelve a en línea', ultimoEstado.enLinea === true);

// ---------------------------------------------------------------------------
// 4. Un fallo de red que encola una operación se refleja en "pendientes"
// ---------------------------------------------------------------------------
console.log('\n4. Encolar una operación (Fase 1.3) actualiza "pendientes" sin que nadie pregunte');

await vaciarCola();
llamadas = 0;
programarRpc({ tipo: 'red' });
await colaSync.encolar('prestar_libro', { p_libro_id: 1, p_lector_rut: '11111111-1' }, 'Préstamo de prueba');

comprobar('el indicador se enteró de que hay una operación pendiente', ultimoEstado.pendientes === 1, JSON.stringify(ultimoEstado));
comprobar('avisó al suscriptor sin que nadie hiciera polling', llamadas >= 1);

// ---------------------------------------------------------------------------
// 5. reintentarPendientes(): "sincronizando" pasa a true y vuelve a false
// ---------------------------------------------------------------------------
console.log('\n5. Un reintento exitoso muestra "sincronizando" mientras dura, y limpia "pendientes" al terminar');

const vistos = [];
const detener2 = estadoConexion.suscribir(estado => vistos.push({ ...estado }));
programarRpc({ tipo: 'exito' });
await colaSync.reintentarPendientes();

comprobar('en algún momento del reintento, "sincronizando" estuvo en true',
    vistos.some(e => e.sincronizando === true), JSON.stringify(vistos));
comprobar('al terminar, "sincronizando" volvió a false', ultimoEstado.sincronizando === false);
comprobar('al terminar con éxito, "pendientes" volvió a 0', ultimoEstado.pendientes === 0, JSON.stringify(ultimoEstado));
detener2();

// ---------------------------------------------------------------------------
// 6. Un reintento fallido (rechazo real) también limpia "sincronizando",
//    pero la operación se pierde de la cola con su propio aviso (Fase 1.3,
//    ya probado en probar-sync-queue.mjs) — aquí solo importa que el
//    indicador no se quede "pegado" en sincronizando:true
// ---------------------------------------------------------------------------
console.log('\n6. Un reintento con rechazo real tampoco deja "sincronizando" pegado en true');

await colaSync.encolar('prestar_libro', { p_libro_id: 2, p_lector_rut: '22222222-2' }, 'Préstamo de prueba 2');
programarRpc({ tipo: 'rechazo' });
await colaSync.reintentarPendientes();
comprobar('"sincronizando" queda en false después de un rechazo real (no se traba en "sincronizando" para siempre)',
    ultimoEstado.sincronizando === false, JSON.stringify(ultimoEstado));

await vaciarCola();

// ---------------------------------------------------------------------------
// 7. Des-suscribirse detiene los avisos
// ---------------------------------------------------------------------------
console.log('\n7. Des-suscribirse detiene los avisos futuros');

llamadas = 0;
detener();
dispararEventoWindow('offline');
dispararEventoWindow('online');
comprobar('tras des-suscribirse, ya no llegan más avisos a ese suscriptor', llamadas === 0);

// ---------------------------------------------------------------------------
// 8. Varios suscriptores independientes
// ---------------------------------------------------------------------------
console.log('\n8. Varios suscriptores reciben el mismo estado, cada uno por su cuenta');

let a = null, b = null;
const detenerA = estadoConexion.suscribir(e => { a = e; });
const detenerB = estadoConexion.suscribir(e => { b = e; });
dispararEventoWindow('offline');
comprobar('el primer suscriptor se enteró', a?.enLinea === false);
comprobar('el segundo suscriptor también, de forma independiente', b?.enLinea === false);
dispararEventoWindow('online');
detenerA();
detenerB();

// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(60)}`);
console.log(`${pasadas} comprobaciones correctas, ${fallidas} con fallo`);
process.exit(fallidas === 0 ? 0 : 1);
