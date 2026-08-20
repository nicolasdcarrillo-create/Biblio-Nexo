/**
 * Prueba de humo de la interfaz, sobre un DOM real (jsdom) y un Supabase falso.
 *
 * No reemplaza probar con la base de datos verdadera, pero sí atrapa lo que se
 * rompe al mover código: vistas que no existen, ids que no calzan, llamadas a
 * funciones que ya no están, y el rol que se muestra mal.
 *
 * Ejecutar:  node pruebas/probar-interfaz.mjs
 */

import { JSDOM } from 'jsdom';

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
// DOM simulado
// ---------------------------------------------------------------------------
const dom = new JSDOM(
  `<!DOCTYPE html><html><body>
     <main id="views-container"></main>
     <div id="toast-container"></div>
   </body></html>`,
  { url: 'https://biblioteca.futrono.cl/', pretendToBeVisual: true }
);

const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.Audio = class { play() { return Promise.resolve(); } };
globalThis.AudioContext = undefined;

// ---------------------------------------------------------------------------
// Supabase falso: devuelve datos plausibles y anota qué se le pidió
// ---------------------------------------------------------------------------
const llamadasRpc = [];

const perfilLibrero = {
  usuario_id: '11111111-1111-1111-1111-111111111111',
  email: 'librera@futrono.cl',
  nombre: 'María Antileo Huenchumán',
  telefono: '56912345678',
  cargo: 'Encargada de circulación',
  rol: 'librero',
  creado_en: '2026-03-01T12:00:00Z',
  actualizado_en: null,
  ultimo_acceso: '2026-07-26T14:30:00Z'
};

const respuestasRpc = {
  mi_perfil: () => [perfilLibrero],
  actualizar_mi_perfil: () => null,
  verificar_circulacion: () => [
    { funcion: 'prestar_libro', es_definer: true, diagnostico: 'Correcto' }
  ],
  verificar_rls: () => [
    { tabla: 'libros', rls_activo: true, politicas: 4, diagnostico: 'Correcto' }
  ],
  buscar_libros: () => [],
  estado_lector: () => [{ existe: false }],
  actualizar_contacto_lector: () => null
};

const consultaFalsa = () => {
  const encadenable = {
    select: () => encadenable,
    eq: () => encadenable,
    lt: () => encadenable,
    lte: () => encadenable,
    gte: () => encadenable,
    or: () => encadenable,
    order: () => encadenable,
    range: () => encadenable,
    limit: () => encadenable,
    update: () => encadenable,
    insert: () => encadenable,
    delete: () => encadenable,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolver) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolver)
  };
  return encadenable;
};

window.supabase = {
  createClient: () => ({
    from: consultaFalsa,
    rpc: (nombre, argumentos) => {
      llamadasRpc.push({ nombre, argumentos });
      const generar = respuestasRpc[nombre];
      return Promise.resolve(
        generar
          ? { data: generar(), error: null }
          : { data: null, error: { code: 'PGRST202', message: 'function not found' } }
      );
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: perfilLibrero.usuario_id, email: perfilLibrero.email } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: () => Promise.resolve({ error: null })
    }
  })
};

// ---------------------------------------------------------------------------
// Carga de los módulos reales
// ---------------------------------------------------------------------------
const { CONFIG } = await import('../js/config.js');
const uiManager = (await import('../js/modules/ui.js')).default;

const usuario = { id: perfilLibrero.usuario_id, email: perfilLibrero.email };

console.log('\n1. Arranque del sistema con una cuenta de librero');
await uiManager.renderShell(usuario);

comprobar('el rol detectado es librero', uiManager.currentUserRole === 'librero', `salió "${uiManager.currentUserRole}"`);
comprobar('la ficha lateral muestra el nombre, no el correo',
  document.getElementById('current-user-name')?.textContent === perfilLibrero.nombre);
comprobar('la segunda línea muestra el correo',
  document.getElementById('current-user-sub')?.textContent === perfilLibrero.email);
comprobar('la insignia muestra el cargo escrito por la persona',
  document.getElementById('current-user-badge')?.textContent === perfilLibrero.cargo);
comprobar('la inicial del avatar es la del nombre',
  document.getElementById('current-user-initial')?.textContent === 'M');

console.log('\n2. Menú lateral del librero');
const botonesMenu = [...document.querySelectorAll('#nav-menu .nav-btn')].map(b => b.dataset.view);
comprobar('incluye Mesón', botonesMenu.includes('scanner'));
comprobar('incluye Lectores (antes no lo tenía y lo necesitaba para los avisos)',
  botonesMenu.includes('users'));
comprobar('incluye Mi perfil', botonesMenu.includes('profile'));
comprobar('NO incluye Administración', !botonesMenu.includes('admin'),
  'el librero no debe ver el panel de administración');

console.log('\n3. Vista Mi perfil');
await uiManager.switchView('profile');
const contenedor = document.getElementById('views-container');

comprobar('se dibujó el formulario de datos', !!document.getElementById('perfil-form'));
comprobar('se dibujó el formulario de contraseña', !!document.getElementById('password-form'));
comprobar('el nombre viene cargado', document.getElementById('perfil-nombre')?.value === perfilLibrero.nombre);
comprobar('el cargo viene cargado', document.getElementById('perfil-cargo')?.value === perfilLibrero.cargo);
comprobar('el correo se muestra como solo lectura',
  [...contenedor.querySelectorAll('input[readonly]')].some(i => i.value === perfilLibrero.email));
comprobar('el rol se muestra como solo lectura',
  [...contenedor.querySelectorAll('input[readonly]')].some(i => i.value === 'Librero'));
comprobar('no hay ningún control para cambiarse el rol a uno mismo',
  !contenedor.querySelector('select[id*="rol"], input:not([readonly])[id*="rol"]'));

console.log('\n4. Guardar el perfil');
document.getElementById('perfil-nombre').value = 'María Antileo Curiqueo';
document.getElementById('perfil-cargo').value = 'Jefa de biblioteca';
document.getElementById('perfil-telefono').value = '9 8765 4321';
document.getElementById('perfil-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await new Promise(r => setTimeout(r, 60));

const guardado = llamadasRpc.filter(l => l.nombre === 'actualizar_mi_perfil').pop();
comprobar('se llamó a actualizar_mi_perfil', !!guardado);
comprobar('se envió el nombre nuevo', guardado?.argumentos?.p_nombre === 'María Antileo Curiqueo');
comprobar('el teléfono se normalizó a formato internacional',
  guardado?.argumentos?.p_telefono === '56987654321', `salió "${guardado?.argumentos?.p_telefono}"`);
comprobar('NO se envía el rol al servidor (no se puede ascender a uno mismo)',
  guardado && !('p_rol' in guardado.argumentos));
comprobar('NO se envía el id de usuario (lo toma de la sesión)',
  guardado && !('p_usuario_id' in guardado.argumentos));

console.log('\n5. Validaciones del perfil');
const contarLlamadas = () => llamadasRpc.filter(l => l.nombre === 'actualizar_mi_perfil').length;

let antes = contarLlamadas();
document.getElementById('perfil-nombre').value = 'María';
document.getElementById('perfil-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await new Promise(r => setTimeout(r, 30));
comprobar('rechaza un nombre sin apellido', contarLlamadas() === antes);

antes = contarLlamadas();
document.getElementById('perfil-nombre').value = 'María Antileo';
document.getElementById('perfil-telefono').value = '123';
document.getElementById('perfil-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await new Promise(r => setTimeout(r, 30));
comprobar('rechaza un teléfono incompleto', contarLlamadas() === antes);

console.log('\n6. Vista Administración cerrada para el librero');
await uiManager.switchView('admin');
comprobar('muestra el mensaje de sección restringida',
  /solo para administradores/i.test(document.getElementById('views-container').textContent));
comprobar('no se dibujaron las pestañas de administración',
  !document.querySelector('.admin-tab-btn'));

console.log('\n7. Escaneo: la cámara debe poder apagarse y volver a encender');
const Scanner = (await import('../js/modules/scanner.js')).default;
let instanciasCreadas = 0;
// Se mockea Html5Qrcode (la API de bajo nivel), no Html5QrcodeScanner: desde
// que scanner.js dejó de usar la interfaz "enlatada" de la librería (ver el
// comentario al inicio de scanner.js), es esta la que se instancia.
window.Html5Qrcode = class {
  constructor() { instanciasCreadas++; }
  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  clear() { return Promise.resolve(); }
};
await uiManager.switchView('scanner');
// start() es asíncrono desde que la librería se carga bajo demanda (368 KB que
// antes se descargaban en todas las vistas).
await Scanner.start(() => {}, () => {});
comprobar('la cámara enciende la primera vez', instanciasCreadas === 1,
  `se crearon ${instanciasCreadas}`);
Scanner.stop();
comprobar('al detener se descarta la instancia', Scanner.html5Qrcode === null);
await Scanner.start(() => {}, () => {});
comprobar('la cámara vuelve a encender después de detenerla (era el fallo)',
  instanciasCreadas === 2, `se crearon ${instanciasCreadas} instancias`);

console.log('\n7b. El escáner ya no se descarga en el arranque');
const html = (await import('node:fs')).readFileSync('index.html', 'utf8');
comprobar('index.html no carga html5-qrcode',
  !/<script[^>]+html5-qrcode/.test(html));
// Se mira solo el contenido de la etiqueta, no los comentarios que la explican
const csp = (html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || '';
const directiva = d => (csp.match(new RegExp(d + '\\s+([^;]+)')) || [])[1] || '';
comprobar('la CSP ya no permite scripts en línea',
  directiva('script-src').includes("'self'") && !directiva('script-src').includes('unsafe-inline'),
  `script-src = ${directiva('script-src').trim()}`);
comprobar('la CSP sigue bloqueando orígenes de terceros por defecto',
  directiva('default-src').includes("'self'"));
comprobar('no queda ningún manejador onclick/onerror en el HTML',
  !/\son(click|error|load)=/.test(html));

console.log('\n7c. La CSP del <meta> no declara directivas que el navegador ignora');
// frame-ancestors, sandbox, report-uri y report-to solo funcionan como cabecera
// HTTP. Escribirlas en un <meta> es peor que omitirlas: el navegador las ignora,
// avisa en la consola, y quedan dando la impresión de una protección inexistente.
const soloCabecera = ['frame-ancestors', 'sandbox', 'report-uri', 'report-to'];
for (const d of soloCabecera) {
  comprobar(`la CSP del <meta> no incluye ${d}`, !csp.includes(d),
    `${d} está en el <meta> y el navegador lo ignora`);
}

console.log('\n7d. La protección por cabecera existe para Vercel');
const fs = (await import('node:fs'));
comprobar('existe la configuración para Vercel (vercel.json)', fs.existsSync('vercel.json'));
comprobar('  ...y envía frame-ancestors',
  fs.readFileSync('vercel.json', 'utf8').includes("frame-ancestors 'none'"));
// Respaldo en JavaScript por si algún despliegue queda sin cabeceras
const arranque = fs.readFileSync('js/arranque.js', 'utf8');
comprobar('hay respaldo en JavaScript por si faltan las cabeceras',
  /window\.top\s*!==\s*window\.self/.test(arranque));

console.log('\n7e. escaneo-remoto.html (la página del enlace sin sesión) tiene su propia CSP correcta');
const htmlRemoto = fs.readFileSync('escaneo-remoto.html', 'utf8');
const cspRemoto = (htmlRemoto.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/) || [])[1] || '';
const directivaRemoto = d => (cspRemoto.match(new RegExp(d + '\\s+([^;]+)')) || [])[1] || '';
comprobar('tiene su propia etiqueta <meta> de CSP', !!cspRemoto);
comprobar('su script-src no permite scripts en línea',
  directivaRemoto('script-src').includes("'self'") && !directivaRemoto('script-src').includes('unsafe-inline'));
comprobar('su default-src sigue bloqueando orígenes de terceros por defecto',
  directivaRemoto('default-src').includes("'self'"));
comprobar('permite hablar con Supabase (valida el token y agrega libros sin sesión)',
  directivaRemoto('connect-src').includes('supabase.co'));
comprobar('permite hablar con Open Library (autocompletar título y autor)',
  directivaRemoto('connect-src').includes('openlibrary.org'));
comprobar('no queda ningún manejador onclick/onerror en el HTML',
  !/\son(click|error|load)=/.test(htmlRemoto));
comprobar('solo carga su propio script, ningún <script src> de CDN externo',
  [...htmlRemoto.matchAll(/<script[^>]+src="([^"]+)"/g)].every(m => !/^https?:\/\//.test(m[1])));
comprobar('vercel.json también le manda Cache-Control: no-cache (igual que a index.html)',
  fs.readFileSync('vercel.json', 'utf8').includes('/escaneo-remoto.html'));

console.log('\n8. Regresión: administrador sin fila de rol en la base de datos');
// mi_perfil() crea la fila que falta con el rol de menor privilegio. Si el
// respaldo por CONFIG.ADMIN_EMAILS no se aplicara, el administrador quedaría
// atrapado como librero sin nadie que pudiera ascenderlo.
perfilLibrero.rol = 'librero';
perfilLibrero.email = CONFIG.ADMIN_EMAILS[0];
await uiManager.renderShell({ id: perfilLibrero.usuario_id, email: perfilLibrero.email });
comprobar('un correo de CONFIG.ADMIN_EMAILS ve la interfaz de administrador',
  uiManager.currentUserRole === 'admin', `salió "${uiManager.currentUserRole}"`);
comprobar('queda marcado el desajuste entre pantalla y servidor',
  uiManager.desajusteDeRol === true);
await uiManager.switchView('dashboard');
comprobar('el Dashboard avisa que el rol no está en la base de datos',
  /no está en la base de datos/i.test(document.getElementById('views-container').textContent));
comprobar('el aviso incluye el SQL para corregirlo',
  /insert into public\.usuarios/.test(document.getElementById('views-container').textContent));

// Un correo cualquiera no debe activar el respaldo
perfilLibrero.email = 'otra.persona@futrono.cl';
await uiManager.renderShell({ id: perfilLibrero.usuario_id, email: perfilLibrero.email });
comprobar('un correo que NO está en la lista sigue siendo librero',
  uiManager.currentUserRole === 'librero', `salió "${uiManager.currentUserRole}"`);
comprobar('y no muestra ningún aviso de desajuste', uiManager.desajusteDeRol === false);

console.log('\n9. Roles definidos en la configuración');
for (const rol of ['admin', 'librero']) {
  const vistas = CONFIG.VIEWS_BY_ROLE[rol].map(v => v.id);
  comprobar(`el rol "${rol}" tiene Mi perfil`, vistas.includes('profile'));
  comprobar(`el rol "${rol}" no tiene vistas repetidas`, new Set(vistas).size === vistas.length);
}
comprobar('solo el rol admin ve Administración',
  CONFIG.VIEWS_BY_ROLE.admin.some(v => v.id === 'admin') &&
  !CONFIG.VIEWS_BY_ROLE.librero.some(v => v.id === 'admin'));

console.log('\n10. Fase 1.1 — funcionamiento sin conexión (service worker, manifest)');
comprobar('existe sw.js', fs.existsSync('sw.js'));
const sw = fs.existsSync('sw.js') ? fs.readFileSync('sw.js', 'utf8') : '';
comprobar('registra los tres eventos del ciclo de vida (install/activate/fetch)',
  /addEventListener\(\s*['"]install['"]/.test(sw) &&
  /addEventListener\(\s*['"]activate['"]/.test(sw) &&
  /addEventListener\(\s*['"]fetch['"]/.test(sw));
comprobar('los nombres de caché llevan versión (para poder invalidarlos)',
  /CACHE_VERSION/.test(sw) && /CACHE_SHELL/.test(sw) && /CACHE_RUNTIME/.test(sw));
comprobar('activate borra cachés de versiones anteriores',
  /caches\.delete/.test(sw));
comprobar('ignora peticiones que no son GET (la cola de escritura es Fase 1.3, no esto)',
  /method\s*!==\s*['"]GET['"]/.test(sw));
comprobar('ignora peticiones de otro origen (Supabase, Open Library nunca se cachean)',
  /url\.origin\s*!==\s*self\.location\.origin/.test(sw));
comprobar('/vendor/ usa cache-first',
  /vendor\//.test(sw) && /cacheFirst/.test(sw));
comprobar('el resto usa network-first (siempre se prefiere la red si hay)',
  /networkFirst/.test(sw));
for (const clave of ['/index.html', '/escaneo-remoto.html', '/manifest.json', '/icono-192x192.png', '/css/styles.css', '/js/main.js']) {
  comprobar(`precarga ${clave}`, sw.includes(`'${clave}'`));
}
// Se mira solo el arreglo PRECACHE_URLS, no el archivo entero: los tres
// nombres SÍ aparecen a propósito en el comentario que explica por qué se
// excluyen, y buscarlos en todo el texto daría un falso fallo.
const listaPrecarga = (sw.match(/PRECACHE_URLS\s*=\s*\[([\s\S]*?)\];/) || [])[1] || '';
for (const pesado of ['html5-qrcode.min.js', 'chart.umd.js', 'qrcode.min.js']) {
  comprobar(`NO precarga ${pesado} (se carga solo, bajo demanda, como hasta ahora)`,
    !listaPrecarga.includes(pesado));
}

comprobar('existe manifest.json', fs.existsSync('manifest.json'));
let manifest = {};
comprobar('manifest.json es JSON válido', (() => {
  try { manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8')); return true; }
  catch { return false; }
})());
for (const campo of ['name', 'short_name', 'start_url', 'display', 'icons']) {
  comprobar(`manifest.json trae "${campo}"`, campo in manifest);
}
comprobar('el manifest se abre en modo standalone (como una app, no una pestaña)',
  manifest.display === 'standalone');
comprobar('el manifest declara al menos un ícono de 192×192',
  Array.isArray(manifest.icons) && manifest.icons.some(i => i.sizes === '192x192'));

comprobar('index.html enlaza el manifest', html.includes('rel="manifest"'));
comprobar('index.html declara theme-color', /name="theme-color"/.test(html));

const mainJs = fs.readFileSync('js/main.js', 'utf8');
comprobar('main.js registra el service worker',
  /serviceWorker\.register\(\s*['"]\/sw\.js['"]/.test(mainJs));
comprobar('el registro comprueba que el navegador lo soporte antes de intentarlo',
  /['"]serviceWorker['"]\s*in\s*navigator/.test(mainJs));
comprobar('un fallo del registro no interrumpe el arranque (solo se registra)',
  /register\([^)]*\)\s*\.catch/.test(mainJs));

comprobar('vercel.json manda Cache-Control: no-cache a sw.js (si no, el navegador podría tardar en ver una versión nueva)',
  /"source":\s*"\/sw\.js"/.test(fs.readFileSync('vercel.json', 'utf8')));

console.log('\n11. Fase 1.2 — persistencia local (IndexedDB): el enganche, no la lógica interna');
// La lógica de persistencia.js (delta sync, lápidas, purga por antigüedad)
// tiene su propia prueba dedicada: pruebas/probar-persistencia.mjs. Aquí solo
// se comprueba que quedó ENGANCHADA donde debía, no que funcione — para eso
// hace falta IndexedDB de verdad, que jsdom no trae.
comprobar('existe js/modules/persistencia.js', fs.existsSync('js/modules/persistencia.js'));
comprobar('sw.js precarga persistencia.js (si no, se rompería el import bajo IndexedDB sin conexión)',
  listaPrecarga.includes('/js/modules/persistencia.js'));

const dbJs = fs.readFileSync('js/modules/db.js', 'utf8');
comprobar('db.js importa persistencia.js', /import\s+persistencia\s+from\s+['"]\.\/persistencia\.js['"]/.test(dbJs));
comprobar('estadoLector() guarda el resultado en el almacén local (para poder mostrarlo si se corta la conexión justo después)',
  /estadoLector\(rut\)[\s\S]*?persistencia\.guardarLectorConsultado\(resultado\)/.test(dbJs));

comprobar('main.js importa persistencia.js', /import\s+persistencia\s+from\s+['"]\.\/modules\/persistencia\.js['"]/.test(mainJs));
comprobar('main.js arranca la sincronización en segundo plano después de iniciar sesión (no antes: sin sesión, RLS no deja leer nada)',
  /renderShell\([^)]*\)[\s\S]{0,80}iniciarSincronizacionEnSegundoPlano\(\)/.test(mainJs));
comprobar('la sincronización en segundo plano se repite sola mientras la pestaña sigue abierta',
  /setInterval\(\s*\(\)\s*=>\s*persistencia\.sincronizarTodo\(\)/.test(mainJs));
comprobar('también se reintenta al recuperar la conexión (evento "online")',
  /addEventListener\(\s*['"]online['"][\s\S]{0,60}sincronizarTodo/.test(mainJs));

// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(60)}`);
console.log(`${pasadas} comprobaciones correctas, ${fallidas} con fallo`);
process.exit(fallidas === 0 ? 0 : 1);
