/**
 * Service Worker de BiblioNexo — Fase 1.1 (funcionamiento sin conexión).
 *
 * Qué hace y qué NO hace, para que quede claro al leerlo dentro de un año:
 *
 *   - Precarga el "cascarón" de la aplicación (HTML, CSS, JS propio, fuentes,
 *     Tailwind/FontAwesome compilados) para que la app pueda ABRIR sin
 *     conexión. Esto sigue siendo todo lo que hace ESTE archivo.
 *   - La copia local de catálogo y lectores (IndexedDB, con sus reglas de
 *     privacidad) es la Fase 1.2, y vive aparte, en
 *     js/modules/persistencia.js — no aquí. Este service worker NO guarda
 *     ningún dato de negocio, solo el cascarón de archivos estáticos.
 *   - Registrar un préstamo o una devolución sin conexión sigue sin
 *     funcionar: eso es la Fase 1.3 (cola de sincronización), todavía sin
 *     escribir. Sin conexión, hoy, la interfaz abre y el catálogo/lectores
 *     replicados están disponibles para consulta, pero las operaciones que
 *     necesitan una respuesta del servidor siguen fallando tal como antes.
 *   - NO intercepta nada que no sea GET, ni nada de otro origen (Supabase,
 *     Open Library): esas peticiones pasan derecho, sin pasar por ningún
 *     caché. Es a propósito — cachear una respuesta de Supabase por
 *     accidente sería servir datos de préstamos desactualizados como si
 *     fueran el estado real. La copia local de Fase 1.2 la escribe la propia
 *     aplicación, con criterio, no este archivo por reflejo.
 *
 * Estrategia de caché, por tipo de recurso:
 *
 *   - `/vendor/*`  → cache-first. Son archivos con hash de versión implícito
 *     (vercel.json los sirve con `immutable`); no tiene sentido pedirlos de
 *     nuevo si ya están guardados.
 *   - Todo lo demás del mismo origen (HTML, CSS, JS propio, manifest, ícono)
 *     → network-first con reserva en caché. Se prefiere siempre la versión
 *     más nueva cuando hay conexión; el caché es solo el plan B.
 *   - Navegaciones (abrir `index.html` o `escaneo-remoto.html` directo,
 *     recargar la página) → mismo network-first, con `index.html` como
 *     último recurso si ni la red ni el caché específico responden.
 *
 * Versionado del caché: subir CACHE_VERSION en cada cambio a la lista de
 * `PRECACHE_URLS`, a la lógica de abajo, O A LA FIRMA de un RPC que llame
 * alguno de los archivos de PRECACHE_URLS (aunque el archivo no cambie de
 * nombre): si no, alguien con este service worker activo y sin conexión (o
 * con una pestaña vieja sin recargar) puede seguir corriendo JS que manda un
 * parámetro que el servidor ya no acepta. `activate` borra cualquier caché
 * de una versión anterior con el mismo prefijo `biblionexo-`.
 */

const CACHE_VERSION = 'v5'; // plazo de préstamo por libro (js/modules/db.js, js/modules/ui-base.js) e invitación de personal (js/vistas/admin.js): buscar_libros() ahora devuelve una columna más y hay RPCs/Edge Functions nuevas que estos archivos ya llaman
const CACHE_SHELL = `biblionexo-shell-${CACHE_VERSION}`;
const CACHE_RUNTIME = `biblionexo-runtime-${CACHE_VERSION}`;

// El "cascarón": lo mínimo para que la aplicación abra y muestre login o
// panel sin conexión. Deliberadamente NO incluye vendor/js/html5-qrcode.min.js
// (368 KB), vendor/js/chart.umd.js ni vendor/js/qrcode.min.js: los tres se
// cargan solo cuando hacen falta (ver js/modules/scanner.js y
// js/modules/qr.js) y forzarlos aquí solo alargaría la primera visita sin
// beneficio real — si no hay conexión la primera vez que alguien abre el
// sitio, tampoco habría alcanzado a usar la cámara ni los reportes todavía.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/escaneo-remoto.html',
  '/manifest.json',
  '/icono-192x192.png',
  '/icono-512x512.png',
  '/css/styles.css',
  '/vendor/css/tailwind.css',
  '/vendor/css/fonts.css',
  '/vendor/css/fontawesome.min.css',
  '/vendor/fonts/newsreader-latin-400-normal.woff2',
  '/vendor/fonts/newsreader-latin-500-normal.woff2',
  '/vendor/fonts/newsreader-latin-600-normal.woff2',
  '/vendor/fonts/plus-jakarta-sans-latin-400-normal.woff2',
  '/vendor/fonts/plus-jakarta-sans-latin-500-normal.woff2',
  '/vendor/fonts/plus-jakarta-sans-latin-600-normal.woff2',
  '/vendor/fonts/plus-jakarta-sans-latin-700-normal.woff2',
  '/vendor/fonts/plus-jakarta-sans-latin-800-normal.woff2',
  '/vendor/webfonts/fa-brands-400.woff2',
  '/vendor/webfonts/fa-regular-400.woff2',
  '/vendor/webfonts/fa-solid-900.woff2',
  '/vendor/webfonts/fa-v4compatibility.woff2',
  '/vendor/js/supabase.js',
  '/js/arranque.js',
  '/js/config.js',
  '/js/main.js',
  '/js/supabase-init.js',
  '/js/escaneo-remoto.js',
  '/js/modules/auth.js',
  '/js/modules/db.js',
  '/js/modules/errores.js',
  '/js/modules/estado-conexion.js',
  '/js/modules/libros-externos.js',
  '/js/modules/persistencia.js',
  '/js/modules/portadas.js',
  '/js/modules/qr.js',
  '/js/modules/scanner.js',
  '/js/modules/ui-base.js',
  '/js/modules/ui.js',
  '/js/modules/utilidades.js',
  '/js/vistas/admin.js',
  '/js/vistas/dashboard.js',
  '/js/vistas/perfil.js',
  '/js/vistas/reportes.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_SHELL);
      // Se guarda archivo por archivo, no con cache.addAll(): addAll() es
      // todo-o-nada, y un solo recurso que falle (por ejemplo, si este
      // archivo se despliega antes de que exista algún JS nuevo que liste)
      // tumbaría la instalación entera y la app quedaría sin ningún soporte
      // sin conexión. Así, un fallo puntual solo se registra y el resto de
      // la precarga sigue.
      const resultados = await Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url))
      );
      resultados.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn('[sw] no se pudo precargar', PRECACHE_URLS[i], r.reason);
        }
      });
      // Activa esta versión de inmediato en vez de esperar a que se cierren
      // todas las pestañas viejas: con la estrategia network-first de abajo,
      // una pestaña abierta sigue viendo la versión más nueva de cada
      // archivo de todas formas apenas haya red, así que no hay razón para
      // hacer esperar a nadie.
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const nombres = await caches.keys();
      await Promise.all(
        nombres
          .filter(n => n.startsWith('biblionexo-') && n !== CACHE_SHELL && n !== CACHE_RUNTIME)
          .map(n => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

/** vendor/*: cache-first, con reserva de red por si algo no se precargó. */
async function cacheFirst(request) {
  const enCache = await caches.match(request);
  if (enCache) return enCache;
  const respuesta = await fetch(request);
  if (respuesta && respuesta.ok) {
    const cache = await caches.open(CACHE_RUNTIME);
    cache.put(request, respuesta.clone());
  }
  return respuesta;
}

/** Todo lo demás del mismo origen: siempre se prefiere la red; el caché es
 *  solo el plan B cuando no hay conexión. */
async function networkFirst(request) {
  try {
    const respuesta = await fetch(request);
    if (respuesta && respuesta.ok) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch (e) {
    const enCache = await caches.match(request);
    if (enCache) return enCache;
    // Para una navegación (abrir la página), aunque no exista un caché para
    // esta URL exacta, index.html es un mejor resultado que una pantalla de
    // error del navegador: la propia app ya sabe mostrar sus mensajes de
    // "sin conexión" una vez cargada.
    if (request.mode === 'navigate') {
      const shell = await caches.match('/index.html');
      if (shell) return shell;
    }
    throw e;
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;

  // Solo GET: escrituras (POST/PATCH/etc.) pasan derecho, sin intervención.
  // La cola de reintentos para escrituras sin conexión es la Fase 1.3
  // (todavía sin implementar), no algo que deba improvisar este archivo.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cualquier otro origen (Supabase, Open Library) pasa derecho. Nunca se
  // cachea una respuesta de la API: sería servir datos de préstamos o de
  // catálogo desactualizados sin que nadie lo note.
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/vendor/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
