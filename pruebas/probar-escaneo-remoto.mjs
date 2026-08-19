/**
 * Banco de pruebas de escaneo-remoto.js — la página del enlace SIN sesión
 * (ver ui-base.js, showQrRemotoModal, y 010_consolidacion.sql, sección
 * «ESCANEO REMOTO SIN SESIÓN»).
 *
 * Aparte de probar-vistas.mjs a propósito: esta página no pasa por
 * supabase-init.js ni por el resto de la aplicación con sesión — habla
 * directo con la API REST de Supabase (fetch a /rest/v1/rpc/...), así que el
 * doble que hace falta aquí es distinto (fetch simulado, no un cliente de
 * Supabase simulado).
 *
 * Uso:  node pruebas/probar-escaneo-remoto.mjs
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let pasadas = 0, fallidas = 0;
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
async function prueba(desc, fn) {
  try {
    await fn();
    pasadas++;
    console.log(`  ✓ ${desc}`);
  } catch (e) {
    fallidas++;
    console.log(`  ✗ ${desc} — ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Estado en memoria del "servidor" simulado: una sola tabla de enlaces y una
// de libros, suficiente para ejercitar validar_enlace_escaneo() y
// agregar_libro_remoto() sin necesitar Postgres de verdad (eso ya lo hace
// pruebas/probar-migraciones.py, contra SQL real).
// ---------------------------------------------------------------------------
const ENLACE_VALIDO = { token: 'token-valido-de-prueba', expira_en: '2026-12-31T23:00:00Z' };
const LIBRO_EXISTENTE = { isbn: '9789561117', titulo: 'Subterra', autor: 'Baldomero Lillo', stock: 3, copias_totales: 3 };
const libros = [{ ...LIBRO_EXISTENTE }];

function respuestaRpc(nombre, cuerpo) {
  if (nombre === 'validar_enlace_escaneo') {
    if (cuerpo.p_token === ENLACE_VALIDO.token) {
      return { ok: true, datos: [{ valido: true, motivo: null, expira_en: ENLACE_VALIDO.expira_en }] };
    }
    return { ok: true, datos: [{ valido: false, motivo: 'Este enlace no es válido.', expira_en: null }] };
  }
  if (nombre === 'agregar_libro_remoto') {
    if (cuerpo.p_token !== ENLACE_VALIDO.token) {
      return { ok: false, datos: { message: 'Este enlace no es válido o ya expiró. Pide uno nuevo.' } };
    }
    const existente = libros.find(l => l.isbn === cuerpo.p_isbn);
    if (existente) {
      const suma = cuerpo.p_stock ?? 1;
      existente.stock += suma;
      existente.copias_totales += suma;
      return { ok: true, datos: [{ estado: 'incrementado', libro_id: 1, isbn: existente.isbn, titulo: existente.titulo, autor: existente.autor, stock: existente.stock, copias_totales: existente.copias_totales }] };
    }
    if (!cuerpo.p_titulo) {
      return { ok: true, datos: [{ estado: 'falta_info', libro_id: null, isbn: cuerpo.p_isbn, titulo: null, autor: null, stock: null, copias_totales: null }] };
    }
    const nuevo = { isbn: cuerpo.p_isbn, titulo: cuerpo.p_titulo, autor: cuerpo.p_autor || null, stock: cuerpo.p_stock ?? 1, copias_totales: cuerpo.p_stock ?? 1 };
    libros.push(nuevo);
    return { ok: true, datos: [{ estado: 'creado', libro_id: libros.length, ...nuevo }] };
  }
  return { ok: false, datos: { message: `RPC no simulada: ${nombre}` } };
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'biblionexo-escaneo-remoto-'));
try {

fs.cpSync(RAIZ, tmp, { recursive: true });
const importDesdeTmp = ruta => import(pathToFileURL(path.join(tmp, ruta)));
const { CONFIG } = await importDesdeTmp('js/config.js');

function crearDom(query) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><body><main id="escaneo-remoto-app"></main></body></html>`,
    { url: `https://biblionexo.test/escaneo-remoto.html${query || ''}`, pretendToBeVisual: true }
  );
  global.window = dom.window;
  global.document = dom.window.document;
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
  global.HTMLElement = dom.window.HTMLElement;
  global.AudioContext = undefined; // Scanner._pitido() debe degradar sin sonido
  return dom;
}

function mockFetch({ openLibraryOk = true, openLibraryDatos = {} } = {}) {
  global.fetch = async (url, opciones) => {
    const texto = String(url);
    if (texto.startsWith(CONFIG.SUPABASE_URL)) {
      const nombre = texto.split('/rpc/')[1];
      const cuerpo = JSON.parse(opciones.body || '{}');
      const { ok, datos } = respuestaRpc(nombre, cuerpo);
      return { ok, json: async () => datos };
    }
    if (texto.includes('openlibrary.org')) {
      return { ok: openLibraryOk, json: async () => openLibraryDatos };
    }
    throw new Error(`fetch no esperado: ${texto}`);
  };
}

// ---------------------------------------------------------------------------

console.log('\n=== Enlace inválido o faltante ===');

await prueba('sin ?token= en la URL, muestra un error claro y no la cámara', async () => {
  crearDom('');
  mockFetch();
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();
  const texto = document.getElementById('escaneo-remoto-app').textContent;
  assert(/Falta el código del enlace/.test(texto), `no avisó del token faltante: ${texto.slice(0, 150)}`);
  assert(!document.getElementById('er-start'), 'no debería ofrecer la cámara sin un enlace válido');
});

await prueba('con un token inventado, muestra el motivo que da el servidor', async () => {
  crearDom('?token=token-que-no-existe');
  mockFetch();
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();
  const texto = document.getElementById('escaneo-remoto-app').textContent;
  assert(/Este enlace no es válido/.test(texto), `no mostró el motivo del servidor: ${texto.slice(0, 150)}`);
});

console.log('\n=== Enlace válido: escaneo y alta rápida ===');

await prueba('con un token válido, muestra la pantalla de escaneo y cuándo vence', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch();
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();
  assert(document.getElementById('er-start'), 'no ofreció iniciar la cámara');
  assert(document.getElementById('er-manual'), 'no ofreció la entrada manual del ISBN');
  const texto = document.getElementById('escaneo-remoto-app').textContent;
  assert(/vence/i.test(texto), 'no muestra cuándo vence el enlace');
  // "sin iniciar sesión" es justo lo que la página SÍ debe decir; lo que no
  // debe aparecer es una invitación a hacerlo (ni un campo de contraseña).
  assert(!/debes iniciar sesión|inicia sesión|contraseña/i.test(texto),
    'no debería pedir iniciar sesión en ningún momento');
  assert(!document.querySelector('input[type="password"]'), 'no debería haber ningún campo de contraseña');
});

await prueba('escanear un ISBN que ya existe suma ejemplares de inmediato', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch();
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();

  const antesStock = libros.find(l => l.isbn === LIBRO_EXISTENTE.isbn).stock;
  document.getElementById('er-manual').value = LIBRO_EXISTENTE.isbn;
  document.getElementById('er-buscar').click();
  await new Promise(r => setTimeout(r, 30));

  const resultado = document.getElementById('er-resultado').textContent;
  assert(/Se repuso/.test(resultado), `no confirmó la reposición: ${resultado}`);
  const despuesStock = libros.find(l => l.isbn === LIBRO_EXISTENTE.isbn).stock;
  assert(despuesStock === antesStock + 1, `el stock no subió: antes=${antesStock} después=${despuesStock}`);
});

await prueba('escanear un ISBN nuevo pide los datos, con ayuda de Open Library', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch({
    openLibraryOk: true,
    openLibraryDatos: { 'ISBN:000000000X': { title: 'Libro Nuevo de Prueba', authors: [{ name: 'Autora de Prueba' }] } }
  });
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();

  document.getElementById('er-manual').value = '000000000X';
  document.getElementById('er-buscar').click();
  await new Promise(r => setTimeout(r, 30)); // agregar_libro_remoto() responde "falta_info"

  assert(document.getElementById('er-nuevo-titulo'), 'no ofreció el formulario de alta rápida');

  await new Promise(r => setTimeout(r, 30)); // buscarPorIsbnExterno() se completa después
  assert(document.getElementById('er-nuevo-titulo').value === 'Libro Nuevo de Prueba',
    'no precargó el título desde Open Library');
  assert(document.getElementById('er-nuevo-autor').value === 'Autora de Prueba',
    'no precargó el autor desde Open Library');

  document.getElementById('er-nuevo-guardar').click();
  await new Promise(r => setTimeout(r, 30));

  const resultado = document.getElementById('er-resultado').textContent;
  assert(/Se agregó al catálogo/.test(resultado), `no confirmó el alta: ${resultado}`);
  assert(libros.some(l => l.isbn === '000000000X'), 'el libro nuevo no quedó en el catálogo simulado');
});

await prueba('un enlace que expira a mitad de sesión corta el escaneo con un aviso claro', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch();
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();

  // Se simula que el enlace vence justo después de abrir la página: la
  // próxima llamada a agregar_libro_remoto() debe rechazarse igual, aunque
  // validar_enlace_escaneo() ya hubiera dicho que era válido al principio.
  const fetchAnterior = global.fetch;
  global.fetch = async (url, opciones) => {
    if (String(url).includes('/rpc/agregar_libro_remoto')) {
      return { ok: false, json: async () => ({ message: 'Este enlace no es válido o ya expiró. Pide uno nuevo.' }) };
    }
    return fetchAnterior(url, opciones);
  };

  document.getElementById('er-manual').value = LIBRO_EXISTENTE.isbn;
  document.getElementById('er-buscar').click();
  await new Promise(r => setTimeout(r, 30));

  const resultado = document.getElementById('er-resultado').textContent;
  assert(/expiró|no es válido/i.test(resultado), `no avisó que el enlace ya no sirve: ${resultado}`);
});

console.log('\n=== La cámara: un solo clic, y mensajes claros cuando falla ===');
// scanner.js dejó de usar Html5QrcodeScanner (la interfaz "enlatada" de la
// librería, con un botón de permiso APARTE del nuestro) por Html5Qrcode, su
// API de bajo nivel — ver el comentario al inicio de scanner.js. Se mockea
// ese global, no el anterior.

await prueba('con permiso concedido, la cámara se enciende con un solo clic', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch();
  window.Html5Qrcode = class {
    start() { return Promise.resolve(); }
    stop() { return Promise.resolve(); }
    clear() { return Promise.resolve(); }
  };
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();

  document.getElementById('er-start').click();
  await new Promise(r => setTimeout(r, 30));

  const bloqueCamara = document.getElementById('er-camara-encendida');
  assert(bloqueCamara && !bloqueCamara.classList.contains('hidden'),
    'no mostró el recuadro de la cámara tras encenderla con un solo clic');
  assert(document.getElementById('reader-video'), 'no dibujó el visor de video propio');
  assert(document.getElementById('er-start').classList.contains('hidden'),
    'el botón «Iniciar cámara» debería ocultarse mientras la cámara está encendida');

  // Se apaga para no dejar encendida la cámara del módulo (es un singleton
  // compartido) de cara a la próxima prueba de este archivo.
  document.getElementById('er-stop').click();
  await new Promise(r => setTimeout(r, 10));
});

await prueba('si el navegador niega el permiso, avisa con un mensaje claro y deja reintentar', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch();
  window.Html5Qrcode = class {
    start() { return Promise.reject(Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })); }
    stop() { return Promise.resolve(); }
    clear() { return Promise.resolve(); }
  };
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();

  document.getElementById('er-start').click();
  await new Promise(r => setTimeout(r, 30));

  const texto = document.getElementById('er-toast').textContent;
  assert(/permiso/i.test(texto), `no avisó con un mensaje sobre el permiso de la cámara: ${texto}`);
  assert(!/error desconocido/i.test(texto), 'debería mostrar el motivo real, no un mensaje genérico');
  assert(!document.getElementById('er-start').classList.contains('hidden'),
    'el botón «Iniciar cámara» debe seguir visible para poder reintentar (era el fallo: se escondía igual)');
  assert(document.getElementById('er-camara-encendida').classList.contains('hidden'),
    'no debería quedar mostrando un recuadro de cámara que nunca encendió');
});

await prueba('si no hay ninguna cámara en el dispositivo, lo dice explícitamente', async () => {
  crearDom(`?token=${ENLACE_VALIDO.token}`);
  mockFetch();
  window.Html5Qrcode = class {
    start() { return Promise.reject(Object.assign(new Error('Requested device not found'), { name: 'NotFoundError' })); }
    stop() { return Promise.resolve(); }
    clear() { return Promise.resolve(); }
  };
  const { iniciar } = await importDesdeTmp('js/escaneo-remoto.js');
  await iniciar();

  document.getElementById('er-start').click();
  await new Promise(r => setTimeout(r, 30));

  const texto = document.getElementById('er-toast').textContent;
  assert(/no se encontró ninguna cámara/i.test(texto), `no distinguió la falta de cámara de otros errores: ${texto}`);
});

} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`${pasadas} comprobaciones correctas, ${fallidas} con fallo`);
process.exit(fallidas === 0 ? 0 : 1);
