/**
 * Prueba de js/modules/persistencia.js — la copia local en IndexedDB de la
 * Fase 1.2 (funcionamiento sin conexión).
 *
 * No sustituye a una prueba en un navegador real, pero cubre exactamente lo
 * que CUMPLIMIENTO-LEGAL.md exige para esta fase, sección "9 bis":
 *   1. El catálogo se replica entero, por delta.
 *   2. Los lectores NUNCA entran en bloque — solo consultados o con préstamo
 *      activo.
 *   3. Un lector borrado de verdad en el servidor desaparece también de acá
 *      (la tabla de lápidas, migración 015).
 *   4. Un lector que nadie consulta ni tiene préstamo activo se purga solo,
 *      por antigüedad.
 *
 * Usa fake-indexeddb (IndexedDB en memoria, sin navegador) y un cliente de
 * Supabase falso hecho a mano — no jsdom, este módulo no toca el DOM.
 *
 * Ejecutar:
 *   npm install jsdom fake-indexeddb --no-save   (una sola vez; las dos
 *                                                  juntas: instalarlas por
 *                                                  separado hace que npm
 *                                                  desinstale la que no se
 *                                                  pidió, al no haber
 *                                                  package.json que las fije)
 *   node pruebas/probar-persistencia.mjs
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
// Cliente de Supabase falso: un "query builder" mínimo, suficiente para lo
// que persistencia.js realmente encadena (select/eq/gt/order/limit) y
// resoluble con `await` porque implementa `then()`.
// ---------------------------------------------------------------------------
const tablas = { libros: [], elementos_eliminados: [], prestamos: [] };
const erroresSimulados = {}; // tabla -> Error, para probar el camino de fallo

class ConsultaFalsa {
    constructor(filas) {
        this._filas = filas;
        this._filtros = [];
        this._orden = null;
        this._limite = null;
        this._error = null;
    }
    select() { return this; }
    eq(col, val) {
        this._filtros.push(f => (col === 'estado' ? f[col] === val : (f[col] === val)));
        return this;
    }
    gt(col, val) { this._filtros.push(f => f[col] > val); return this; }
    order(col, { ascending = true } = {}) { this._orden = { col, ascending }; return this; }
    limit() { return this; } // el tope no importa para lo que se prueba aquí
    then(resolver, rechazar) {
        try {
            if (this._error) { resolver({ data: null, error: this._error }); return; }
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

globalThis.window = globalThis.window || {};
globalThis.window.supabase = {
    createClient: () => ({
        from(nombre) {
            const filas = tablas[nombre] || [];
            const consulta = new ConsultaFalsa(filas);
            consulta._error = erroresSimulados[nombre] || null;
            return consulta;
        }
    })
};

const { default: persistencia } = await import('../js/modules/persistencia.js');

// ---------------------------------------------------------------------------
// 1. Catálogo: replicación completa y delta por actualizado_en
// ---------------------------------------------------------------------------
console.log('\n1. Catálogo: replicación completa y delta');

tablas.libros = [
    { id: 1, titulo: 'La Araucana', isbn: '111', stock: 2, actualizado_en: '2026-08-01T10:00:00Z' },
    { id: 2, titulo: 'Sub Terra', isbn: '222', stock: 1, actualizado_en: '2026-08-01T11:00:00Z' }
];

let r = await persistencia.sincronizarLibros();
comprobar('la primera sincronización trae todo el catálogo', r.libros === 2, JSON.stringify(r));

let locales = await persistencia.obtenerLibrosLocal();
comprobar('los dos libros quedaron en el almacén local', locales.length === 2, `salieron ${locales.length}`);

// Delta: se agrega un libro nuevo, más reciente que la marca guardada
tablas.libros.push({ id: 3, titulo: 'Martín Rivas', isbn: '333', stock: 3, actualizado_en: '2026-08-02T09:00:00Z' });

r = await persistencia.sincronizarLibros();
comprobar('la segunda sincronización solo trae lo nuevo (delta)', r.libros === 1, JSON.stringify(r));

locales = await persistencia.obtenerLibrosLocal();
comprobar('el catálogo local ahora tiene los tres libros (sin perder los anteriores)',
    locales.length === 3, `salieron ${locales.length}`);

// Lápida: se borra el libro 1 en el servidor
tablas.elementos_eliminados.push({ tabla: 'libros', id: 1, eliminado_en: '2026-08-02T10:00:00Z' });

r = await persistencia.sincronizarLibros();
comprobar('la lápida del libro borrado se detecta', r.eliminados === 1, JSON.stringify(r));

locales = await persistencia.obtenerLibrosLocal();
comprobar('el libro borrado en el servidor desaparece de la copia local',
    !locales.some(l => l.id === 1), `sigue: ${JSON.stringify(locales.map(l => l.id))}`);
comprobar('los libros que siguen vigentes no se tocaron',
    locales.some(l => l.id === 2) && locales.some(l => l.id === 3));

// ---------------------------------------------------------------------------
// 2. Lectores: solo entran por las dos vías permitidas, nunca en bloque
// ---------------------------------------------------------------------------
console.log('\n2. Lectores: nunca un volcado completo, solo consultados o con préstamo activo');

await persistencia.guardarLectorConsultado({
    existe: true, lector_id: 10, nombre: 'Ana Painecura', rut: '11111111-1',
    email: 'ana@correo.cl', telefono: '+56911111111', bloqueado_manual: false, motivo_bloqueo: null
});

let lectoresLocales = await persistencia.obtenerLectoresLocal();
comprobar('un lector consultado por RUT queda en el almacén local',
    lectoresLocales.some(l => l.id === 10 && l.nombre === 'Ana Painecura'));

const antesDeIgnorar = (await persistencia.obtenerLectoresLocal()).length;
await persistencia.guardarLectorConsultado({ existe: false, rut: '99999999-9' });
lectoresLocales = await persistencia.obtenerLectoresLocal();
comprobar('un RUT que no existe NO se guarda (no hay lector_id real que guardar)',
    lectoresLocales.length === antesDeIgnorar, `salieron ${lectoresLocales.length}`);

// Lectores con préstamo activo: se replican por esta vía, no por un volcado
tablas.prestamos = [
    { id: 500, estado: 'activo', lectores: { id: 11, nombre: 'Beno Huenchumán', rut: '22222222-2', email: 'b@x.cl', telefono: '+56922222222', bloqueado_manual: false, motivo_bloqueo: null } },
    { id: 501, estado: 'activo', lectores: { id: 11, nombre: 'Beno Huenchumán', rut: '22222222-2', email: 'b@x.cl', telefono: '+56922222222', bloqueado_manual: false, motivo_bloqueo: null } }, // mismo lector, dos préstamos
    { id: 502, estado: 'devuelto', lectores: { id: 12, nombre: 'No Debería Aparecer', rut: '33333333-3', email: 'c@x.cl', telefono: '+56933333333', bloqueado_manual: false, motivo_bloqueo: null } }
];

r = await persistencia.sincronizarLectoresActivos();
comprobar('sincronizarLectoresActivos() deduplica lectores con más de un préstamo activo',
    r.lectores === 1, JSON.stringify(r));

lectoresLocales = await persistencia.obtenerLectoresLocal();
comprobar('el lector con préstamo activo queda replicado',
    lectoresLocales.some(l => l.id === 11));
comprobar('un lector con préstamo YA DEVUELTO no se replica por esta vía (no está "activo")',
    !lectoresLocales.some(l => l.id === 12));
comprobar('el padrón completo nunca se volcó: solo están los lectores tocados en esta prueba',
    lectoresLocales.every(l => [10, 11].includes(l.id)), JSON.stringify(lectoresLocales.map(l => l.id)));

// ---------------------------------------------------------------------------
// 3. Derecho de supresión: una lápida de lector borra la copia local
// ---------------------------------------------------------------------------
console.log('\n3. Derecho de supresión: la lápida del servidor purga la copia local');

tablas.elementos_eliminados.push({ tabla: 'lectores', id: 10, eliminado_en: '2026-08-02T12:00:00Z' });

r = await persistencia.purgarLectoresEliminados();
comprobar('purgarLectoresEliminados() detecta la lápida', r.eliminados === 1, JSON.stringify(r));

lectoresLocales = await persistencia.obtenerLectoresLocal();
comprobar('el lector borrado en el servidor (derecho de supresión) desaparece de la copia local',
    !lectoresLocales.some(l => l.id === 10), `sigue: ${JSON.stringify(lectoresLocales.map(l => l.id))}`);
comprobar('un lector que sigue existiendo en el servidor no se toca',
    lectoresLocales.some(l => l.id === 11));

// Reaplicar la misma sincronización no debe volver a "encontrar" la lápida
// ya procesada (la marca de meta avanzó) — protege contra reprocesar de más.
r = await persistencia.purgarLectoresEliminados();
comprobar('una lápida ya procesada no se vuelve a contar en la siguiente pasada',
    r.eliminados === 0, JSON.stringify(r));

// ---------------------------------------------------------------------------
// 4. Purga por antigüedad: nadie lo consultó, no tiene préstamo activo
// ---------------------------------------------------------------------------
console.log('\n4. Purga por antigüedad (el requisito de "no se replica el padrón completo")');

// Se guarda un lector "viejo": se manipula directamente el almacén (con el
// mismo indexedDB global que usa persistencia.js) para simular que hace más
// de 30 días que nadie lo consulta ni tiene préstamo activo — persistencia.js
// no expone ningún atajo para retroceder el reloj, y no debería.
await new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open('biblionexo-local', 1);
    peticion.onsuccess = () => {
        const bd = peticion.result;
        const tx = bd.transaction('lectores', 'readwrite');
        tx.objectStore('lectores').put({
            id: 99, nombre: 'Lector Antiguo', rut: '44444444-4',
            consultadoEn: Date.now() - 40 * 24 * 60 * 60 * 1000 // 40 días atrás
        });
        tx.oncomplete = resolver;
        tx.onerror = () => rechazar(tx.error);
    };
    peticion.onerror = () => rechazar(peticion.error);
});

r = await persistencia.purgarLectoresAntiguos(30);
comprobar('se purga exactamente un lector vencido', r.purgados === 1, JSON.stringify(r));

lectoresLocales = await persistencia.obtenerLectoresLocal();
comprobar('el lector de hace 40 días ya no está', !lectoresLocales.some(l => l.id === 99));
comprobar('un lector consultado recientemente (dentro de los 30 días) NO se purga',
    lectoresLocales.some(l => l.id === 11));

// ---------------------------------------------------------------------------
// 5. sincronizarTodo(): nunca lanza, ni con la red caída
// ---------------------------------------------------------------------------
console.log('\n5. sincronizarTodo() es best-effort: nunca interrumpe nada, ni sin conexión');

erroresSimulados.libros = new Error('Failed to fetch');
let lanzo = false;
try {
    r = await persistencia.sincronizarTodo();
} catch {
    lanzo = true;
}
comprobar('un fallo de red en un paso no hace que sincronizarTodo() lance una excepción', !lanzo);
comprobar('el resumen deja ver qué paso falló, sin ocultarlo',
    !!(r && r.libros && r.libros.error), JSON.stringify(r && r.libros));
delete erroresSimulados.libros;

// ---------------------------------------------------------------------------
// 6. estado(): diagnóstico simple, útil para un futuro indicador (Fase 1.4)
// ---------------------------------------------------------------------------
console.log('\n6. estado(): diagnóstico');

const diag = await persistencia.estado();
comprobar('reporta cuántos libros hay guardados', typeof diag.librosGuardados === 'number' && diag.librosGuardados > 0);
comprobar('reporta cuántos lectores hay guardados', typeof diag.lectoresGuardados === 'number');
comprobar('reporta la última marca de sincronización del catálogo', !!diag.librosUltimaSync);

// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(60)}`);
console.log(`${pasadas} comprobaciones correctas, ${fallidas} con fallo`);
process.exit(fallidas === 0 ? 0 : 1);
