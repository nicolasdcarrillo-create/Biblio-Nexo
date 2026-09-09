(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),(function(){window.__appBooted=!1;try{if(window.top!==window.self){var e=!0;try{window.top.location=window.self.location}catch{}e&&document.addEventListener(`DOMContentLoaded`,function(){if(window.top!==window.self){document.body.textContent=``;var e=document.createElement(`div`);e.setAttribute(`role`,`alert`),e.style.cssText=`font-family:system-ui,sans-serif;padding:2rem;text-align:center;background:#1c1917;color:#fafaf9;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem`;var t=document.createElement(`strong`);t.textContent=`Esta página no puede mostrarse dentro de otro sitio`;var n=document.createElement(`span`);n.style.cssText=`font-size:0.875rem;max-width:28rem;line-height:1.5`,n.textContent=`Por seguridad, el sistema de la biblioteca solo funciona en su propia ventana. Abre la dirección directamente en el navegador.`,e.appendChild(t),e.appendChild(n),document.body.appendChild(e)}})}}catch{}window.__showCriticalError=function(e){var t=document.getElementById(`views-container`)||document.body;t.textContent=``;var n=document.createElement(`div`);n.className=`h-screen w-full bg-patrimonio-lago flex items-center justify-center p-6`;var r=document.createElement(`div`);r.className=`bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4`,r.setAttribute(`role`,`alert`);var i=document.createElement(`i`);i.setAttribute(`aria-hidden`,`true`),i.className=`fas fa-triangle-exclamation text-3xl text-rose-700`;var a=document.createElement(`h3`);a.className=`font-serif text-lg font-bold text-stone-900`,a.textContent=`No se pudo conectar`;var o=document.createElement(`p`);o.className=`text-stone-600 text-sm`,o.textContent=e;var s=document.createElement(`button`);s.className=`w-full bg-patrimonio-madera hover:bg-[#633414] text-white font-medium rounded-xl shadow py-2.5 text-sm`,s.textContent=`Reintentar`,s.addEventListener(`click`,function(){location.reload()}),r.appendChild(i),r.appendChild(a),r.appendChild(o),r.appendChild(s),n.appendChild(r),t.appendChild(n)};function t(e,t){var n=document.getElementById(e);n&&n.addEventListener(`error`,function(){window.__showCriticalError(t)})}document.addEventListener(`DOMContentLoaded`,function(){t(`script-supabase`,`No se pudo cargar el módulo de base de datos. Verifique que la carpeta vendor esté publicada.`),t(`script-app`,`No se pudo cargar la aplicación.`)}),setTimeout(function(){window.__appBooted||window.__showCriticalError(`La aplicación tardó demasiado en cargar. Verifique su conexión a internet e intente nuevamente.`)},1e4)})();var e={SUPABASE_URL:`https://vcngmgzxjoorjhcgqzpk.supabase.co`,SUPABASE_ANON_KEY:`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbmdtZ3p4am9vcmpoY2dxenBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1Mjk5MTcsImV4cCI6MjEwMDEwNTkxN30.FXiGK15kyT82jrKNIb4nodWWtW6I-s_YMV9rGZYfAxY`,ADMIN_EMAILS:[],MAX_PRESTAMOS_POR_LECTOR:3,DIAS_AVISO_PREVIO:3,MAX_RENOVACIONES:2,FILAS_POR_PAGINA:25,BIBLIOTECA:{nombre:`Biblioteca Pública Municipal de Futrono`,nombreLargo:`Biblioteca Pública Municipal N° 332 “Escritor Ramón Quichiyao Figueroa”`,direccion:`Balmaceda 99, Futrono`,telefono:`+56 63 248 1000`},VIEWS_BY_ROLE:{admin:[{id:`dashboard`,label:`Dashboard`,icon:`fa-chart-pie`,section:`Panel`},{id:`reports`,label:`Reportes`,icon:`fa-file-lines`,section:`Panel`},{id:`catalog`,label:`Catálogo`,icon:`fa-book`,section:`Gestión`},{id:`users`,label:`Lectores`,icon:`fa-users`,section:`Gestión`},{id:`loans`,label:`Préstamos`,icon:`fa-right-left`,section:`Gestión`},{id:`scanner`,label:`Mesón`,icon:`fa-barcode`,section:`Operación`},{id:`admin`,label:`Administración`,icon:`fa-screwdriver-wrench`,section:`Sistema`},{id:`profile`,label:`Mi perfil`,icon:`fa-id-card`,section:`Sistema`}],librero:[{id:`dashboard`,label:`Dashboard`,icon:`fa-chart-pie`,section:`Panel`},{id:`reports`,label:`Reportes`,icon:`fa-file-lines`,section:`Panel`},{id:`scanner`,label:`Mesón`,icon:`fa-barcode`,section:`Operación`},{id:`catalog`,label:`Catálogo`,icon:`fa-book`,section:`Operación`},{id:`loans`,label:`Préstamos`,icon:`fa-right-left`,section:`Operación`},{id:`users`,label:`Lectores`,icon:`fa-users`,section:`Operación`},{id:`profile`,label:`Mi perfil`,icon:`fa-id-card`,section:`Sistema`}]},ROLE_LABELS:{admin:{title:`Administrador`,welcome:`Panel de control general de la biblioteca.`},librero:{title:`Librero`,welcome:`Resumen de tu turno y trabajo diario.`}}};async function t(e,t,n){return await n()}var n=null;if(!window.supabase)console.error(`Error crítico: Supabase no cargado desde el CDN.`);else try{n=window.supabase.createClient(e.SUPABASE_URL,e.SUPABASE_ANON_KEY,{auth:{lock:t}})}catch(e){console.error(`Error crítico: Supabase CDN disponible pero createClient falló:`,e.message)}var r=n;function i(e,t=15e3,n=`La operación tardó demasiado en responder. Intente nuevamente; si el problema persiste, recargue la página.`){return Promise.race([e,new Promise((e,r)=>setTimeout(()=>r(Error(n)),t))])}function a(e){return e==null?``:e.toString().replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var o=class{constructor(e){this.valor=e}toString(){return this.valor}};function s(e){return new o(e??``)}function c(e){return e instanceof o?e.valor:Array.isArray(e)?e.map(c).join(``):a(e)}function l(e,...t){let n=e[0];for(let r=0;r<t.length;r++)n+=c(t[r])+e[r+1];return new o(n)}async function u(e){let t=new TextEncoder().encode(e||``),n=await crypto.subtle.digest(`SHA-256`,t);return`escaneo-remoto-${Array.from(new Uint8Array(n)).map(e=>e.toString(16).padStart(2,`0`)).join(``)}`}async function d(e,t){let{data:n,error:a}=await i(r.auth.signInWithPassword({email:e,password:t}),15e3,`El inicio de sesión tardó demasiado en responder. Intente nuevamente; si el problema persiste, recargue la página.`);if(a)throw Error(`Credenciales inválidas. Acceso denegado.`);return n}async function f(){let{error:e}=await r.auth.signInWithOAuth({provider:`google`,options:{redirectTo:window.location.origin}});if(e)throw Error(`No se pudo iniciar sesión con Google.`)}async function p(e){let{error:t}=await r.auth.resetPasswordForEmail(e,{redirectTo:window.location.origin});if(t)throw Error(`No se pudo enviar el correo de recuperación.`)}async function m(e){let{error:t}=await r.auth.updateUser({password:e});if(t)throw/session/i.test(t.message)?Error(`El enlace expiró. Solicita uno nuevo desde la pantalla de ingreso.`):Error(t.message||`No se pudo cambiar la contraseña.`)}async function h(e,t){let{data:{user:n}}=await r.auth.getUser();if(!n?.email)throw Error(`No hay una sesión válida. Vuelve a iniciar sesión.`);let{error:i}=await r.auth.signInWithPassword({email:n.email,password:e});if(i)throw Error(`La contraseña actual no es correcta.`);let{error:a}=await r.auth.updateUser({password:t});if(a)throw Error(a.message||`No se pudo cambiar la contraseña.`)}function ee(e){return r.auth.onAuthStateChange((t,n)=>e(t,n))}async function g(){await r.auth.signOut(),window.location.reload()}function te(t){return t?e.ADMIN_EMAILS.includes(t.toLowerCase().trim()):!1}async function ne(t){let n=typeof t==`string`?t:t?.id,i=typeof t==`string`?null:t?.email;try{let{data:t,error:a}=await r.from(`usuarios`).select(`rol`).eq(`id`,n).maybeSingle();return a&&console.warn(`No se pudo leer el rol desde la tabla usuarios:`,a.message),t?.rol?t.rol:i&&e.ADMIN_EMAILS.includes(i.toLowerCase().trim())?(console.warn(`El usuario ${i} no tiene fila en la tabla "usuarios". Se le asignó el rol admin por CONFIG.ADMIN_EMAILS. Crea su fila en la tabla para que el rol quede respaldado por RLS.`),`admin`):`librero`}catch(e){return console.error(`Error inesperado al obtener el rol:`,e),`librero`}}var re=`biblionexo-local`,ie=2,ae=30,oe=50,_=500,v=null;function y(){return v||(v=new Promise((e,t)=>{if(typeof indexedDB>`u`){t(Error(`Este navegador no soporta almacenamiento local (IndexedDB).`));return}let n=indexedDB.open(re,ie);n.onupgradeneeded=()=>{let e=n.result,t=n.transaction,r=e.objectStoreNames.contains(`libros`)?t.objectStore(`libros`):e.createObjectStore(`libros`,{keyPath:`id`});r.indexNames.contains(`isbn`)||r.createIndex(`isbn`,`isbn`);let i=e.objectStoreNames.contains(`lectores`)?t.objectStore(`lectores`):e.createObjectStore(`lectores`,{keyPath:`id`});i.indexNames.contains(`consultadoEn`)||i.createIndex(`consultadoEn`,`consultadoEn`),i.indexNames.contains(`rut`)||i.createIndex(`rut`,`rut`),e.objectStoreNames.contains(`meta`)||e.createObjectStore(`meta`,{keyPath:`clave`}),e.objectStoreNames.contains(`colaSync`)||e.createObjectStore(`colaSync`,{keyPath:`id`,autoIncrement:!0}).createIndex(`proximoIntentoEn`,`proximoIntentoEn`)},n.onsuccess=()=>e(n.result),n.onerror=()=>{v=null,t(n.error||Error(`No se pudo abrir el almacén local.`))}}),v)}function b(e,t,n,r){return new Promise((i,a)=>{let o=e.transaction(t,n),s=o.objectStore(t),c;Promise.resolve(r(s)).then(e=>{c=e}).catch(a),o.oncomplete=()=>i(c),o.onerror=()=>a(o.error||Error(`Fallo en el almacén local "${t}".`)),o.onabort=()=>a(o.error||Error(`Transacción abortada en "${t}".`))})}function x(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}async function S(e){let t=await b(await y(),`meta`,`readonly`,t=>x(t.get(e)));return t?t.valor:null}async function C(e,t){await b(await y(),`meta`,`readwrite`,n=>n.put({clave:e,valor:t}))}async function w(e,t){t.length&&await b(await y(),e,`readwrite`,e=>{t.forEach(t=>e.put(t))})}async function T(e,t){t.length&&await b(await y(),e,`readwrite`,e=>{t.forEach(t=>e.delete(t))})}async function E(e){return b(await y(),e,`readonly`,e=>x(e.getAll()))}async function se(e){let t=[],n=e;for(let e=0;e<oe;e++){let e=r.from(`libros`).select(`*`).order(`actualizado_en`,{ascending:!0}).limit(_);e=n?e.gte(`actualizado_en`,n):e;let{data:i,error:a}=await e;if(a)throw a;if(!i||i.length===0||(t.push(...i),n=i[i.length-1].actualizado_en,i.length<_))break}return{filas:t,marca:t.length?t[t.length-1].actualizado_en:e}}async function ce(e,t){let n=r.from(`elementos_eliminados`).select(`id, eliminado_en`).eq(`tabla`,e).order(`eliminado_en`,{ascending:!0}).limit(2e3);n=t?n.gt(`eliminado_en`,t):n;let{data:i,error:a}=await n;if(a)throw a;return i||[]}var D=new class{async sincronizarLibros(){try{let{filas:e,marca:t}=await se(await S(`libros_ultima_sync`));await w(`libros`,e),t&&await C(`libros_ultima_sync`,t);let n=await ce(`libros`,await S(`libros_eliminados_ultima_sync`));return await T(`libros`,n.map(e=>e.id)),n.length&&await C(`libros_eliminados_ultima_sync`,n[n.length-1].eliminado_en),{libros:e.length,eliminados:n.length}}catch(e){return{error:e.message||String(e)}}}async guardarLectorConsultado(e){if(e&&e.existe!==!1&&e.lector_id!=null)try{await b(await y(),`lectores`,`readwrite`,async t=>{let n=await x(t.get(e.lector_id));t.put({id:e.lector_id,nombre:e.nombre??null,rut:e.rut??null,email:e.email??null,telefono:e.telefono??null,bloqueadoManual:!!e.bloqueado_manual,motivoBloqueo:e.motivo_bloqueo??null,prestamosActivosDetalle:e.prestamos_activos_detalle??n?.prestamosActivosDetalle??[],consultadoEn:Date.now()})})}catch{}}async sincronizarLectoresActivos(){try{let{data:e,error:t}=await r.from(`prestamos`).select(`fecha_devolucion_esperada, libros(titulo), lectores(id, nombre, rut, email, telefono, bloqueado_manual, motivo_bloqueo)`).eq(`estado`,`activo`).limit(2e3);if(t)throw t;let n=new Map,i=new Map;for(let t of e||[]){let e=t.lectores;e&&e.id!=null&&(n.set(e.id,e),i.has(e.id)||i.set(e.id,[]),i.get(e.id).push({fechaDevolucionEsperada:t.fecha_devolucion_esperada??null,tituloLibro:t.libros?.titulo??null}))}let a=Date.now(),o=[...n.values()].map(e=>({id:e.id,nombre:e.nombre??null,rut:e.rut??null,email:e.email??null,telefono:e.telefono??null,bloqueadoManual:!!e.bloqueado_manual,motivoBloqueo:e.motivo_bloqueo??null,prestamosActivosDetalle:i.get(e.id)||[],consultadoEn:a}));return await w(`lectores`,o),{lectores:o.length}}catch(e){return{error:e.message||String(e)}}}async purgarLectoresEliminados(){try{let e=await ce(`lectores`,await S(`lectores_eliminados_ultima_sync`));return await T(`lectores`,e.map(e=>e.id)),e.length&&await C(`lectores_eliminados_ultima_sync`,e[e.length-1].eliminado_en),{eliminados:e.length}}catch(e){return{error:e.message||String(e)}}}async purgarLectoresAntiguos(e=ae){try{let t=Date.now()-e*24*60*60*1e3,n=await b(await y(),`lectores`,`readonly`,e=>x(e.index(`consultadoEn`).getAllKeys(IDBKeyRange.upperBound(t,!0))));return await T(`lectores`,n),{purgados:n.length}}catch(e){return{error:e.message||String(e)}}}async sincronizarTodo(){return{libros:await this.sincronizarLibros(),activos:await this.sincronizarLectoresActivos(),bajasLectores:await this.purgarLectoresEliminados(),purgados:await this.purgarLectoresAntiguos()}}async obtenerLibrosLocal(){return E(`libros`)}async obtenerLectoresLocal(){return E(`lectores`)}async guardarLibroLocalOptimista(e){try{await w(`libros`,[{id:-Date.now(),isbn:e.isbn,titulo:e.titulo,autor:e.autor,genero:e.genero||null,ubicacion:e.ubicacion||null,portada_url:e.portada_url||null,copias_totales:e.stock,stock:e.stock,actualizado_en:new Date().toISOString(),pendienteSync:!0}])}catch{}}async quitarLibroLocalOptimista(e){try{await b(await y(),`libros`,`readwrite`,async t=>{let n=await x(t.index(`isbn`).get(String(e)));n?.pendienteSync&&n.id<0&&t.delete(n.id)})}catch{}}async guardarLectorLocalOptimista(e){try{await w(`lectores`,[{id:-Date.now(),nombre:e.nombre??null,rut:e.rut??null,email:e.email??null,telefono:e.telefono??null,bloqueadoManual:!1,motivoBloqueo:null,prestamosActivosDetalle:[],consultadoEn:Date.now(),pendienteSync:!0}])}catch{}}async quitarLectorLocalOptimista(e){try{await b(await y(),`lectores`,`readwrite`,async t=>{let n=await x(t.index(`rut`).get(e));n?.pendienteSync&&n.id<0&&t.delete(n.id)})}catch{}}async buscarLibroLocalPorCodigo(e){if(e==null)return null;let t=await y(),n=await b(t,`libros`,`readonly`,t=>x(t.index(`isbn`).get(String(e))));if(n)return n;let r=Number(e);return Number.isFinite(r)?await b(t,`libros`,`readonly`,e=>x(e.get(r)))??null:null}async buscarLectorLocalPorRut(e){return e?await b(await y(),`lectores`,`readonly`,t=>x(t.index(`rut`).get(e)))??null:null}async encolarOperacion(e,t,n){return b(await y(),`colaSync`,`readwrite`,r=>x(r.add({tipo:e,params:t,descripcion:n||null,creadoEn:Date.now(),intentos:0,proximoIntentoEn:Date.now(),ultimoError:null})))}async listarOperacionesPendientes(){return E(`colaSync`)}async actualizarOperacion(e,t){await b(await y(),`colaSync`,`readwrite`,async n=>{let r=await x(n.get(e));r&&n.put({...r,...t})})}async quitarOperacion(e){await b(await y(),`colaSync`,`readwrite`,t=>t.delete(e))}async estado(){let[e,t,n,r,i]=await Promise.all([E(`libros`),E(`lectores`),E(`colaSync`),S(`libros_ultima_sync`),S(`lectores_eliminados_ultima_sync`)]);return{librosGuardados:e.length,lectoresGuardados:t.length,operacionesPendientes:n.length,librosUltimaSync:r,lectoresEliminadosUltimaSync:i}}},le=[/ResizeObserver loop/i,/Script error\.?$/i,/Non-Error promise rejection/i,/Failed to fetch.*openlibrary/i,/AbortError/i,/play\(\) failed/i],ue=[{patron:/\b\d{7,8}-[0-9kK]\b/g,por:`[RUT]`},{patron:/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g,por:`[correo]`},{patron:/\b(?:\+?56)?9\d{8}\b/g,por:`[teléfono]`},{patron:/eyJ[A-Za-z0-9_-]{10,}/g,por:`[token]`}];function O(e){let t=(e??``).toString();return ue.forEach(({patron:e,por:n})=>{t=t.replace(e,n)}),t}function de(){let e=navigator.userAgent||``;return`${/Edg\//.test(e)?`Edge`:/Chrome\//.test(e)?`Chrome`:/Firefox\//.test(e)?`Firefox`:/Safari\//.test(e)?`Safari`:`Otro`} · ${/Windows/.test(e)?`Windows`:/Android/.test(e)?`Android`:/iPhone|iPad/.test(e)?`iOS`:/Mac OS/.test(e)?`macOS`:/Linux/.test(e)?`Linux`:`Otro`} · ${window.innerWidth}×${window.innerHeight}`}var k=new class{constructor(){this.activo=!1,this.disponible=!0,this.cola=[],this.enviando=!1,this._recientes=new Map,this.obtenerVista=()=>null}iniciar(e){typeof e==`function`&&(this.obtenerVista=e),!this.activo&&(this.activo=!0,window.addEventListener(`error`,e=>{e.target&&e.target!==window||this.registrar(e.message,{detalle:`${e.filename||``}:${e.lineno||0}\n${e.error?.stack||``}`})}),window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;this.registrar(t?.message||String(t),{detalle:t?.stack||``,accion:`promesa sin capturar`})}),window.addEventListener(`pagehide`,()=>{this._vaciar()}))}registrar(e,{detalle:t=``,accion:n=null,origen:i=`js`}={}){if(!this.disponible||!r)return;let a=O(e);if(!a||le.some(e=>e.test(a)))return;let o=`${a}|${this.obtenerVista()||``}`,s=Date.now();s-(this._recientes.get(o)||0)<3e4||(this._recientes.set(o,s),this._recientes.size>50&&this._recientes.clear(),this.cola.push({p_mensaje:a.slice(0,500),p_origen:i,p_detalle:O(t).slice(0,2e3),p_vista:this.obtenerVista(),p_accion:n,p_navegador:de()}),this._vaciar())}registrarOperacion(e,t){this.registrar(t?.message||String(t),{origen:`operacion`,accion:e,detalle:t?.stack||``})}async _vaciar(){if(!(this.enviando||this.cola.length===0)){this.enviando=!0;try{for(;this.cola.length;){let e=this.cola.shift(),{error:t}=await r.rpc(`registrar_error`,e);if(t){(t.code===`42883`||t.code===`PGRST202`||/function .* does not exist|could not find/i.test(t.message||``))&&(this.disponible=!1,this.cola=[],console.warn(`Registro de errores desactivado: falta ejecutar la migración 009.`));break}}}catch{}finally{this.enviando=!1}}}},A=15e3;function j(){return new Date().toLocaleDateString(`en-CA`,{timeZone:`America/Santiago`})}function M(e){return(e||``).toString().replace(/[,()"'\\]/g,` `).replace(/[%_]/g,``).trim()}function N(e){return e?.code===`42883`||e?.code===`PGRST202`||/function .* does not exist|could not find/i.test(e?.message||``)}async function P(e,t={}){let n=t.bloque||1e3,r=t.espera||25e3,a=[],o=0;for(;;){let{data:t,error:s}=await i(e(o,o+n-1),r);if(s)return{data:null,error:s};if(a.push(...t||[]),!t||t.length<n)break;o+=n}return{data:a,error:null}}var fe={async obtenerLibros(e=``,t=0,n=25){let a=t*n,{data:o,error:s}=await i(r.rpc(`buscar_libros`,{p_busqueda:e||``,p_limite:n,p_desplazamiento:a}),A);if(!s){let e=o||[];return{libros:e,total:e.length?Number(e[0].total_coincidencias):0}}if(!N(s))throw s;let c=r.from(`libros`).select(`*`,{count:`exact`}).order(`titulo`).range(a,a+n-1),l=M(e);l&&(c=c.or(`titulo.ilike.%${l}%,autor.ilike.%${l}%,isbn.ilike.%${l}%`));let{data:u,error:d,count:f}=await i(c,A);if(d)throw d;return{libros:u||[],total:f||0}},async actualizarLibro(e,t){let{error:n}=await i(r.from(`libros`).update({titulo:t.titulo,autor:t.autor,isbn:t.isbn,genero:t.genero||null,ubicacion:t.ubicacion||null,portada_url:t.portada_url||null,dias_prestamo_override:t.diasPrestamoOverride??null}).eq(`id`,e),A);if(n)throw Error(n.code===`23505`?`Ese ISBN ya pertenece a otro libro.`:`No se pudo guardar el libro.`)},async eliminarLibro(e){let{error:t}=await i(r.rpc(`eliminar_libro`,{p_libro_id:e}),A);if(t)throw N(t)?Error(`Falta ejecutar la migración 020 en Supabase.`):Error(t.message||`No se pudo eliminar el libro.`)},async listarLibrosEliminados(){let{data:e,error:t}=await i(r.rpc(`listar_libros_eliminados`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudieron listar los libros eliminados.`)}return e||[]},async restaurarLibro(e){let{error:t}=await i(r.rpc(`restaurar_libro`,{p_libro_id:e}),A);if(t)throw N(t)?Error(`Falta ejecutar la migración 021 en Supabase.`):Error(t.message||`No se pudo restaurar el libro.`)}},pe={async obtenerLectores(e=``,t=0,n=25){let a=t*n,o=r.from(`lectores`).select(`*`,{count:`exact`}).order(`nombre`).range(a,a+n-1),s=M(e);s&&(o=o.or(`nombre.ilike.%${s}%,rut.ilike.%${s}%,email.ilike.%${s}%`));let{data:c,error:l,count:u}=await i(o,A);if(l)throw l;return{lectores:c||[],total:u||0}},async actualizarLector(e,t){let{error:n}=await i(r.from(`lectores`).update({nombre:t.nombre,rut:t.rut,email:t.email,telefono:t.telefono}).eq(`id`,e),A);if(n)throw Error(n.code===`23505`?`Ese RUT ya pertenece a otro lector.`:`No se pudo guardar el lector.`)},async eliminarLector(e){let{error:t}=await i(r.from(`lectores`).delete().eq(`id`,e),A);if(t)throw Error(`No se puede eliminar. El lector tiene historial en el sistema.`)},async bloquearLector(e,t,n=null){let{error:a}=await i(r.rpc(`bloquear_lector`,{p_lector_id:e,p_bloquear:t,p_motivo:n}),A);if(a)throw N(a)?Error(`Falta ejecutar la migración 006 en Supabase.`):Error(a.message||`No se pudo cambiar el bloqueo.`)},async obtenerBloqueados(){let{data:e,error:t}=await i(r.from(`lectores`).select(`id, nombre, rut, email, telefono, motivo_bloqueo, bloqueado_en`).eq(`bloqueado_manual`,!0).order(`bloqueado_en`,{ascending:!1}),A);if(t){if(/does not exist/i.test(t.message||``))return null;throw t}return e||[]}},me={async obtenerPrestamos(e=`todos`,t=0,n=25,a=3){let o=j(),s=new Date(`${o}T12:00:00`);s.setDate(s.getDate()+a);let c=s.toISOString().split(`T`)[0],l=t=>e===`vencidos`?t.lt(`fecha_devolucion_esperada`,o):e===`porVencer`?t.gte(`fecha_devolucion_esperada`,o).lte(`fecha_devolucion_esperada`,c):t,u=t*n,d=r.from(`prestamos`).select(`id, fecha_prestamo, fecha_devolucion_esperada, estado, renovaciones, libros(id, titulo, stock), lectores(id, nombre, rut, email, telefono)`,{count:`exact`}).eq(`estado`,`activo`);d=l(d).order(`fecha_devolucion_esperada`).range(u,u+n-1);let f=e=>{let t=r.from(`prestamos`).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`activo`);return e===`vencidos`&&(t=t.lt(`fecha_devolucion_esperada`,o)),e===`porVencer`&&(t=t.gte(`fecha_devolucion_esperada`,o).lte(`fecha_devolucion_esperada`,c)),t},[p,m,h,ee]=await i(Promise.all([d,f(`todos`),f(`vencidos`),f(`porVencer`)]),A);if(p.error)throw p.error;return{prestamos:p.data||[],total:p.count||0,conteos:{todos:m.count||0,vencidos:h.count||0,porVencer:ee.count||0}}},async obtenerPendientesDeAviso(e=3){let t=j(),n=new Date(`${t}T12:00:00`);n.setDate(n.getDate()+e);let{data:a,error:o}=await i(r.from(`prestamos`).select(`id, fecha_devolucion_esperada, renovaciones, libros(id, titulo), lectores(id, nombre, rut, email, telefono)`).eq(`estado`,`activo`).lte(`fecha_devolucion_esperada`,n.toISOString().split(`T`)[0]).order(`fecha_devolucion_esperada`).limit(500),A);if(o)throw o;return a||[]}},he={async ajustarCopias(e,t){let{data:n,error:a}=await i(r.rpc(`ajustar_copias`,{p_libro_id:e,p_copias_totales:t}),A);if(a)throw N(a)?Error(`Falta ejecutar la migración 006 en Supabase.`):Error(a.message||`No se pudo ajustar los ejemplares.`);return Array.isArray(n)?n[0]:n},async revisarInventario(){let{data:e,error:t}=await i(r.rpc(`revisar_inventario`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo revisar el inventario.`)}return e||[]},async corregirInventario(e){let{data:t,error:n}=await i(r.rpc(`corregir_inventario`,{p_libro_id:e}),A);if(n)throw Error(n.message||`No se pudo corregir el inventario.`);return Array.isArray(t)?t[0]:t},async obtenerParametros(){let{data:e,error:t}=await i(r.from(`parametros`).select(`clave, valor, descripcion`).order(`clave`),A);if(t){if(/does not exist/i.test(t.message||``))return null;throw t}return e||[]},async actualizarParametro(e,t){let{error:n}=await i(r.from(`parametros`).update({valor:String(t),actualizado_en:new Date().toISOString()}).eq(`clave`,e),A);if(n)throw Error(n.message||`No se pudo guardar el parámetro.`)}},ge={async listarPersonal(){let{data:e,error:t}=await i(r.rpc(`listar_personal`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo listar el personal.`)}return e||[]},async asignarRol(e,t){let{error:n}=await i(r.rpc(`asignar_rol`,{p_usuario_id:e,p_rol:t}),A);if(n)throw Error(n.message||`No se pudo cambiar el rol.`)},async eliminarPersonal(e){let{error:t}=await i(r.rpc(`eliminar_personal`,{p_usuario_id:e}),A);if(t)throw Error(t.message||`No se pudo eliminar la cuenta.`)},async invitarPersonal(e,t){let{data:n,error:a}=await i(r.functions.invoke(`invitar-personal`,{body:{email:e,rol:t}}),A);if(a){let e=a.message;try{let t=await a.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e||`No se pudo enviar la invitación.`)}if(n?.error)throw Error(n.error);return n}},_e={async miPerfil(){let{data:e,error:t}=await i(r.rpc(`mi_perfil`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo cargar tu perfil.`)}return Array.isArray(e)?e[0]:e},async actualizarMiPerfil({nombre:e,telefono:t,cargo:n}){let{error:a}=await i(r.rpc(`actualizar_mi_perfil`,{p_nombre:e,p_telefono:t||null,p_cargo:n||null}),A);if(a)throw N(a)?Error(`Falta ejecutar la migración 008 en Supabase.`):Error(a.message||`No se pudo guardar tu perfil.`)},async actualizarContactoLector(e,{nombre:t,email:n,telefono:a}){let{error:o}=await i(r.rpc(`actualizar_contacto_lector`,{p_lector_id:e,p_nombre:t,p_email:n||null,p_telefono:a||null}),A);if(o)throw N(o)?Error(`Falta ejecutar la migración 008 en Supabase.`):Error(o.message||`No se pudo guardar el contacto del lector.`)}},ve={async verificarDefiniciones(){let{data:e,error:t}=await i(r.rpc(`verificar_definiciones`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo verificar las definiciones.`)}return e||[]},async verificarCirculacion(){let{data:e,error:t}=await i(r.rpc(`verificar_circulacion`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo verificar la circulación.`)}return e||[]},async verificarRls(){let{data:e,error:t}=await i(r.rpc(`verificar_rls`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo verificar RLS.`)}return e||[]},async obtenerAuditoria(e=50){let{data:t,error:n}=await i(r.from(`auditoria`).select(`id, tabla, registro_id, accion, usuario_email, created_at`).order(`created_at`,{ascending:!1}).limit(e),A);if(n){if(n.code===`42P01`||/does not exist|could not find/i.test(n.message||``))return null;throw n}return t||[]}},ye={async resumenErrores(){let{data:e,error:t}=await i(r.rpc(`resumen_errores`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo leer el registro de errores.`)}return Array.isArray(e)?e[0]:e},async listarErrores(e=100,t=!1){let{data:n,error:a}=await i(r.rpc(`listar_errores`,{p_limite:e,p_solo_nuevos:t}),A);if(a){if(N(a))return null;throw Error(a.message||`No se pudo leer el registro de errores.`)}return n||[]},async marcarErrorVisto(e=null){let{error:t}=await i(r.rpc(`marcar_error_visto`,{p_id:e}),A);if(t)throw Error(t.message||`No se pudo marcar el error.`)},async purgarErrores(e=90){let{data:t,error:n}=await i(r.rpc(`purgar_errores`,{p_dias:e}),A);if(n)throw Error(n.message||`No se pudo purgar el registro.`);return t??0}},be={async crearEnlaceEscaneo(e=4){let{data:t,error:n}=await i(r.rpc(`crear_enlace_escaneo`,{p_horas:e}),A);if(n)throw Error(n.message||`No se pudo generar el enlace.`);return t?.[0]||null},async listarEnlacesEscaneo(){let{data:e,error:t}=await i(r.rpc(`listar_enlaces_escaneo`),A);if(t){if(N(t))return null;throw Error(t.message||`No se pudo listar los enlaces.`)}return e||[]},async revocarEnlaceEscaneo(e){let{error:t}=await i(r.rpc(`revocar_enlace_escaneo`,{p_id:e}),A);if(t)throw Error(t.message||`No se pudo revocar el enlace.`)}},xe={async exportarTodo(){let e=[`libros`,`lectores`,`prestamos`],t={generado:new Date().toISOString(),version:1,tablas:{}};for(let n of e){let{data:e,error:i}=await P((e,t)=>r.from(n).select(`*`).range(e,t));if(i)throw Error(`No se pudo respaldar la tabla ${n}: ${i.message}`);t.tablas[n]=e||[]}return t},async obtenerRespaldos(e=5){let{data:t,error:n}=await i(r.from(`respaldos_log`).select(`*`).order(`ejecutado_en`,{ascending:!1}).limit(e),A);if(n){if(n.code===`42P01`||N(n))return[];throw Error(n.message||`No se pudo consultar el estado de los respaldos.`)}return t||[]}},Se={async exportarDatosLector(e){let{data:t,error:n}=await i(r.rpc(`exportar_datos_lector`,{p_rut:e}),A);if(n)throw N(n)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(n.message||`No se pudo exportar los datos.`);return t},async anonimizarLector(e,t){let{error:n}=await i(r.rpc(`anonimizar_lector`,{p_lector_id:e,p_motivo:t}),A);if(n)throw N(n)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(n.message||`No se pudo suprimir los datos.`)},async purgarDatosAntiguos(){let{data:e,error:t}=await i(r.rpc(`purgar_datos_antiguos`),A);if(t)throw N(t)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(t.message||`No se pudo ejecutar la purga.`);return e??0},async evidenciaIncidente(e,t){let{data:n,error:a}=await i(r.rpc(`evidencia_incidente`,{p_desde:e,p_hasta:t}),A);if(a)throw N(a)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(a.message||`No se pudo extraer la evidencia.`);return n}};function F(e){let t=new Date(`${e}T12:00:00Z`),n=new Date(t.toLocaleString(`en-US`,{timeZone:`UTC`})),r=new Date(t.toLocaleString(`en-US`,{timeZone:`America/Santiago`})),i=Math.round((r-n)/6e4),a=i<=0?`-`:`+`,o=Math.abs(i);return`${a}${String(Math.floor(o/60)).padStart(2,`0`)}:${String(o%60).padStart(2,`0`)}`}var Ce={async obtenerEstadisticas(){try{let e=j(),[t,n,a,o,s]=await i(Promise.all([r.from(`libros`).select(`*`,{count:`exact`,head:!0}),r.from(`lectores`).select(`*`,{count:`exact`,head:!0}),r.from(`prestamos`).select(`*`,{count:`exact`,head:!0}).eq(`estado`,`activo`),r.from(`prestamos`).select(`*`,{count:`exact`,head:!0}).eq(`estado`,`devuelto`),r.from(`prestamos`).select(`*`,{count:`exact`,head:!0}).eq(`estado`,`activo`).lt(`fecha_devolucion_esperada`,e)]),A),c=await P((e,t)=>r.from(`libros`).select(`stock`).range(e,t));if(c.error)throw c.error;let l=(c.data||[]).reduce((e,t)=>e+(t.stock||0),0);return{libros:t.count||0,lectores:n.count||0,prestamos:a.count||0,devueltos:o.count||0,noDevueltos:s.count||0,enEstante:l}}catch{return{libros:0,lectores:0,prestamos:0,devueltos:0,noDevueltos:0,enEstante:0}}},async obtenerReporte(e,t){let[n,i,a]=await Promise.all([P((n,i)=>r.from(`prestamos`).select(`id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, libros(id, titulo, autor), libro_titulo_archivado, libro_autor_archivado, lectores(id, nombre, rut)`).gte(`fecha_prestamo`,e).lte(`fecha_prestamo`,t).range(n,i)),P((n,i)=>r.from(`prestamos`).select(`id, fecha_devolucion_real, fecha_devolucion_esperada, libros(id, titulo)`).gte(`fecha_devolucion_real`,e).lte(`fecha_devolucion_real`,t).range(n,i)),P((n,i)=>r.from(`lectores`).select(`id, nombre, rut, created_at`).gte(`created_at`,`${e}T00:00:00${F(e)}`).lte(`created_at`,`${t}T23:59:59${F(t)}`).range(n,i))]),o=[n.error,i.error,a.error].filter(Boolean);if(o.some(e=>e.code===`42703`||/column .* does not exist/i.test(e.message||``)))return{faltaMigracion:!0};if(o.length)throw Error(o[0].message||`No se pudo generar el reporte.`);let s=(n.data||[]).map(e=>({...e,libros:e.libros||(e.libro_titulo_archivado?{id:null,titulo:e.libro_titulo_archivado,autor:e.libro_autor_archivado}:null)})),c=i.data||[],l=a.data||[],u=c.filter(e=>e.fecha_devolucion_real&&e.fecha_devolucion_esperada&&e.fecha_devolucion_real>e.fecha_devolucion_esperada).length,d=(e,t,n)=>{let r=new Map;return e.forEach(e=>{let i=t(e);if(i==null)return;let a=r.get(i)||{etiqueta:n(e),total:0};a.total++,r.set(i,a)}),[...r.values()].sort((e,t)=>t.total-e.total).slice(0,5)};return{faltaMigracion:!1,desde:e,hasta:t,totalPrestamos:s.length,totalDevoluciones:c.length,totalNuevosLectores:l.length,devolucionesAtrasadas:u,topLibros:d(s,e=>e.libros?.id??e.libros?.titulo,e=>e.libros?.titulo||`Sin título`),topLectores:d(s,e=>e.lectores?.id,e=>e.lectores?.nombre||`Sin nombre`),prestamos:s,nuevosLectores:l}}},we={async cancelarReserva(e){let{error:t}=await i(r.rpc(`cancelar_reserva`,{p_reserva_id:e}),A);if(t)throw N(t)?Error(`Falta ejecutar la migración 022 en Supabase para poder cancelar una reserva.`):Error(t.message||`No se pudo cancelar la reserva.`)},async listarReservas(e=null,t=!1){let{data:n,error:a}=await i(r.rpc(`listar_reservas`,{p_libro_id:e,p_incluir_historial:t}),A);if(a){if(N(a))return null;throw Error(a.message||`No se pudieron listar las reservas.`)}return n||[]}};function I(e){return!e?.code}var Te=3e4,Ee=18e5,De=5,Oe={prestar_libro:e=>r.rpc(`prestar_libro`,e),devolver_prestamo:e=>r.rpc(`devolver_prestamo`,e),renovar_prestamo:e=>r.rpc(`renovar_prestamo`,e),reservar_libro:e=>r.rpc(`reservar_libro`,e),retirar_reserva:e=>r.rpc(`retirar_reserva`,e),agregar_libro:async e=>{let{error:t}=await r.from(`libros`).insert([e]);return t||await D.quitarLibroLocalOptimista(e.isbn),{error:t}},agregar_lector:async e=>{let{error:t}=await r.from(`lectores`).insert([e]);return t||await D.quitarLectorLocalOptimista(e.rut),{error:t}}};async function ke(e){let t=await D.buscarLibroLocalPorCodigo(e);if(!t)throw Error(`Sin conexión, y este libro no está en la copia local del mesón.`);return{libro:t,prestamos:[],offline:!0}}async function Ae(e){let t=await D.buscarLectorLocalPorRut(e);if(!t)throw Error(`Sin conexión, y este lector no está en la copia local del mesón (hay que consultarlo antes, con conexión, para poder atenderlo sin ella).`);let n=j(),r=t.prestamosActivosDetalle||[],i=r.filter(e=>e.fechaDevolucionEsperada&&e.fechaDevolucionEsperada<n),a=!t.bloqueadoManual,o=t.bloqueadoManual?je(t.motivoBloqueo):null;if(a&&i.length>0){a=!1;let e=i[0].tituloLibro?` (incluye "${i[0].tituloLibro}")`:``;o=`Tiene ${i.length} libro(s) con la devolución atrasada${e}, según la última sincronización.`}return{existe:!0,offline:!0,lector_id:t.id,nombre:t.nombre,rut:t.rut,email:t.email,telefono:t.telefono,bloqueado_manual:!!t.bloqueadoManual,motivo_bloqueo:t.motivoBloqueo??null,prestamos_activos:r.length,prestamos_atrasados:i.length,atrasados_detalle:i,puede_prestar:a,motivo_rechazo:o}}function je(e){return e?`Bloqueado por la biblioteca: ${e}`:`Bloqueado por la biblioteca.`}async function L(e){if(await D.buscarLibroLocalPorCodigo(e.isbn))throw Error(`El ISBN ya está registrado.`);return await D.guardarLibroLocalOptimista(e),z.encolar(`agregar_libro`,e,`Alta del libro "${e.titulo}" (ISBN ${e.isbn})`)}async function R(e){return await D.guardarLectorLocalOptimista(e),z.encolar(`agregar_lector`,e,`Alta del lector ${e.nombre} (RUT ${e.rut})`)}var z=new class{constructor(){this._reintentando=!1,this._temporizador=null,this._escuchas=new Set}async encolar(e,t,n){let r=await D.encolarOperacion(e,t,n);return this._programarReintento(1e3),await this._avisar(),{encolado:!0,id:r,mensaje:`Sin conexión: la operación se guardó y se completará sola apenas vuelva la red.`}}alCambiar(e){return this._escuchas.add(e),()=>this._escuchas.delete(e)}async _avisar(){if(this._escuchas.size!==0)try{let{pendientes:e}=await this.estado();this._escuchas.forEach(t=>t({pendientes:e,sincronizando:this._reintentando}))}catch{}}_programarReintento(e){typeof window>`u`||(clearTimeout(this._temporizador),this._temporizador=setTimeout(()=>this.reintentarPendientes(),e))}async reintentarPendientes(){if(!this._reintentando){this._reintentando=!0,await this._avisar();try{let e=await D.listarOperacionesPendientes(),t=Date.now();for(let n of e)n.proximoIntentoEn>t||await this._intentarUna(n)}catch{}finally{this._reintentando=!1;let e=await D.listarOperacionesPendientes().catch(()=>[]);if(e.length){let t=Math.min(...e.map(e=>e.proximoIntentoEn));this._programarReintento(Math.max(1e3,t-Date.now()))}await this._avisar()}}}async _intentarUna(e){let t=Oe[e.tipo];if(!t){await D.quitarOperacion(e.id),k.registrarOperacion(`sincronizacion`,Error(`Operación en cola de tipo desconocido: "${e.tipo}".`));return}try{let{error:n}=await t(e.params);if(n){I(n)?await this._reprogramar(e):await this._fallaPermanente(e,n.message||`Rechazado por el servidor.`);return}await D.quitarOperacion(e.id)}catch(t){I(t)?await this._reprogramar(e):await this._fallaPermanente(e,t?.message||String(t))}}async _reprogramar(e){let t=(e.intentos||0)+1,n=Math.min(Te*2**(t-1),Ee);await D.actualizarOperacion(e.id,{intentos:t,proximoIntentoEn:Date.now()+n,ultimoError:`Sin conexión`}),t===De&&k.registrarOperacion(`sincronizacion`,Error(`Una operación pendiente (${e.descripcion||e.tipo}) lleva ${t} intentos sin poder sincronizarse por falta de conexión. Sigue en cola y se seguirá reintentando; revisar la conexión del equipo del mesón.`))}async _fallaPermanente(e,t){await D.quitarOperacion(e.id),k.registrarOperacion(`sincronizacion`,Error(`Operación pendiente (${e.descripcion||e.tipo}) rechazada al sincronizar, no se reintentará: ${t}`))}async estado(){return{pendientes:(await D.listarOperacionesPendientes()).length}}};typeof window<`u`&&window.addEventListener(`online`,()=>z.reintentarPendientes());async function B(e,t,n,a={}){let o;try{o=await i(r.rpc(e,t),A)}catch(r){if(I(r))return z.encolar(e,t,n);throw r}let{data:s,error:c}=o;if(c){if(N(c)&&a.migracionFaltante)throw Error(a.migracionFaltante);if(I(c))return z.encolar(e,t,n);throw Error(c.message||a.porDefecto||`Error en la operación ${e}.`)}return Array.isArray(s)?s[0]:s}var V={async registrarPrestamo(e,t){return B(`prestar_libro`,{p_libro_id:e,p_lector_rut:t},`Préstamo del libro #${e} al RUT ${t}`,{porDefecto:`Fallo al registrar préstamo.`})},async devolverPrestamo(e){return B(`devolver_prestamo`,{p_prestamo_id:e},`Devolución del préstamo #${e}`,{porDefecto:`Error en devolución.`})},async renovarPrestamo(e){return B(`renovar_prestamo`,{p_prestamo_id:e},`Renovación del préstamo #${e}`,{porDefecto:`No se pudo renovar el préstamo.`,migracionFaltante:`Falta ejecutar la migración 005 en Supabase para poder renovar.`})},async reservarLibro(e,t){return B(`reservar_libro`,{p_libro_id:e,p_lector_rut:t},`Reserva del libro #${e} para el RUT ${t}`,{porDefecto:`No se pudo registrar la reserva.`,migracionFaltante:`Falta ejecutar la migración 022 en Supabase para poder reservar.`})},async retirarReserva(e){return B(`retirar_reserva`,{p_reserva_id:e},`Retiro de la reserva #${e}`,{porDefecto:`No se pudo registrar el retiro.`,migracionFaltante:`Falta ejecutar la migración 022 en Supabase para poder retirar una reserva.`})},async consultarLibro(e){let t;try{t=await i(r.rpc(`consultar_libro`,{p_codigo:e}),A)}catch(t){if(I(t))return ke(e);throw t}let{data:n,error:a}=t;if(a){if(N(a))throw Error(`Falta ejecutar la migración 006 en Supabase para usar el mesón.`);if(I(a))return ke(e);throw Error(a.message||`No se pudo consultar el libro.`)}if(!n||n.length===0)return null;let o=n[0];return{libro:{id:o.libro_id,isbn:o.isbn,titulo:o.titulo,autor:o.autor,genero:o.genero,ubicacion:o.ubicacion,portada_url:o.portada_url,copias_totales:o.copias_totales,stock:o.stock},prestamos:n.filter(e=>e.prestamo_id!=null).map(e=>({id:e.prestamo_id,fecha_prestamo:e.fecha_prestamo,fecha_devolucion_esperada:e.fecha_devolucion_esperada,dias_restantes:e.dias_restantes,renovaciones:e.renovaciones,lector:{id:e.lector_id,nombre:e.lector_nombre,rut:e.lector_rut,email:e.lector_email,telefono:e.lector_telefono,bloqueado_manual:e.lector_bloqueado,atrasados:e.lector_atrasados}}))}},async estadoLector(e){let t;try{t=await i(r.rpc(`estado_lector`,{p_rut:e}),A)}catch(t){if(I(t))return Ae(e);throw t}let{data:n,error:a}=t;if(a){if(N(a))throw Error(`Falta ejecutar la migración 006 en Supabase.`);if(I(a))return Ae(e);throw Error(a.message||`No se pudo consultar el lector.`)}let o=Array.isArray(n)?n[0]:n,s;if(o?.existe&&o.lector_id!=null)try{let{data:e}=await i(r.from(`prestamos`).select(`fecha_devolucion_esperada, libros(titulo)`).eq(`lector_id`,o.lector_id).eq(`estado`,`activo`),A);s=(e||[]).map(e=>({fechaDevolucionEsperada:e.fecha_devolucion_esperada??null,tituloLibro:e.libros?.titulo??null}))}catch{s=void 0}return D.guardarLectorConsultado({...o,prestamos_activos_detalle:s}).catch(()=>{}),o},async agregarLibro(e){let t={isbn:e.isbn,titulo:e.titulo,autor:e.autor,genero:e.genero||null,ubicacion:e.ubicacion||null,portada_url:e.portada_url||null,copias_totales:e.stock,stock:e.stock},n;try{n=await i(r.from(`libros`).insert([t]),A)}catch(e){if(I(e))return L(t);throw e}let{error:a}=n;if(a){if(I(a))return L(t);throw Error(a.code===`23505`?`El ISBN ya está registrado.`:`Error al guardar el libro.`)}},async agregarLector(e){let t={rut:e.rut,nombre:e.nombre,email:e.email,telefono:e.telefono,consentimiento_fecha:e.consentimiento_fecha||null,consentimiento_version:e.consentimiento_version||null,es_menor:e.es_menor||!1,apoderado_nombre:e.apoderado_nombre||null,apoderado_rut:e.apoderado_rut||null},n;try{n=await i(r.from(`lectores`).insert([t]),A)}catch(e){if(I(e))return R(t);throw e}let{error:a}=n;if(a){if(I(a))return R(t);throw Error(a.code===`23505`?`El RUT ya está registrado.`:`Error al guardar lector.`)}},...fe,...pe,...me,...he,...ge,..._e,...ve,...ye,...be,...xe,...Se,...Ce,...we},H=new class{constructor(){this._enLinea=typeof navigator<`u`?navigator.onLine!==!1:!0,this._sincronizando=!1,this._pendientes=0,this._escuchas=new Set,this._iniciado=!1}iniciar(){this._iniciado||typeof window>`u`||(this._iniciado=!0,window.addEventListener(`online`,()=>this._actualizar({enLinea:!0})),window.addEventListener(`offline`,()=>this._actualizar({enLinea:!1})),z.alCambiar(({pendientes:e,sincronizando:t})=>{this._actualizar({pendientes:e,sincronizando:t})}),z.estado().then(({pendientes:e})=>this._actualizar({pendientes:e})).catch(()=>{}))}suscribir(e){return this._escuchas.add(e),e(this.obtener()),()=>this._escuchas.delete(e)}obtener(){return{enLinea:this._enLinea,sincronizando:this._sincronizando,pendientes:this._pendientes}}_actualizar(e){e.enLinea!==void 0&&(this._enLinea=e.enLinea),e.sincronizando!==void 0&&(this._sincronizando=e.sincronizando),e.pendientes!==void 0&&(this._pendientes=e.pendientes);let t=this.obtener();this._escuchas.forEach(e=>e(t))}};function U(e){if(e.portada_url)return e.portada_url;let t=(e.isbn||``).replace(/[^0-9Xx]/g,``);return t.length!==10&&t.length!==13?null:`https://covers.openlibrary.org/b/isbn/${t}-M.jpg?default=false`}function Me(e,t=`w-10 h-14`){let n=U(e),r=`<div class="portada-respaldo ${t} rounded shrink-0 flex items-center justify-center font-serif font-bold text-white text-lg select-none">${a((e.titulo||`?`).trim().charAt(0).toUpperCase())}</div>`;return n?`
    <div class="relative ${t} shrink-0">
      ${r}
      <img src="${a(n)}" alt="" loading="lazy" class="portada-img absolute inset-0 ${t} object-cover rounded shadow-sm" />
    </div>`:r}var W=!1;function Ne(){W||(W=!0,document.addEventListener(`error`,e=>{let t=e.target;t instanceof HTMLImageElement&&t.classList.contains(`portada-img`)&&t.remove()},!0))}var G={},K=null;function Pe(){return window.Chart?Promise.resolve():K||(K=new Promise((e,t)=>{let n=document.createElement(`script`);n.src=`vendor/js/chart.umd.js`,n.onload=()=>e(),n.onerror=()=>t(Error(`No se pudo cargar Chart.js`)),document.head.appendChild(n)}),K)}var q=`biblionexo-escala-fuente`;function Fe(){try{let e=localStorage.getItem(q);e&&document.documentElement.style.setProperty(`--escala-fuente`,e)}catch{}}var Ie=class t{constructor(){this.currentView=null,this.currentUserRole=`librero`,this._lastScannedCode=null,this._lastScanTimestamp=0,this.bookPage=0,this.userPage=0,this.loanPage=0,this.catalogSearch=``,this.userSearch=``,this.loanFilter=`todos`,this.reportPeriod=`mes`,this.adminTab=`inventario`,this._parametros=null,this._controlInactividadActivo=!1,this._loansCache=[],this._booksCache=[],this._usersCache=[],this.sesionRenderizada=!1,window.uiManager=this,Fe(),document.getElementById(`login-form`)&&this.initLoginForm()}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}formatRut(e){let t=(e||``).toString().replace(/[.\-\s]/g,``).toUpperCase();return t.length<2?t:`${t.slice(0,-1)}-${t.slice(-1)}`}isValidRut(e){let t=(e||``).toString().replace(/[.\-\s]/g,``).toUpperCase();if(!/^\d{7,8}[0-9K]$/.test(t))return!1;let n=t.slice(0,-1),r=t.slice(-1),i=0,a=2;for(let e=n.length-1;e>=0;e--)i+=Number(n[e])*a,a=a===7?2:a+1;let o=11-i%11;return r===(o===11?`0`:o===10?`K`:String(o))}formatPhone(e){let t=(e||``).toString().replace(/\D/g,``);return t.startsWith(`56`)?t:t.startsWith(`9`)&&t.length===9?`56${t}`:t.length===8?`569${t}`:t}validarPassword(e){return e?e.length<12?`La contraseña debe tener al menos 12 caracteres.`:/[A-Z]/.test(e)?/[0-9]/.test(e)?null:`La contraseña debe tener al menos un número.`:`La contraseña debe tener al menos una letra mayúscula.`:`La contraseña no puede estar vacía.`}validateUserForm(e=!1){let t=document.getElementById(e?`edit-user-id`:`new-user-id`)?.value.trim()||``,n=document.getElementById(e?`edit-user-name`:`new-user-name`)?.value.trim()||``,r=document.getElementById(e?`edit-user-email`:`new-user-email`)?.value.trim()||``,i=document.getElementById(e?`edit-user-phone`:`new-user-phone`)?.value.trim()||``;return n?n.split(/\s+/).length<2?(this.showToast(`Escribe el nombre y al menos un apellido.`,`error`),!1):!t&&!e?(this.showToast(`Escribe el RUT del lector.`,`error`),!1):t&&!this.isValidRut(t)?(this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`),!1):i?this.formatPhone(i).length<11?(this.showToast(`El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.`,`error`),!1):r?this.isValidEmail(r)?!0:(this.showToast(`El correo no es válido.`,`error`),!1):(this.showToast(`Escribe el correo del lector.`,`error`),!1):(this.showToast(`Escribe el teléfono del lector.`,`error`),!1):(this.showToast(`Escribe el nombre completo del lector.`,`error`),!1)}validateBookForm(e=!1){let t=e===!0||e===`edit`,n=t?`edit-book`:e===!1||e===`new`?`new-book`:e,r=document.getElementById(`${n}-isbn`)?.value.trim()||``,i=document.getElementById(`${n}-title`)?.value.trim()||``,a=document.getElementById(`${n}-author`)?.value.trim()||``,o=document.getElementById(`${n}-qty`)?.value||``,s=parseInt(o,10);return!r&&!t?(this.showToast(`El ISBN es obligatorio.`,`error`),!1):i?a?isNaN(s)||s<+!t?(this.showToast(t?`La cantidad no puede ser negativa.`:`La cantidad debe ser al menos 1.`,`error`),!1):!0:(this.showToast(`El autor es obligatorio.`,`error`),!1):(this.showToast(`El título es obligatorio.`,`error`),!1)}initLoginForm(){let e=document.getElementById(`email-input`),t=document.getElementById(`password-input`),n=document.getElementById(`login-form`),r=n.querySelector(`button[type="submit"]`),i=this.createErrorSpan(e),a=this.createErrorSpan(t);e.addEventListener(`input`,()=>{this.isValidEmail(e.value.trim())?this.clearInlineError(e,i):this.showInlineError(e,i,`Correo inválido.`)}),t.addEventListener(`input`,()=>{t.value.length===0?this.showInlineError(t,a,`Contraseña requerida.`):this.clearInlineError(t,a)}),n.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.value.trim(),s=t.value,c=!0;if(o?this.isValidEmail(o)?this.clearInlineError(e,i):(this.showInlineError(e,i,`Correo inválido.`),c=!1):(this.showInlineError(e,i,`El correo es obligatorio.`),c=!1),s?this.clearInlineError(t,a):(this.showInlineError(t,a,`La contraseña es obligatoria.`),c=!1),!c)return;r.disabled=!0;let l=this.showSpinner(r);try{await d(o,s),this.showToast(`Sesión iniciada correctamente.`,`success`)}catch(e){this.showToast(e.message||`Error al iniciar sesión.`,`error`)}finally{r.disabled=!1,this.hideSpinner(l)}})}createErrorSpan(e){let t=e.parentNode.querySelector(`.input-error`);return t||(t=document.createElement(`span`),t.className=`input-error text-xs text-rose-700 mt-1 block font-bold`,e.parentNode.appendChild(t)),t}showInlineError(e,t,n){t.textContent=n,e.classList.add(`border-rose-700`,`ring-rose-700`),e.setAttribute(`aria-invalid`,`true`)}clearInlineError(e,t){t.textContent=``,e.classList.remove(`border-rose-700`,`ring-rose-700`),e.removeAttribute(`aria-invalid`)}showSpinner(e){let t=document.createElement(`span`);return t.className=`spinner ml-2 inline-block border-[3px] border-t-white border-white/30 rounded-full w-4 h-4 animate-spin`,e.appendChild(t),t}hideSpinner(e){e&&e.parentNode&&e.parentNode.removeChild(e)}_diasRestantes(e){let[t,n,r]=j().split(`-`).map(Number),i=new Date(t,n-1,r),[a,o,s]=(e||``).split(`-`).map(Number),c=new Date(a,(o||1)-1,s||1);return Math.round((c-i)/864e5)}_estadoPrestamo(e){let t=this._diasRestantes(e);return t<0?{clave:`vencido`,dias:t,etiqueta:`Atrasado ${Math.abs(t)} ${Math.abs(t)===1?`día`:`días`}`}:t===0?{clave:`porVencer`,dias:t,etiqueta:`Vence hoy`}:t<=this.param(`dias_aviso_previo`)?{clave:`porVencer`,dias:t,etiqueta:`Vence en ${t} ${t===1?`día`:`días`}`}:{clave:`alDia`,dias:t,etiqueta:`Vence en ${t} días`}}_textoAviso(t){let n=this._estadoPrestamo(t.fecha_devolucion_esperada),r=t.lectores?.nombre||`Estimado/a lector/a`,i=t.libros?.titulo||`el libro prestado`,a=this._fechaLegible(t.fecha_devolucion_esperada),o=e.BIBLIOTECA,s=Math.abs(n.dias),c=s===1?`día`:`días`,l;return l=n.clave===`vencido`?`El plazo de devolución de “${i}” venció el ${a}, hace ${s} ${c}.\n\nMientras el libro no sea devuelto, tu inscripción queda suspendida y no podrás llevar otros libros. La suspensión se levanta automáticamente al momento de devolverlo.\n\nTe pedimos acercarte a la biblioteca para regularizar tu situación.`:n.dias===0?`“${i}” debe ser devuelto hoy.\n\nSi no lo devuelves, tu inscripción quedará suspendida y no podrás llevar otros libros hasta regularizar. Si necesitas más tiempo, puedes acercarte a la biblioteca para renovar el préstamo.`:`Te recordamos que “${i}” debe ser devuelto el ${a}, en ${s} ${c}.\n\nPasada esa fecha, tu inscripción queda suspendida y no podrás llevar otros libros hasta devolverlo. Si necesitas más tiempo, puedes renovar el préstamo acercándote a la biblioteca.`,`Hola ${r}:\n\n${l}\n\n${o.nombre}\n${o.direccion} · ${o.telefono}`}_fechaLegible(e){let[t,n,r]=(e||``).split(`-`).map(Number);return t?new Date(t,(n||1)-1,r||1).toLocaleDateString(`es-CL`,{day:`numeric`,month:`long`,year:`numeric`}):e||``}_fechaHoraLegible(e){if(!e)return`—`;let t=new Date(e);return isNaN(t)?e:t.toLocaleString(`es-CL`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`})}showNotifyModal(e){let t=this._textoAviso(e),n=this._estadoPrestamo(e.fecha_devolucion_esperada),r=e.lectores||{},i=this.formatPhone(r.telefono),o=r.email,s=n.clave===`vencido`?`Devolución pendiente en la Biblioteca Municipal de Futrono`:`Recordatorio de devolución — Biblioteca Municipal de Futrono`,c=document.createElement(`div`);c.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,c.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900">Avisar a ${a(r.nombre||`el lector`)}</h3>
          <p class="text-xs text-stone-500 mt-0.5">${a(n.etiqueta)} · ${a(e.libros?.titulo||``)}</p>
        </div>

        <div>
          <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Mensaje</label>
          <textarea id="notify-message" aria-label="Texto del aviso al lector" rows="7" class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white text-sm text-stone-800 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">${a(t)}</textarea>
          <p class="text-[11px] text-stone-500 mt-1">Puedes editarlo antes de enviarlo.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button data-action="whatsapp" ${i.length<11?`disabled`:``}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-bosque hover:bg-[#22392F] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fa-brands fa-whatsapp"></i> WhatsApp
          </button>
          <button data-action="email" ${o?``:`disabled`}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-lago hover:bg-[#14303c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-envelope"></i> Correo
          </button>
          <button data-action="copy"
            class="btn-secundario flex items-center justify-center gap-2 border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-copy"></i> Copiar
          </button>
        </div>
        ${i.length<11||!o?`<p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">Este lector no tiene ${o?``:`correo`}${!o&&i.length<11?` ni `:``}${i.length<11?`teléfono`:``} registrado. Complétalo en la vista Lectores para poder avisarle.</p>`:``}

        <div class="flex justify-end pt-1">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        </div>
      </div>
    `,document.body.appendChild(c);let l=c.querySelector(`#notify-message`),u=this._prepararModal(c);c.querySelector(`[data-action="close"]`).addEventListener(`click`,u),c.addEventListener(`click`,e=>{e.target===c&&u()}),c.querySelector(`[data-action="whatsapp"]`).addEventListener(`click`,()=>{window.open(`https://wa.me/${i}?text=${encodeURIComponent(l.value)}`,`_blank`,`noopener`),u()}),c.querySelector(`[data-action="email"]`).addEventListener(`click`,()=>{window.location.href=`mailto:${o}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(l.value)}`,u()}),c.querySelector(`[data-action="copy"]`).addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(l.value),this.showToast(`Mensaje copiado.`,`success`)}catch{l.select(),this.showToast(`Selecciona y copia el mensaje manualmente.`,`error`)}})}_portadaUrl(e){return U(e)}_portadaHtml(e){return Me(e)}_vigilarPortadas(){Ne()}_paginacionHtml(e,t,n,r){let i=Math.ceil(t/n);return i<=1?``:`
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-stone-200 bg-stone-50/60">
        <p class="text-xs text-stone-500">Mostrando ${e*n+1}–${Math.min((e+1)*n,t)} de ${t}</p>
        <div class="flex items-center gap-1">
          <button data-page="${e-1}" aria-label="Página anterior" ${e===0?`disabled`:``}
            class="${r} px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 text-xs font-bold hover:border-patrimonio-lago disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-chevron-left"></i>
          </button>
          <span class="text-xs text-stone-600 px-2 tabular-nums">${e+1} / ${i}</span>
          <button data-page="${e+1}" aria-label="Página siguiente" ${e>=i-1?`disabled`:``}
            class="${r} px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 text-xs font-bold hover:border-patrimonio-lago disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>`}static get CONSENTIMIENTO(){return{version:`2026-07-v1`,texto:`Los datos que entregues se usan únicamente para administrar tus préstamos y avisarte cuando debas devolver un libro. El responsable es la Ilustre Municipalidad de Futrono. Puedes pedir acceder a tus datos, corregirlos o solicitar su eliminación en el mesón de la biblioteca. No se comparten con terceros ni se usan para otros fines.`}}_bloqueConsentimiento(e=`new`){let n=t.CONSENTIMIENTO;return`
      <div class="border border-stone-300 rounded-xl p-3 bg-stone-50/60 space-y-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">Tratamiento de datos personales</p>
        <p class="text-[11px] text-stone-600 leading-relaxed">${a(n.texto)} <a href="/privacidad.html" target="_blank" rel="noopener" class="text-patrimonio-lago hover:underline">Ver la política completa.</a></p>
        <label class="flex items-start gap-2 cursor-pointer pt-1">
          <input type="checkbox" id="${e}-user-consent" class="mt-0.5 accent-[#7A431D]" />
          <span class="text-[11px] text-stone-700">El lector fue informado y autoriza el uso de sus datos para este fin.</span>
        </label>
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" id="${e}-user-minor" class="mt-0.5 accent-[#7A431D]" />
          <span class="text-[11px] text-stone-700">Es menor de 18 años (requiere autorización del apoderado).</span>
        </label>
        <div id="${e}-guardian-fields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <input id="${e}-guardian-name" aria-label="Nombre del apoderado" placeholder="Nombre del apoderado"
            class="px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago" />
          <input id="${e}-guardian-rut" aria-label="RUT del apoderado" placeholder="RUT del apoderado"
            class="px-3 py-2 border border-stone-300 rounded-md bg-white text-sm font-mono focus:outline-none focus:border-patrimonio-lago" />
        </div>
      </div>`}_bindConsentimiento(e=`new`){let t=document.getElementById(`${e}-user-minor`),n=document.getElementById(`${e}-guardian-fields`);t?.addEventListener(`change`,()=>n?.classList.toggle(`hidden`,!t.checked))}_datosConsentimiento(e=`new`){if(!document.getElementById(`${e}-user-consent`)?.checked)return this.showToast(`Debes confirmar que el lector fue informado sobre el uso de sus datos.`,`error`),null;let n=document.getElementById(`${e}-user-minor`)?.checked||!1,r=document.getElementById(`${e}-guardian-name`)?.value.trim()||``,i=document.getElementById(`${e}-guardian-rut`)?.value.trim()||``;if(n){if(!r)return this.showToast(`Escribe el nombre del apoderado.`,`error`),null;if(!this.isValidRut(i))return this.showToast(`El RUT del apoderado no es válido.`,`error`),null}return{consentimiento_fecha:new Date().toISOString(),consentimiento_version:t.CONSENTIMIENTO.version,es_menor:n,apoderado_nombre:n?r:null,apoderado_rut:n?this.formatRut(i):null}}async cargarParametros(){try{let e=await V.obtenerParametros();e&&(this._parametros=Object.fromEntries(e.map(e=>[e.clave,e.valor])))}catch{this._parametros=null}}param(t){let n={max_prestamos_por_lector:e.MAX_PRESTAMOS_POR_LECTOR,max_renovaciones:e.MAX_RENOVACIONES,dias_aviso_previo:e.DIAS_AVISO_PREVIO,dias_prestamo:7,filas_por_pagina:e.FILAS_POR_PAGINA},r=this._parametros?.[t],i=Number(r);return Number.isFinite(i)&&r!=null&&r!==``?i:n[t]}iniciarControlDeInactividad(e=20){let t=e*60*1e3,n=t-6e4,r=!1,i=()=>{document.getElementById(`aviso-inactividad`)?.remove(),r=!1},a=()=>{if(r)return;r=!0;let e=document.createElement(`div`);e.id=`aviso-inactividad`,e.setAttribute(`role`,`alert`),e.className=`fixed bottom-5 left-5 z-[10001] max-w-xs bg-patrimonio-card border-2 border-amber-400 rounded-xl shadow-2xl p-4`,e.innerHTML=`
        <p class="text-sm font-bold text-stone-900 mb-1">
          <i aria-hidden="true" class="fas fa-clock text-amber-700 mr-1.5"></i>Sesión por cerrarse
        </p>
        <p class="text-xs text-stone-600">Por seguridad, la sesión se cerrará en un minuto por inactividad.</p>
        <button id="seguir-activo-btn" class="btn-madera mt-3 w-full text-white rounded-lg py-2 text-xs font-bold">
          Seguir trabajando
        </button>`,document.body.appendChild(e),document.getElementById(`seguir-activo-btn`).addEventListener(`click`,o)},o=()=>{clearTimeout(this._temporizadorAviso),clearTimeout(this._temporizadorCierre),i(),this._temporizadorAviso=setTimeout(a,n),this._temporizadorCierre=setTimeout(async()=>{this.showToast(`Sesión cerrada por inactividad.`,`error`),await g()},t)};this._inactividadHandler=()=>{r||o()},[`mousedown`,`keydown`,`touchstart`,`scroll`].forEach(e=>{document.addEventListener(e,this._inactividadHandler,{passive:!0})}),o(),this._controlInactividadActivo=!0}limpiarControlDeInactividad(){this._controlInactividadActivo&&=(clearTimeout(this._temporizadorAviso),clearTimeout(this._temporizadorCierre),[`mousedown`,`keydown`,`touchstart`,`scroll`].forEach(e=>{document.removeEventListener(e,this._inactividadHandler)}),this._inactividadHandler=null,!1)}async updateUserInfo(t){this._perfil=null;try{this._perfil=await V.miPerfil()}catch(e){console.warn(`No se pudo cargar el perfil:`,e.message)}this.currentUserEmail=this._perfil?.email||t.email||``,this.currentUserName=this._perfil?.nombre||``,this.currentUserRole=this._perfil?.rol||await ne(t),this.desajusteDeRol=!1,this.currentUserRole!==`admin`&&te(this.currentUserEmail)&&(this.currentUserRole=`admin`,this.desajusteDeRol=!0,console.warn(`El correo ${this.currentUserEmail} figura en CONFIG.ADMIN_EMAILS, pero su fila en la tabla "usuarios" no dice admin. Se muestra la interfaz de administrador, pero el servidor rechazará las acciones hasta que el rol quede asignado en la base de datos.`));let n=e.ROLE_LABELS[this.currentUserRole]||e.ROLE_LABELS.librero,r=document.getElementById(`current-user-name`),i=document.getElementById(`current-user-sub`),a=document.getElementById(`current-user-badge`),o=document.getElementById(`current-user-initial`);r&&(r.textContent=this.currentUserName||this.currentUserEmail),i&&(i.textContent=this.currentUserName?this.currentUserEmail:``),a&&(a.textContent=this._perfil?.cargo||n.title),o&&(o.textContent=(this.currentUserName||this.currentUserEmail||`?`).trim().charAt(0).toUpperCase())}_nombreParaSaludo(){return this.currentUserName?this.currentUserName.split(/\s+/)[0]:(e.ROLE_LABELS[this.currentUserRole]||e.ROLE_LABELS.librero).title}renderNavMenu(){let t=document.getElementById(`nav-menu`);if(!t)return;let n=e.VIEWS_BY_ROLE[this.currentUserRole]||e.VIEWS_BY_ROLE.librero,r=[];n.forEach(e=>{let t=e.section||`General`,n=r.find(e=>e.name===t);n||(n={name:t,items:[]},r.push(n)),n.items.push(e)}),t.innerHTML=r.map(e=>`
      <div class="mb-5">
        <p class="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-stone-500">${a(e.name)}</p>
        <div class="space-y-0.5">
          ${e.items.map(e=>`
            <button
              data-view="${e.id}"
              class="nav-btn w-full px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition text-stone-300 hover:bg-white/10 hover:text-white"
            >
              <i aria-hidden="true" class="fas ${e.icon} w-4 text-center ${e.id===`scanner`?`text-amber-400`:``}"></i>
              <span>${a(e.label)}</span>
            </button>
          `).join(``)}
        </div>
      </div>
    `).join(``),t.querySelectorAll(`.nav-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.switchView(e.dataset.view),document.getElementById(`sidebar`)?.classList.remove(`active`),document.getElementById(`sidebar-overlay`)?.classList.add(`hidden`)})})}_setActiveNavButton(e){document.querySelectorAll(`#nav-menu .nav-btn`).forEach(t=>{let n=t.dataset.view===e;t.classList.toggle(`bg-patrimonio-madera`,n),t.classList.toggle(`text-white`,n),t.classList.toggle(`text-stone-300`,!n)})}async switchView(t){this.currentView=t,this._setActiveNavButton(t);let n=(e.VIEWS_BY_ROLE[this.currentUserRole]||e.VIEWS_BY_ROLE.librero).find(e=>e.id===t),r=document.getElementById(`page-title`);r&&(r.textContent=n?.label||`Dashboard`);let i=this._container();i&&(i.innerHTML=`<div class="flex justify-center py-20"><i aria-hidden="true" class="fas fa-circle-notch fa-spin text-4xl text-patrimonio-lago"></i></div>`);let o={dashboard:()=>this.renderDashboard(),reports:()=>this.renderReports(),catalog:()=>this.renderCatalog(),users:()=>this.renderUsers(),loans:()=>this.renderLoans(),scanner:()=>this.renderScannerView(),admin:()=>this.renderAdmin(),profile:()=>this.renderProfile()};try{await(o[t]||o.dashboard)()}catch(e){console.error(`Fallo al cargar la vista "${t}":`,e),k.registrarOperacion(`cargar la vista ${t}`,e),i&&(i.innerHTML=`
          <div class="catalog-card bg-patrimonio-card rounded-2xl border border-rose-300 p-6 max-w-lg">
            <p class="font-serif font-semibold text-lg text-stone-900 mb-1">No se pudo cargar esta sección</p>
            <p class="text-sm text-stone-600">${a(e?.message||`Error desconocido.`)}</p>
            <button id="retry-view-btn" class="btn-madera mt-4 text-white rounded-xl px-4 py-2 text-sm font-medium">
              <i aria-hidden="true" class="fas fa-rotate-right mr-1.5"></i> Reintentar
            </button>
          </div>`),document.getElementById(`retry-view-btn`)?.addEventListener(`click`,()=>this.switchView(t))}}_container(){return document.getElementById(`views-container`)}_momentoDelDia(){let e=new Date().getHours();return e>=5&&e<9?`amanecer`:e>=9&&e<18?`dia`:e>=18&&e<20?`atardecer`:`noche`}renderNuevaPassword(){let e=this._momentoDelDia();document.body.innerHTML=`
      <div class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div id="login-scene" class="momento-${e}" aria-hidden="true">
          <div class="astro"></div>
          <svg aria-hidden="true" focusable="false" class="absolute inset-x-0 bottom-0 w-full h-[45%]" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0,120 L60,70 L110,110 L170,50 L230,105 L290,65 L340,100 L400,80 L400,200 L0,200 Z" fill="#0F2126" opacity="0.92"></path>
            <path d="M0,150 Q40,130 90,145 T190,140 T290,148 T400,138 L400,200 L0,200 Z" fill="#16302A" opacity="0.92"></path>
            <path d="M0,170 Q100,155 200,170 T400,165 L400,200 L0,200 Z" fill="#0B1E24"></path>
          </svg>
        </div>

        <div class="glass-panel relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-8">
          <h1 class="font-serif font-semibold text-xl text-stone-900 mb-1">Crea tu contraseña nueva</h1>
          <p class="text-xs text-stone-600 mb-5">Debe tener al menos 8 caracteres.</p>

          <form id="new-password-form" class="space-y-4">
            <div>
              <label for="np-1" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Contraseña nueva</label>
              <input id="np-1" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div>
              <label for="np-2" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Repite la contraseña</label>
              <input id="np-2" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <button type="submit" class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm">
              Guardar contraseña
            </button>
          </form>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,document.getElementById(`new-password-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`np-1`).value,n=document.getElementById(`np-2`).value,r=this.validarPassword(t);if(r){this.showToast(r,`error`);return}if(t!==n){this.showToast(`Las dos contraseñas no coinciden.`,`error`);return}let i=e.target.querySelector(`button[type="submit"]`);i.disabled=!0;try{await m(t),this.showToast(`Contraseña guardada. Ya puedes entrar.`,`success`),window.history.replaceState({},``,window.location.pathname),setTimeout(()=>window.location.reload(),1200)}catch(e){this.showToast(e.message||`No se pudo guardar la contraseña.`,`error`),i.disabled=!1}})}renderCompletarInvitacion(){let e=this._momentoDelDia();document.body.innerHTML=`
      <div class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div id="login-scene" class="momento-${e}" aria-hidden="true">
          <div class="astro"></div>
          <svg aria-hidden="true" focusable="false" class="absolute inset-x-0 bottom-0 w-full h-[45%]" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0,120 L60,70 L110,110 L170,50 L230,105 L290,65 L340,100 L400,80 L400,200 L0,200 Z" fill="#0F2126" opacity="0.92"></path>
            <path d="M0,150 Q40,130 90,145 T190,140 T290,148 T400,138 L400,200 L0,200 Z" fill="#16302A" opacity="0.92"></path>
            <path d="M0,170 Q100,155 200,170 T400,165 L400,200 L0,200 Z" fill="#0B1E24"></path>
          </svg>
        </div>

        <div class="glass-panel relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-8">
          <div class="flex items-center gap-2 mb-1">
            <i aria-hidden="true" class="fas fa-book text-patrimonio-madera"></i>
            <h1 class="font-serif font-semibold text-xl text-stone-900">Bienvenido/a a Biblio<span class="text-patrimonio-madera">Nexo</span></h1>
          </div>
          <p class="text-xs text-stone-600 mb-5">Te invitaron a formar parte del equipo. Completa tus datos y crea tu contraseña para empezar.</p>

          <form id="completar-invitacion-form" class="space-y-4">
            <div>
              <label for="ci-nombre" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Nombre completo</label>
              <input id="ci-nombre" type="text" required placeholder="María Antileo Huenchumán"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div>
              <label for="ci-cargo" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Cargo <span class="normal-case font-normal text-stone-500">(opcional)</span></label>
              <input id="ci-cargo" type="text" placeholder="Encargada de biblioteca"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div class="h-px bg-stone-300/70 my-1"></div>
            <div>
              <label for="ci-pass-1" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Contraseña nueva</label>
              <input id="ci-pass-1" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
              <p class="text-[11px] text-stone-500 mt-1">Mínimo 8 caracteres, con al menos una mayúscula y un número.</p>
            </div>
            <div>
              <label for="ci-pass-2" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Repite la contraseña</label>
              <input id="ci-pass-2" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <button type="submit" class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm">
              Crear mi cuenta y entrar
            </button>
          </form>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,document.getElementById(`completar-invitacion-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`ci-nombre`).value.trim(),n=document.getElementById(`ci-cargo`).value.trim(),r=document.getElementById(`ci-pass-1`).value,i=document.getElementById(`ci-pass-2`).value;if(!t){this.showToast(`Escribe tu nombre completo.`,`error`);return}if(t.split(/\s+/).length<2){this.showToast(`Escribe tu nombre y al menos un apellido.`,`error`);return}let a=this.validarPassword(r);if(a){this.showToast(a,`error`);return}if(r!==i){this.showToast(`Las dos contraseñas no coinciden.`,`error`);return}let o=e.target.querySelector(`button[type="submit"]`);o.disabled=!0;try{await m(r);try{await V.actualizarMiPerfil({nombre:t,cargo:n||null,telefono:null})}catch(e){k.registrarOperacion(`completar-invitacion`,e)}this.showToast(`Cuenta activada. Bienvenido/a a BiblioNexo.`,`success`),window.history.replaceState({},``,window.location.pathname),setTimeout(()=>window.location.reload(),1200)}catch(e){this.showToast(e.message||`No se pudo activar la cuenta.`,`error`),o.disabled=!1}})}renderLogin(){this.limpiarControlDeInactividad();let e=this._momentoDelDia();document.body.innerHTML=`
      <div id="login-screen" class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">

        <!-- Escena viva del Lago Ranco: cielo, sol/luna y cordillera cambian con la hora real -->
        <div id="login-scene" class="momento-${e}" aria-hidden="true">
          <div class="estrellas" style="background-image: radial-gradient(1px 1px at 10% 15%, #fff 100%, transparent), radial-gradient(1px 1px at 25% 8%, #fff 100%, transparent), radial-gradient(1.5px 1.5px at 40% 20%, #fff 100%, transparent), radial-gradient(1px 1px at 60% 10%, #fff 100%, transparent), radial-gradient(1px 1px at 75% 22%, #fff 100%, transparent), radial-gradient(1.5px 1.5px at 88% 12%, #fff 100%, transparent), radial-gradient(1px 1px at 95% 28%, #fff 100%, transparent);"></div>
          <div class="astro"></div>
          <svg aria-hidden="true" focusable="false" class="absolute inset-x-0 bottom-0 w-full h-[45%]" viewBox="0 0 400 200" preserveAspectRatio="none">
            <!-- Cordillera y Volcán -->
            <path d="M0,120 L60,70 L110,110 L170,50 L230,105 L290,65 L340,100 L400,80 L400,200 L0,200 Z" fill="#0F2126" opacity="0.92"></path>
            <!-- Bosque nativo -->
            <path d="M0,150 Q40,130 90,145 T190,140 T290,148 T400,138 L400,200 L0,200 Z" fill="#16302A" opacity="0.92"></path>
            <!-- Lago Ranco -->
            <path d="M0,170 Q100,155 200,170 T400,165 L400,200 L0,200 Z" fill="#0B1E24"></path>
            <!-- Reflejo del cielo sobre el agua -->
            <path d="M0,178 Q100,190 200,180 T400,182" stroke="#E8B27C" stroke-width="1.5" fill="none" opacity="0.35"></path>
            <path d="M0,188 Q100,196 200,190 T400,192" stroke="#E8B27C" stroke-width="1" fill="none" opacity="0.2"></path>
          </svg>
        </div>

        <!-- Tarjeta de vidrio esmerilado: flota sobre el paisaje en vez de cortarlo -->
        <div class="glass-panel relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-8 md:p-9">
          <div class="flex items-center gap-2 mb-1">
            <i aria-hidden="true" class="fas fa-book text-patrimonio-madera"></i>
            <h1 class="font-serif font-semibold text-2xl leading-tight text-stone-900">Biblio<span class="text-patrimonio-madera">Nexo</span></h1>
          </div>
          <p class="text-[11px] text-stone-500 font-bold uppercase tracking-wide">Municipalidad de Futrono · Región de Los Ríos</p>
          <p class="text-[11px] text-stone-500 italic font-serif mt-1.5">“Futronhue” — lugar de humo, a orillas del Lago Ranco.</p>

          <div class="h-px bg-stone-300/70 my-5"></div>

          <h2 class="font-serif font-semibold text-lg text-stone-900 mb-1">Iniciar sesión</h2>
          <p class="text-xs text-stone-600 mb-5">Acceso de personal — ingresa con tu cuenta institucional.</p>

          <form id="login-form" class="space-y-4">
            <div>
              <label for="email-input" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
              <input id="email-input" type="email" placeholder="nombre@futrono.cl" autocomplete="username"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="password-input" class="text-[11px] font-black uppercase tracking-wide text-stone-600 block">Contraseña</label>
                <button type="button" id="forgot-password-btn" class="text-[11px] font-bold text-patrimonio-lago hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
              <input id="password-input" type="password" placeholder="••••••••" autocomplete="current-password"
                class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white/90 text-sm text-stone-900 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <button type="submit" class="btn-madera w-full text-white font-sans font-medium rounded-xl shadow py-2.5 text-sm">
              Ingresar <i aria-hidden="true" class="fas fa-arrow-right ml-1"></i>
            </button>
          </form>

          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-stone-300/70"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">o</span>
            <div class="flex-1 h-px bg-stone-300/70"></div>
          </div>

          <button id="google-login-btn" type="button" class="btn-secundario w-full flex items-center justify-center gap-2.5 border border-stone-300 bg-white/70 hover:bg-white text-stone-700 font-medium rounded-xl py-2.5 text-sm">
            <i aria-hidden="true" class="fa-brands fa-google text-[15px]"></i> Continuar con Google
          </button>

          <p style="text-align:center; margin-top:16px;"><a href="/privacidad.html" class="text-[11px] font-bold text-stone-500 hover:underline">Política de privacidad y términos</a></p>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,this.initLoginForm(),document.getElementById(`google-login-btn`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0;try{await f()}catch(e){this.showToast(e.message||`No se pudo iniciar sesión con Google.`,`error`),t.disabled=!1}}),document.getElementById(`forgot-password-btn`).addEventListener(`click`,async()=>{let e=await this.showPrompt(`Ingresa el correo de tu cuenta institucional para recibir el enlace de recuperación.`,{title:`Recuperar contraseña`,placeholder:`nombre@futrono.cl`,confirmText:`Enviar enlace`});if(e){if(!this.isValidEmail(e)){this.showToast(`Ingresa un correo válido.`,`error`);return}try{await p(e),this.showToast(`Si el correo existe, recibirás un enlace para recuperar tu contraseña.`,`success`)}catch(e){this.showToast(e.message||`No se pudo enviar el correo.`,`error`)}}})}async renderShell(e){document.body.innerHTML=`
      <div class="h-screen w-full flex bg-patrimonio-base overflow-hidden">

        <!-- Fondo oscuro para cerrar el menú lateral en móvil -->
        <div id="sidebar-overlay" class="hidden fixed inset-0 bg-patrimonio-lago/50 z-40"></div>

        <!-- Menú lateral: identidad institucional + navegación agrupada por rol -->
        <a href="#views-container" class="skip-link">Saltar al contenido principal</a>
        <aside id="sidebar" class="momento-${this._momentoDelDia()} w-72 shrink-0 text-white flex flex-col z-50">
          <div class="tab-corner px-5 py-5 border-b border-white/10 flex items-center gap-2">
            <i aria-hidden="true" class="fas fa-book text-patrimonio-madera text-lg"></i>
            <div class="leading-none">
              <span class="font-serif font-semibold text-white text-lg block">
                Biblio<span class="text-patrimonio-madera">Nexo</span>
              </span>
              <span class="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Futrono · Región de Los Ríos</span>
            </div>
          </div>

          <nav id="nav-menu" class="flex-1 overflow-y-auto px-3 py-5"></nav>

          <!-- Ficha de usuario: como la tarjeta de un socio de biblioteca.
               Ahora es un botón, porque es el lugar donde uno espera pinchar
               para ver y editar sus propios datos. -->
          <div class="border-t border-white/10 p-4 flex items-center gap-3">
            <button id="perfil-btn" title="Ver y editar mi perfil"
              class="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg -m-1 p-1 hover:bg-white/10 transition">
              <span id="current-user-initial" class="w-9 h-9 rounded-full bg-patrimonio-madera flex items-center justify-center font-black text-sm shrink-0 text-white"></span>
              <span class="min-w-0 flex-1 block">
                <span id="current-user-name" class="text-xs font-bold text-white leading-none truncate block"></span>
                <span id="current-user-sub" class="text-[10px] text-stone-400 leading-none truncate block mt-0.5"></span>
                <span id="current-user-badge" class="stamp-onDark mt-1.5"></span>
              </span>
            </button>
            <button id="logout-btn" title="Cerrar sesión"
              class="w-9 h-9 rounded-lg text-stone-300 hover:bg-white/10 hover:text-white flex items-center justify-center transition shrink-0">
              <i aria-hidden="true" class="fas fa-right-from-bracket"></i>
            </button>
          </div>
        </aside>

        <!-- Columna principal -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Franja de título: como la etiqueta de un cajón de fichero -->
          <div class="franja-titulo bg-patrimonio-card border-b border-stone-300 px-4 md:px-6 py-3 flex items-center gap-3 shrink-0">
            <button id="sidebar-toggle-btn" class="md:hidden w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800">
              <i aria-hidden="true" class="fas fa-bars"></i>
            </button>
            <span class="w-1.5 h-4 bg-patrimonio-madera rounded-sm hidden sm:block"></span>
            <h2 id="page-title" class="font-serif font-semibold text-stone-800 text-base">Dashboard</h2>
            <span id="estado-conexion" class="ml-auto shrink-0"></span>
          </div>

          <main id="views-container" tabindex="-1" aria-label="Contenido principal" class="flex-1 overflow-y-auto p-4 md:p-6"></main>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,document.getElementById(`logout-btn`).addEventListener(`click`,()=>g()),document.getElementById(`perfil-btn`).addEventListener(`click`,()=>this.switchView(`profile`));let t=document.getElementById(`sidebar`),n=document.getElementById(`sidebar-overlay`);document.getElementById(`sidebar-toggle-btn`).addEventListener(`click`,()=>{t.classList.toggle(`active`),n.classList.toggle(`hidden`)}),n.addEventListener(`click`,()=>{t.classList.remove(`active`),n.classList.add(`hidden`)}),k.iniciar(()=>this.currentView),this._vigilarPortadas(),this._detenerEstadoConexion?.(),this._detenerEstadoConexion=H.suscribir(e=>this._renderIndicadorConexion(e)),await this.cargarParametros(),this._controlInactividadActivo||this.iniciarControlDeInactividad(),await this.updateUserInfo(e),this.renderNavMenu(),await this.switchView(this._vistaInicial(this.currentUserRole))}_renderIndicadorConexion({enLinea:e,sincronizando:t,pendientes:n}={}){let r=document.getElementById(`estado-conexion`);if(!r)return;let i=n===1?`pendiente`:`pendientes`,o,s,c;e?t?(o=`bg-patrimonio-lago/10 text-patrimonio-lago`,s=`fa-arrows-rotate fa-spin`,c=`Sincronizando…`):n>0?(o=`bg-amber-100 text-amber-800`,s=`fa-clock`,c=`${n} ${i}`):(o=`bg-emerald-100 text-emerald-800`,s=`fa-circle-check`,c=`En línea`):(o=`bg-rose-100 text-rose-800`,s=`fa-triangle-exclamation`,c=n>0?`Sin conexión · ${n} ${i}`:`Sin conexión`),r.className=`ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${o}`,r.innerHTML=`<i aria-hidden="true" class="fas ${s}"></i><span>${a(c)}</span>`,r.setAttribute(`role`,`status`),r.setAttribute(`aria-label`,`Estado de conexión: ${c}`)}_vistaInicial(t){let n=e.VIEWS_BY_ROLE[t]||e.VIEWS_BY_ROLE.librero,r=new URLSearchParams(window.location.search).get(`vista`);return n.some(e=>e.id===r)?r:n[0].id}async _renderDonut(e,t,n){let r=document.getElementById(e);if(!r)return;let i=r.parentElement;try{await Pe()}catch{i.innerHTML=`
        <div class="h-full flex flex-col items-center justify-center gap-2 text-center">
          <p class="text-sm text-stone-500">No se pudo cargar el gráfico.</p>
          <button class="retry-chart-btn text-xs font-bold text-patrimonio-lago hover:underline">
            <i aria-hidden="true" class="fas fa-rotate-right mr-1"></i> Reintentar
          </button>
        </div>`,i.querySelector(`.retry-chart-btn`)?.addEventListener(`click`,()=>{K=null,i.innerHTML=`<canvas id="${a(e)}"></canvas>`,this._renderDonut(e,t,n)});return}if(!document.getElementById(e))return;let o=n.reduce((e,t)=>e+t.valor,0),s=e=>o===0?0:Math.round(e/o*1e3)/10,c=o>0;G[e]&&(G[e].destroy(),delete G[e]),G[e]=new window.Chart(document.getElementById(e).getContext(`2d`),{type:`doughnut`,data:{labels:n.map(e=>e.etiqueta),datasets:[{data:c?n.map(e=>e.valor):[1],backgroundColor:c?n.map(e=>e.color):[`#E7E5E4`],borderColor:`#FFFFFF`,borderWidth:3,hoverOffset:8}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:`62%`,plugins:{legend:{display:!1},tooltip:{enabled:c,callbacks:{label:e=>` ${e.label}: ${e.parsed} (${s(e.parsed)}%)`},titleFont:{family:`Plus Jakarta Sans`},bodyFont:{family:`Plus Jakarta Sans`}}}}});let l=document.getElementById(`${e}-centro`);l&&(l.innerHTML=`
      <span class="block font-serif font-bold text-3xl text-stone-900 leading-none">${a(String(o))}</span>
      <span class="block text-[10px] uppercase tracking-widest text-stone-500 mt-1">Total</span>`);let u=document.getElementById(t);u&&(u.innerHTML=n.map(e=>`
      <div class="flex items-center gap-2.5 py-1.5">
        <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${a(e.color)}"></span>
        <span class="text-xs text-stone-600 flex-1 truncate">${a(e.etiqueta)}</span>
        <span class="text-xs font-bold text-stone-900 tabular-nums">${a(String(e.valor))}</span>
        <span class="text-[11px] text-stone-500 tabular-nums w-12 text-right">${a(String(s(e.valor)))}%</span>
      </div>
    `).join(``))}_descargar(e,t,n){let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}_avisoMigracion(e,t){return l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl border border-stone-300 p-6 max-w-xl">
        <h3 class="font-serif font-semibold text-lg text-stone-900 mb-2">Falta un paso en la base de datos</h3>
        <p class="text-sm text-stone-600">
          Esta herramienta necesita la migración ${e}. Abre el editor SQL de Supabase y ejecuta
          <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">${t}</code>,
          luego vuelve aquí.
        </p>
      </div>`}_bindPaginacion(e,t,n){e.querySelectorAll(t).forEach(e=>{e.addEventListener(`click`,()=>{e.hasAttribute(`disabled`)||n(Number(e.dataset.page))})})}},Le={showToast(e,t=`success`){t===`error`&&k.registrar(e,{origen:`operacion`,accion:this.currentView||null});let n=document.getElementById(`toast-container`);if(!n)return;let r=document.createElement(`div`),i=t===`success`?`bg-patrimonio-bosque`:t===`error`?`bg-rose-700`:`bg-patrimonio-lago`,o=t===`success`?`fa-check-circle`:t===`error`?`fa-exclamation-triangle`:`fa-info-circle`;r.className=`${i} text-white px-5 py-3.5 rounded-xl shadow-sm font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0 z-50 text-sm`,r.innerHTML=`<i aria-hidden="true" class="fas ${o} text-lg"></i> <span>${a(e)}</span>`,n.appendChild(r),setTimeout(()=>r.classList.remove(`translate-y-10`,`opacity-0`),10),setTimeout(()=>{r.classList.add(`translate-y-10`,`opacity-0`),setTimeout(()=>r.remove(),300)},3500)},showConfirm(e,{title:t=`Confirmar acción`,confirmText:n=`Confirmar`,danger:r=!0}={}){return new Promise(i=>{let o=document.createElement(`div`);o.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,o.innerHTML=`
                <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                    <h3 class="font-serif text-lg font-bold text-stone-900">${a(t)}</h3>
                    <p class="text-stone-600 text-sm">${a(e)}</p>
                    <div class="flex justify-end gap-3 pt-2">
                        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
                        <button data-action="confirm" class="${r?`bg-rose-700 hover:bg-rose-800`:`bg-patrimonio-madera hover:bg-[#633414]`} text-white px-4 py-2 rounded-xl text-sm font-medium">${a(n)}</button>
                    </div>
                </div>
            `,document.body.appendChild(o);let s=!1,c=this._prepararModal(o,{alCerrar:()=>i(s)}),l=e=>{s=e,c()};o.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>l(!1)),o.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>l(!0)),o.addEventListener(`click`,e=>{e.target===o&&l(!1)})})},showPrompt(e,{title:t=`Ingresar dato`,placeholder:n=``,confirmText:r=`Aceptar`}={}){return new Promise(i=>{let o=document.createElement(`div`);o.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,o.innerHTML=`
                <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                    <h3 class="font-serif text-lg font-bold text-stone-900">${a(t)}</h3>
                    <p class="text-stone-600 text-sm">${a(e)}</p>
                    <input id="modal-prompt-input" aria-label="Valor solicitado" type="text" placeholder="${a(n)}"
                        class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
                    <div class="flex justify-end gap-3 pt-2">
                        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
                        <button data-action="confirm" class="bg-patrimonio-madera hover:bg-[#633414] text-white px-4 py-2 rounded-xl text-sm font-medium">${a(r)}</button>
                    </div>
                </div>
            `,document.body.appendChild(o);let s=o.querySelector(`#modal-prompt-input`),c=null,l=this._prepararModal(o,{alCerrar:()=>i(c)}),u=e=>{c=e,l()};o.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>u(null)),o.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>u(s.value.trim()||null)),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&u(s.value.trim()||null)}),o.addEventListener(`click`,e=>{e.target===o&&u(null)}),setTimeout(()=>s.focus(),50)})},_prepararModal(e,{titulo:t,alCerrar:n}={}){let r=document.activeElement,i=e.firstElementChild;e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-modal`,`true`);let a=i?.querySelector(`h1, h2, h3`);a?(a.id||=`modal-titulo-${Math.random().toString(36).slice(2,9)}`,e.setAttribute(`aria-labelledby`,a.id)):t&&e.setAttribute(`aria-label`,t);let o=()=>[...e.querySelectorAll(`button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])`)].filter(e=>e.offsetParent!==null||e===document.activeElement),s=e=>{if(e.key===`Escape`){e.preventDefault(),c();return}if(e.key!==`Tab`)return;let t=o();if(t.length===0)return;let n=t[0],r=t[t.length-1];e.shiftKey&&document.activeElement===n?(e.preventDefault(),r.focus()):!e.shiftKey&&document.activeElement===r&&(e.preventDefault(),n.focus())},c=()=>{document.removeEventListener(`keydown`,s,!0),e.remove(),r&&document.body.contains(r)&&r.focus(),n?.()};return document.addEventListener(`keydown`,s,!0),c}},Re={async renderDashboard(){let t=this._container();if(!t)return;let n=await V.obtenerEstadisticas();if(this.currentView!==`dashboard`)return;let r=e.ROLE_LABELS[this.currentUserRole]||e.ROLE_LABELS.librero,i=this.currentUserRole===`admin`,a=[{label:`Préstamos activos`,value:n.prestamos,icon:`fa-right-left`,color:`text-patrimonio-lago`},{label:`Libros registrados`,value:n.libros,icon:`fa-book`,color:`text-patrimonio-madera`},{label:`Lectores registrados`,value:n.lectores,icon:`fa-users`,color:`text-patrimonio-bosque`},{label:`Préstamos vencidos`,value:n.noDevueltos,icon:`fa-triangle-exclamation`,color:`text-rose-700`}],o=i?[{view:`catalog`,label:`Agregar libro`,icon:`fa-book-medical`},{view:`users`,label:`Agregar lector`,icon:`fa-user-plus`},{view:`loans`,label:`Ver préstamos`,icon:`fa-right-left`}]:[{view:`scanner`,label:`Escanear libro`,icon:`fa-barcode`},{view:`loans`,label:`Ver préstamos`,icon:`fa-right-left`},{view:`catalog`,label:`Buscar en catálogo`,icon:`fa-magnifying-glass`}];t.innerHTML=l`
      ${this.desajusteDeRol?l`
        <div class="mb-5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3" role="alert">
          <p class="text-sm font-bold text-amber-900 mb-1">
            <i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>Tu rol de administrador no está en la base de datos
          </p>
          <p class="text-xs text-amber-800 leading-relaxed">
            Ves el panel de administración porque tu correo figura en <code class="font-mono">config.js</code>,
            pero la tabla <code class="font-mono">usuarios</code> te tiene como librero, y es esa tabla la que
            manda del lado del servidor. Las acciones de administración van a fallar hasta que lo corrijas.
            Ejecuta esto en el editor SQL de Supabase, con tu correo:
          </p>
          <pre class="mt-2 bg-white/70 border border-amber-200 rounded-lg p-2 text-[11px] font-mono overflow-x-auto text-stone-800">insert into public.usuarios (id, email, rol)
select id, email, 'admin' from auth.users where email = '${this.currentUserEmail}'
on conflict (id) do update set rol = 'admin';</pre>
        </div>`:``}

      <div class="mb-5">
        <h3 class="font-serif font-semibold text-xl text-stone-900">Hola, ${this._nombreParaSaludo()}</h3>
        <p class="text-xs text-stone-500">${r.welcome}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        ${a.map(e=>l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
            <i aria-hidden="true" class="fas ${e.icon} ${e.color} text-xl mb-2"></i>
            <p class="font-serif font-semibold text-4xl text-stone-900">${e.value}</p>
            <p class="text-xs text-stone-500 font-bold uppercase tracking-wide mt-1">${e.label}</p>
          </div>
        `)}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Anillo 1: dónde están físicamente las copias en este momento -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Estado del fondo</h3>
          <p class="text-xs text-stone-500 mb-4">Dónde están las copias ahora mismo.</p>
          <div class="relative h-44 mb-3">
            <canvas id="fondo-chart"></canvas>
            <div id="fondo-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
          </div>
          <div id="fondo-legend" class="divide-y divide-stone-100"></div>
        </div>

        <!-- Anillo 2: cómo se comportan los préstamos históricos -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Préstamos</h3>
          <p class="text-xs text-stone-500 mb-4">Devueltos, al día y atrasados.</p>
          <div class="relative h-44 mb-3">
            <canvas id="prestamos-chart"></canvas>
            <div id="prestamos-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
          </div>
          <div id="prestamos-legend" class="divide-y divide-stone-100"></div>
        </div>

        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-4">Accesos rápidos</h3>
          <div class="space-y-2">
            ${o.map(e=>l`
              <button data-quick-view="${e.view}" class="quick-action-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-700 hover:border-patrimonio-madera hover:text-patrimonio-madera transition">
                <i aria-hidden="true" class="fas ${e.icon} w-4 text-center"></i>
                <span>${e.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `,t.querySelectorAll(`.quick-action-btn`).forEach(e=>{e.addEventListener(`click`,()=>this.switchView(e.dataset.quickView))}),this._renderDonut(`fondo-chart`,`fondo-legend`,[{etiqueta:`En estante`,valor:n.enEstante,color:`#7A431D`},{etiqueta:`Prestados`,valor:n.prestamos,color:`#1B3B48`}]),this._renderDonut(`prestamos-chart`,`prestamos-legend`,[{etiqueta:`Devueltos`,valor:n.devueltos,color:`#2C4A3E`},{etiqueta:`Activos al día`,valor:Math.max(0,n.prestamos-n.noDevueltos),color:`#1B3B48`},{etiqueta:`Atrasados`,valor:n.noDevueltos,color:`#be123c`}])}},ze={_rangoPeriodo(e){let t=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=new Date;if(n.setHours(0,0,0,0),e===`dia`)return{desde:t(n),hasta:t(n),titulo:`Hoy`};if(e===`semana`){let e=(n.getDay()+6)%7,r=new Date(n);r.setDate(n.getDate()-e);let i=new Date(r);return i.setDate(r.getDate()+6),{desde:t(r),hasta:t(i),titulo:`Esta semana`}}if(e===`mes`){let e=new Date(n.getFullYear(),n.getMonth(),1),r=new Date(n.getFullYear(),n.getMonth()+1,0);return{desde:t(e),hasta:t(r),titulo:`Este mes`}}let r=new Date(n.getFullYear(),0,1),i=new Date(n.getFullYear(),11,31);return{desde:t(r),hasta:t(i),titulo:`Este año`}},async renderReports(){let t=this._container();if(!t)return;let n=this.reportPeriod||`mes`,r=this._rangoPeriodo(n),i;try{i=await V.obtenerReporte(r.desde,r.hasta)}catch(e){if(this.currentView!==`reports`)return;t.innerHTML=l`<div class="catalog-card bg-patrimonio-card rounded-2xl border border-stone-300 p-6 text-center">
        <p class="text-sm text-stone-600">No se pudo generar el reporte.</p>
        <p class="text-xs text-stone-500 mt-1">${e.message||``}</p>
      </div>`;return}if(this.currentView!==`reports`)return;if(i.faltaMigracion){t.innerHTML=`
        <div class="catalog-card bg-patrimonio-card rounded-2xl border border-stone-300 p-6 max-w-xl">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-2">Falta un paso en la base de datos</h3>
          <p class="text-sm text-stone-600 mb-3">
            Los reportes necesitan saber en qué fecha se hizo cada préstamo, y esa columna todavía no existe.
          </p>
          <p class="text-sm text-stone-600">
            Abre el editor SQL de tu proyecto en Supabase y ejecuta el archivo
            <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">supabase/migrations/004_reportes_portadas_zona_horaria.sql</code>.
            Luego vuelve a esta pantalla.
          </p>
        </div>`;return}let a=(e,t)=>l`
      <button data-period="${e}" class="report-period-btn px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${n===e?`bg-patrimonio-lago text-white border-patrimonio-lago`:`bg-white text-stone-600 border-stone-300 hover:border-patrimonio-lago`}">${t}</button>`,o=[{label:`Préstamos realizados`,valor:i.totalPrestamos,icono:`fa-right-left`,color:`text-patrimonio-lago`},{label:`Devoluciones`,valor:i.totalDevoluciones,icono:`fa-rotate-left`,color:`text-patrimonio-bosque`},{label:`Lectores nuevos`,valor:i.totalNuevosLectores,icono:`fa-user-plus`,color:`text-patrimonio-madera`},{label:`Devueltos con atraso`,valor:i.devolucionesAtrasadas,icono:`fa-triangle-exclamation`,color:`text-rose-700`}],s=(e,t,n)=>l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
        <h3 class="font-serif font-semibold text-lg text-stone-900 mb-3">${e}</h3>
        ${t.length?l`<ol class="space-y-2">${t.map((e,t)=>l`
          <li class="flex items-center gap-3 text-sm">
            <span class="w-5 h-5 rounded bg-stone-100 text-stone-500 text-[10px] font-black flex items-center justify-center shrink-0">${t+1}</span>
            <span class="flex-1 truncate text-stone-700">${e.etiqueta}</span>
            <span class="font-bold text-stone-900 tabular-nums">${e.total}</span>
          </li>`)}</ol>`:l`<p class="text-sm text-stone-500 py-4 text-center">${n}</p>`}
      </div>`;t.innerHTML=l`
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 no-print">
        <div class="flex flex-wrap gap-2">
          ${a(`dia`,`Diario`)}
          ${a(`semana`,`Semanal`)}
          ${a(`mes`,`Mensual`)}
          ${a(`anio`,`Anual`)}
        </div>
        <div class="flex flex-wrap gap-2">
          <button id="backup-btn" class="btn-secundario border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium rounded-xl px-4 py-2 text-sm" title="Descarga una copia completa de libros, lectores y préstamos">
            <i aria-hidden="true" class="fas fa-database mr-1.5"></i> Respaldo completo
          </button>
          <button id="export-csv-btn" class="btn-secundario border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium rounded-xl px-4 py-2 text-sm">
            <i aria-hidden="true" class="fas fa-file-csv mr-1.5"></i> Exportar CSV
          </button>
          <button id="print-report-btn" class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2 text-sm">
            <i aria-hidden="true" class="fas fa-print mr-1.5"></i> Imprimir / PDF
          </button>
        </div>
      </div>

      <div id="report-sheet">
        <!-- Encabezado: se ve principalmente al imprimir -->
        <div class="mb-5 pb-4 border-b border-stone-300">
          <h2 class="font-serif font-semibold text-xl text-stone-900">Reporte de actividad — ${r.titulo}</h2>
          <p class="text-xs text-stone-500 mt-1">
            ${this._fechaLegible(r.desde)} al ${this._fechaLegible(r.hasta)}
            · ${e.BIBLIOTECA.nombreLargo}
          </p>
          <p class="text-[11px] text-stone-500 mt-0.5">Generado el ${this._fechaLegible(this._rangoPeriodo(`dia`).desde)}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          ${o.map(e=>l`
            <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
              <i aria-hidden="true" class="fas ${e.icono} ${e.color} text-xl mb-2"></i>
              <p class="font-serif font-semibold text-4xl text-stone-900">${e.valor}</p>
              <p class="text-xs text-stone-500 font-bold uppercase tracking-wide mt-1">${e.label}</p>
            </div>`)}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Movimiento del período</h3>
            <p class="text-xs text-stone-500 mb-4">Proporción entre lo prestado y lo devuelto.</p>
            <div class="relative h-44 mb-3">
              <canvas id="reporte-chart"></canvas>
              <div id="reporte-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
            </div>
            <div id="reporte-legend" class="divide-y divide-stone-100"></div>
          </div>
          ${s(`Libros más prestados`,i.topLibros,`Sin préstamos en este período.`)}
          ${s(`Lectores más activos`,i.topLectores,`Sin actividad en este período.`)}
        </div>
      </div>
    `,t.querySelectorAll(`.report-period-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.reportPeriod=e.dataset.period,this.renderReports()})}),document.getElementById(`print-report-btn`).addEventListener(`click`,()=>window.print()),document.getElementById(`export-csv-btn`).addEventListener(`click`,()=>this._exportarReporteCsv(i,r)),document.getElementById(`backup-btn`).addEventListener(`click`,async e=>{let t=e.currentTarget,n=t.innerHTML;t.disabled=!0,t.innerHTML=`<i aria-hidden="true" class="fas fa-spinner fa-spin mr-1.5"></i> Preparando…`;try{let e=await V.exportarTodo(),t=Object.values(e.tablas).reduce((e,t)=>e+t.length,0);this._descargar(JSON.stringify(e,null,2),`respaldo-biblionexo-${this._rangoPeriodo(`dia`).desde}.json`,`application/json`),this.showToast(`Respaldo descargado: ${t} registros.`,`success`)}catch(e){this.showToast(e.message||`No se pudo generar el respaldo.`,`error`)}finally{t.disabled=!1,t.innerHTML=n}}),this._renderDonut(`reporte-chart`,`reporte-legend`,[{etiqueta:`Préstamos`,valor:i.totalPrestamos,color:`#1B3B48`},{etiqueta:`Devoluciones`,valor:i.totalDevoluciones,color:`#2C4A3E`},{etiqueta:`Lectores nuevos`,valor:i.totalNuevosLectores,color:`#7A431D`}])},_exportarReporteCsv(t,n){let r=e=>{let t=(e??``).toString();return/^[=+\-@\t\r]/.test(t)&&(t=`'`+t),`"${t.replace(/"/g,`""`)}"`},i=[];i.push([r(`Reporte de actividad`),r(n.titulo)]),i.push([r(`Desde`),r(n.desde),r(`Hasta`),r(n.hasta)]),i.push([r(e.BIBLIOTECA.nombreLargo)]),i.push([]),i.push([r(`RESUMEN`)]),i.push([r(`Préstamos realizados`),r(t.totalPrestamos)]),i.push([r(`Devoluciones`),r(t.totalDevoluciones)]),i.push([r(`Lectores nuevos`),r(t.totalNuevosLectores)]),i.push([r(`Devueltos con atraso`),r(t.devolucionesAtrasadas)]),i.push([]),i.push([r(`DETALLE DE PRÉSTAMOS`)]),i.push([r(`Fecha préstamo`),r(`Libro`),r(`Autor`),r(`Lector`),r(`RUT`),r(`Devolución esperada`),r(`Estado`)]),t.prestamos.forEach(e=>i.push([r(e.fecha_prestamo),r(e.libros?.titulo),r(e.libros?.autor),r(e.lectores?.nombre),r(e.lectores?.rut),r(e.fecha_devolucion_esperada),r(e.estado)])),i.push([]),i.push([r(`LECTORES NUEVOS`)]),i.push([r(`Nombre`),r(`RUT`),r(`Fecha de registro`)]),t.nuevosLectores.forEach(e=>i.push([r(e.nombre),r(e.rut),r((e.created_at||``).split(`T`)[0])]));let a=i.map(e=>e.join(`;`)).join(`\r
`);this._descargar(`﻿`+a,`reporte-biblionexo-${n.desde}-a-${n.hasta}.csv`,`text/csv;charset=utf-8;`),this.showToast(`Reporte exportado.`,`success`)}},J=[{valor:`1`,etiqueta:`Normal`},{valor:`1.15`,etiqueta:`Grande`},{valor:`1.3`,etiqueta:`Muy grande`}];function Be(){let e=`1`;try{e=localStorage.getItem(`biblionexo-escala-fuente`)||`1`}catch{}let t=J.findIndex(t=>t.valor===e);return t===-1?0:t}function Ve(e){let t=J[e];document.documentElement.style.setProperty(`--escala-fuente`,t.valor);try{localStorage.setItem(q,t.valor)}catch{}}var He={async renderProfile(){let t=this._container();if(!t)return;let n=null;try{n=await V.miPerfil()}catch(e){console.warn(`Perfil no disponible:`,e.message)}if(this.currentView!==`profile`)return;if(!n){t.innerHTML=this._avisoMigracion(`008`,`008_perfiles_y_permisos_librero.sql`);return}this._perfil=n;let r=e.ROLE_LABELS[n.rol]||e.ROLE_LABELS.librero,i=(n.nombre||n.email||`?`).trim().charAt(0).toUpperCase(),a=e=>e?new Date(e).toLocaleString(`es-CL`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`Nunca`,o=(e,t,n,r=``,i=``)=>l`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${t}</label>
        <input id="${e}" value="${n??``}" ${s(r)}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
        ${i?l`<p class="text-[11px] text-stone-500 mt-1">${i}</p>`:``}
      </div>`;t.innerHTML=l`
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">

        <!-- Tarjeta de identificación -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-6 text-center h-fit">
          <div class="w-20 h-20 rounded-full bg-patrimonio-madera text-white font-serif font-bold text-3xl flex items-center justify-center mx-auto mb-3">${i}</div>
          <p class="font-serif font-semibold text-lg text-stone-900 leading-tight">${n.nombre||`Sin nombre registrado`}</p>
          <p class="text-xs text-stone-500 mt-0.5 break-all">${n.email||``}</p>
          <div class="mt-3">
            <span class="stamp ${n.rol===`admin`?`stamp-info`:`stamp-success`} !rotate-0">
              <i aria-hidden="true" class="fas ${n.rol===`admin`?`fa-user-shield`:`fa-user`}"></i> ${r.title}
            </span>
          </div>
          ${n.cargo?l`<p class="text-xs text-stone-600 mt-2">${n.cargo}</p>`:``}

          <div class="border-t border-stone-200 mt-5 pt-4 space-y-2.5 text-left">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">Último acceso</p>
              <p class="text-xs text-stone-700">${a(n.ultimo_acceso)}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">Cuenta creada</p>
              <p class="text-xs text-stone-700">${a(n.creado_en)}</p>
            </div>
            ${n.actualizado_en?l`
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">Perfil actualizado</p>
                <p class="text-xs text-stone-700">${a(n.actualizado_en)}</p>
              </div>`:``}
          </div>
        </div>

        <!-- Datos editables y contraseña -->
        <div class="lg:col-span-2 space-y-4">

          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300">
            <div class="catalog-card-header">
              <h3 class="font-serif font-semibold text-lg text-stone-900">Mis datos</h3>
            </div>
            <form id="perfil-form" class="p-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${o(`perfil-nombre`,`Nombre completo`,n.nombre,`required placeholder="María Antileo Huenchumán"`)}
                ${o(`perfil-cargo`,`Cargo`,n.cargo,`placeholder="Encargada de biblioteca"`,`Aparece junto a tu nombre en el menú.`)}
                ${o(`perfil-telefono`,`Teléfono de contacto`,n.telefono,`type="tel" placeholder="9 1234 5678"`,`Uso interno. No se muestra a los lectores.`)}
                <div>
                  <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
                  <input value="${n.email||``}" readonly
                    class="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm text-stone-500" />
                  <p class="text-[11px] text-stone-500 mt-1">Es la identidad de tu cuenta. Solo puede cambiarla un administrador desde Supabase.</p>
                </div>
              </div>
              <div>
                <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Rol</label>
                <input value="${r.title}" readonly
                  class="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm text-stone-500" />
                <p class="text-[11px] text-stone-500 mt-1">
                  Solo un administrador puede cambiar roles, desde Administración → Personal.
                  Tampoco puede hacerlo desde aquí quien tenga el rol: sería concederse permisos a sí mismo.
                </p>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-madera text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow">Guardar cambios</button>
              </div>
            </form>
          </div>

          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300">
            <div class="catalog-card-header">
              <h3 class="font-serif font-semibold text-lg text-stone-900">Cambiar contraseña</h3>
            </div>
            <form id="password-form" class="p-5 space-y-4">
              <p class="text-xs text-stone-500">
                Se pide la contraseña actual a propósito: el computador del mesón queda desatendido, y sin ese
                paso cualquiera podría apropiarse de la cuenta abierta.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                ${o(`pass-actual`,`Contraseña actual`,``,`type="password" autocomplete="current-password" required`)}
                ${o(`pass-nueva`,`Contraseña nueva`,``,`type="password" autocomplete="new-password" required minlength="12"`)}
                ${o(`pass-repetir`,`Repetir la nueva`,``,`type="password" autocomplete="new-password" required minlength="12"`)}
              </div>
              <p class="text-[11px] text-stone-500">
                Mínimo 12 caracteres. Es un sistema del Estado que trata datos personales de vecinos.
              </p>
              <div class="flex justify-end">
                <button type="submit" class="bg-patrimonio-lago hover:bg-[#14303c] text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow transition-colors">Cambiar contraseña</button>
              </div>
            </form>
          </div>

          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Tamaño de letra</h3>
            <p class="text-xs text-stone-500 mb-3">
              Agranda el texto de toda la aplicación. Queda guardado en este equipo.
            </p>
            <div class="flex items-center gap-3 max-w-xs">
              <button id="fuente-menos-btn" type="button" aria-label="Reducir tamaño de letra"
                class="w-11 h-11 shrink-0 rounded-xl border border-stone-300 bg-white hover:border-patrimonio-lago text-stone-700 font-serif font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">A-</button>
              <span id="fuente-nivel-texto" class="text-sm text-stone-600 font-bold flex-1 text-center"></span>
              <button id="fuente-mas-btn" type="button" aria-label="Aumentar tamaño de letra"
                class="w-11 h-11 shrink-0 rounded-xl border border-stone-300 bg-white hover:border-patrimonio-lago text-stone-700 font-serif font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed">A+</button>
            </div>
          </div>

          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Sesión</h3>
            <p class="text-xs text-stone-500 mb-3">
              La sesión se cierra sola tras 20 minutos sin actividad. También puedes cerrarla ahora.
            </p>
            <button id="perfil-logout-btn" class="border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold transition">
              <i aria-hidden="true" class="fas fa-right-from-bracket mr-1.5"></i> Cerrar sesión
            </button>
          </div>

        </div>
      </div>
    `,document.getElementById(`perfil-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target.querySelector(`button[type="submit"]`),r=document.getElementById(`perfil-nombre`).value.trim(),i=document.getElementById(`perfil-telefono`).value.trim();if(!r){this.showToast(`Escribe tu nombre completo.`,`error`);return}if(r.split(/\s+/).length<2){this.showToast(`Escribe tu nombre y al menos un apellido.`,`error`);return}if(i&&this.formatPhone(i).length<11){this.showToast(`El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.`,`error`);return}t.disabled=!0;try{await V.actualizarMiPerfil({nombre:r,telefono:i?this.formatPhone(i):null,cargo:document.getElementById(`perfil-cargo`).value.trim()||null}),this.showToast(`Perfil actualizado.`,`success`),await this.updateUserInfo({id:n.usuario_id,email:n.email}),this.renderProfile()}catch(e){this.showToast(e.message||`No se pudo guardar el perfil.`,`error`),t.disabled=!1}}),document.getElementById(`password-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target.querySelector(`button[type="submit"]`),n=document.getElementById(`pass-actual`).value,r=document.getElementById(`pass-nueva`).value,i=document.getElementById(`pass-repetir`).value,a=this.validarPassword(r);if(a){this.showToast(a,`error`);return}if(r!==i){this.showToast(`Las dos contraseñas nuevas no coinciden.`,`error`);return}if(r===n){this.showToast(`La contraseña nueva debe ser distinta de la actual.`,`error`);return}t.disabled=!0;try{await h(n,r),e.target.reset(),this.showToast(`Contraseña cambiada correctamente.`,`success`)}catch(e){this.showToast(e.message||`No se pudo cambiar la contraseña.`,`error`)}finally{t.disabled=!1}}),document.getElementById(`perfil-logout-btn`).addEventListener(`click`,async()=>{await this.showConfirm(`¿Cerrar la sesión en este equipo?`,{title:`Cerrar sesión`,confirmText:`Cerrar sesión`})&&g()});let c=Be(),u=document.getElementById(`fuente-nivel-texto`),d=()=>{u&&(u.textContent=J[c].etiqueta),document.getElementById(`fuente-menos-btn`).disabled=c===0,document.getElementById(`fuente-mas-btn`).disabled=c===J.length-1};d(),document.getElementById(`fuente-menos-btn`).addEventListener(`click`,()=>{c=Math.max(0,c-1),Ve(c),d()}),document.getElementById(`fuente-mas-btn`).addEventListener(`click`,()=>{c=Math.min(J.length-1,c+1),Ve(c),d()})}},Ue={async renderAdmin(){let e=this._container();if(!e)return;if(this.currentUserRole!==`admin`){e.innerHTML=`<div class="catalog-card bg-patrimonio-card rounded-2xl border border-stone-300 p-6 max-w-md">
        <p class="text-sm text-stone-600"><i aria-hidden="true" class="fas fa-lock mr-1.5"></i>Esta sección es solo para administradores.</p>
      </div>`;return}let t=this.adminTab||`inventario`,n=(e,n,r)=>l`
      <button data-admin-tab="${e}" class="admin-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${t===e?`bg-patrimonio-lago text-white border-patrimonio-lago`:`bg-white text-stone-600 border-stone-300 hover:border-patrimonio-lago`}"><i aria-hidden="true" class="fas ${r} mr-1"></i>${n}</button>`;e.innerHTML=l`
      <div class="flex flex-wrap gap-2 mb-4">
        ${n(`inventario`,`Inventario`,`fa-boxes-stacked`)}
        ${n(`reservas`,`Reservas`,`fa-clock`)}
        ${n(`bloqueados`,`Bloqueados`,`fa-user-lock`)}
        ${n(`personal`,`Personal`,`fa-user-shield`)}
        ${n(`enlaces`,`Enlaces remotos`,`fa-qrcode`)}
        ${n(`eliminados`,`Eliminados`,`fa-trash-can-arrow-up`)}
        ${n(`auditoria`,`Auditoría`,`fa-clipboard-list`)}
        ${n(`cumplimiento`,`Cumplimiento`,`fa-scale-balanced`)}
        ${n(`diagnostico`,`Diagnóstico`,`fa-heart-pulse`)}
      </div>
      <div id="admin-panel"><div class="flex justify-center py-16"><i aria-hidden="true" class="fas fa-circle-notch fa-spin text-3xl text-patrimonio-lago"></i></div></div>
    `,e.querySelectorAll(`.admin-tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.adminTab=e.dataset.adminTab,this.renderAdmin()})});let r=document.getElementById(`admin-panel`),i={inventario:()=>this._adminInventario(r),reservas:()=>this._adminReservas(r),bloqueados:()=>this._adminBloqueados(r),personal:()=>this._adminPersonal(r),enlaces:()=>this._adminEnlacesEscaneo(r),eliminados:()=>this._adminEliminados(r),auditoria:()=>this._adminAuditoria(r),cumplimiento:()=>this._adminCumplimiento(r),diagnostico:()=>this._adminDiagnostico(r)};try{await(i[t]||i.inventario)()}catch(e){r.innerHTML=l`<div class="catalog-card bg-patrimonio-card rounded-2xl border border-stone-300 p-6">
        <p class="text-sm text-stone-600">${e.message||`No se pudo cargar la sección.`}</p></div>`}},async _adminInventario(e){let t=await V.revisarInventario();if(t===null){e.innerHTML=this._avisoMigracion(`006`,`006_bloqueo_inventario_admin.sql`);return}if(t.length===0){e.innerHTML=`
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-6 text-center">
          <i aria-hidden="true" class="fas fa-circle-check text-3xl text-patrimonio-bosque mb-3"></i>
          <p class="font-serif font-semibold text-lg text-stone-900">El inventario cuadra</p>
          <p class="text-sm text-stone-500 mt-1">En todos los libros, los ejemplares disponibles más los prestados coinciden con el total registrado.</p>
        </div>`;return}e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">${t.length} libro${t.length===1?``:`s`} con inventario descuadrado</h3>
          <p class="text-xs text-stone-500 mt-0.5">Los ejemplares disponibles más los prestados no coinciden con el total. Corregir recalcula las disponibles a partir de los préstamos reales.</p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-center px-4 py-3">Total</th>
              <th class="text-center px-4 py-3">Disponibles</th>
              <th class="text-center px-4 py-3">Prestados</th>
              <th class="text-center px-4 py-3">Diferencia</th>
              <th class="text-right px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>l`
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800">${e.titulo}</div>
                  <div class="text-[11px] font-mono text-stone-500">${e.isbn||`sin ISBN`}</div>
                </td>
                <td class="px-4 py-3 text-center tabular-nums">${e.copias_totales}</td>
                <td class="px-4 py-3 text-center tabular-nums ${e.stock<0?`text-rose-700 font-bold`:``}">${e.stock}</td>
                <td class="px-4 py-3 text-center tabular-nums">${e.prestados}</td>
                <td class="px-4 py-3 text-center"><span class="stamp stamp-danger !rotate-0">${e.diferencia>0?`+`:``}${e.diferencia}</span></td>
                <td class="px-4 py-3 text-right">
                  <button class="fix-inv-btn btn-secundario bg-patrimonio-madera text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.libro_id}">Corregir</button>
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.fix-inv-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await V.corregirInventario(e.dataset.id);this.showToast(`Corregido: ${t.copias_totales} ejemplares, ${t.stock} disponibles.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo corregir.`,`error`),e.disabled=!1}})})},async _adminReservas(e){let t=await V.listarReservas();if(t===null){e.innerHTML=this._avisoMigracion(`022`,`022_reservas.sql`);return}if(t.length===0){e.innerHTML=l`
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-6 text-center">
          <i aria-hidden="true" class="fas fa-circle-check text-3xl text-patrimonio-bosque mb-3"></i>
          <p class="font-serif font-semibold text-lg text-stone-900">No hay reservas pendientes</p>
          <p class="text-sm text-stone-500 mt-1">Nadie está esperando un libro en este momento.</p>
        </div>`;return}e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">${t.length} reserva${t.length===1?``:`s`} vigente${t.length===1?``:`s`}</h3>
          <p class="text-xs text-stone-500 mt-0.5">
            "Apartado" significa que el ejemplar ya está separado, físicamente en la biblioteca, esperando que lo
            retiren antes del plazo. "En fila" todavía no tiene un ejemplar propio: espera a que se devuelva uno.
          </p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-left px-4 py-3">Lector</th>
              <th class="text-center px-4 py-3">Situación</th>
              <th class="text-right px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>l`
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800">${e.libro_titulo||`Sin título`}</div>
                  <div class="text-[11px] font-mono text-stone-500">${e.libro_isbn||`sin ISBN`}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-stone-800">${e.lector_nombre}</div>
                  <div class="text-[11px] font-mono text-stone-500">${e.lector_rut}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  ${e.estado===`apartada`?l`
                    <span class="stamp stamp-success !rotate-0">Apartado</span>
                    <div class="text-[11px] text-stone-500 mt-1">Retirar antes del ${this._fechaHoraLegible(e.vence_apartado_en)}</div>`:l`
                    <span class="stamp stamp-info !rotate-0">En fila</span>
                    <div class="text-[11px] text-stone-500 mt-1">Posición ${e.posicion_en_fila}</div>`}
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
                  ${e.estado===`apartada`?l`
                    <button class="retirar-reserva-btn btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.reserva_id}">Retirar</button>`:``}
                  <button class="cancelar-reserva-btn text-rose-700 font-bold" data-id="${e.reserva_id}">Cancelar</button>
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.retirar-reserva-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Confirmar que la persona retiró el ejemplar apartado? Esto registra un préstamo a su nombre.`,{title:`Retirar reserva`,confirmText:`Confirmar retiro`,danger:!1})){e.disabled=!0;try{await V.retirarReserva(e.dataset.id),this.showToast(`Retiro registrado: el préstamo ya quedó a nombre del lector.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo registrar el retiro.`,`error`),e.disabled=!1}}})}),e.querySelectorAll(`.cancelar-reserva-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Cancelar esta reserva? Si ya tenía un ejemplar apartado, pasa a quien sigue en la fila o vuelve a estar disponible para cualquiera.`,{title:`Cancelar reserva`,confirmText:`Cancelar reserva`})){e.disabled=!0;try{await V.cancelarReserva(e.dataset.id),this.showToast(`Reserva cancelada.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo cancelar la reserva.`,`error`),e.disabled=!1}}})})},async _adminBloqueados(e){let t=await V.obtenerBloqueados();if(t===null){e.innerHTML=this._avisoMigracion(`006`,`006_bloqueo_inventario_admin.sql`);return}e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Lectores bloqueados</h3>
          <p class="text-xs text-stone-500 mt-0.5">Solo bloqueos administrativos. Los lectores con libros atrasados quedan suspendidos automáticamente y se liberan al devolver, sin aparecer en esta lista.</p>
        </div>
        ${t.length===0?l`<p class="px-4 py-8 text-center text-sm text-stone-500">Ningún lector tiene bloqueo administrativo.</p>`:l`<table class="w-full text-sm">
              <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Lector</th>
                  <th class="text-left px-4 py-3">Motivo</th>
                  <th class="text-left px-4 py-3">Desde</th>
                  <th class="text-right px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(e=>l`
                  <tr class="border-t border-stone-200">
                    <td class="px-4 py-3">
                      <div class="font-bold text-stone-800">${e.nombre}</div>
                      <div class="text-[11px] font-mono text-stone-500">${e.rut}</div>
                    </td>
                    <td class="px-4 py-3 text-stone-600">${e.motivo_bloqueo||`—`}</td>
                    <td class="px-4 py-3 text-stone-500 text-xs">${e.bloqueado_en?this._fechaLegible(e.bloqueado_en.split(`T`)[0]):`—`}</td>
                    <td class="px-4 py-3 text-right">
                      <button class="unblock-btn btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.id}">Desbloquear</button>
                    </td>
                  </tr>`)}
              </tbody>
            </table>`}
      </div>

      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 mt-4 p-5 max-w-lg">
        <h3 class="font-serif font-semibold text-lg text-stone-900 mb-3">Bloquear un lector</h3>
        <div class="space-y-3">
          <div>
            <label for="block-rut" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
            <input id="block-rut" placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm font-mono focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="block-reason" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Motivo</label>
            <input id="block-reason" placeholder="Pérdida de ejemplar sin reposición" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <button id="block-btn" class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm w-full">Bloquear lector</button>
        </div>
      </div>`,e.querySelectorAll(`.unblock-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Levantar el bloqueo de este lector?`,{title:`Desbloquear`,confirmText:`Desbloquear`,danger:!1}))try{await V.bloquearLector(e.dataset.id,!1),this.showToast(`Lector desbloqueado.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo desbloquear.`,`error`)}})}),document.getElementById(`block-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`block-rut`).value.trim(),n=document.getElementById(`block-reason`).value.trim();if(!this.isValidRut(t)){this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`);return}if(!n){this.showToast(`Escribe el motivo del bloqueo.`,`error`);return}let r=e.currentTarget;r.disabled=!0;try{let e=await V.estadoLector(this.formatRut(t));if(!e.existe){this.showToast(`Ese RUT no está registrado.`,`error`),r.disabled=!1;return}await V.bloquearLector(e.lector_id,!0,n),this.showToast(`${e.nombre} quedó bloqueado.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo bloquear.`,`error`),r.disabled=!1}})},async _adminPersonal(e){let t=await V.listarPersonal();if(t===null){e.innerHTML=this._avisoMigracion(`006`,`006_bloqueo_inventario_admin.sql`);return}e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Personal con acceso</h3>
          <p class="text-xs text-stone-500 mt-0.5">Invita cuentas nuevas más abajo y asigna el rol de cada una aquí. El nombre y el cargo los completa cada persona en su propio perfil.</p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Persona</th>
              <th class="text-left px-4 py-3">Rol</th>
              <th class="text-left px-4 py-3">Último acceso</th>
              <th class="text-right px-4 py-3">Cambiar a</th>
              <th class="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>l`
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800">${e.nombre||`Sin nombre en su perfil`}</div>
                  <div class="text-xs text-stone-500">${e.email}</div>
                  ${e.cargo?l`<div class="text-[11px] text-stone-500 italic">${e.cargo}</div>`:``}
                </td>
                <td class="px-4 py-3">
                  <span class="stamp ${e.rol===`admin`?`stamp-danger`:`stamp-info`} !rotate-0">
                    <i aria-hidden="true" class="fas ${e.rol===`admin`?`fa-user-shield`:`fa-user`}"></i> ${e.rol}
                  </span>
                </td>
                <td class="px-4 py-3 text-stone-500 text-xs">${e.ultimo_acceso?this._fechaLegible(e.ultimo_acceso.split(`T`)[0]):`Nunca`}</td>
                <td class="px-4 py-3 text-right">
                  <button class="role-btn btn-secundario border border-stone-300 bg-white text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                    data-id="${e.usuario_id}" data-rol="${e.rol===`admin`?`librero`:`admin`}">
                    ${e.rol===`admin`?`Librero`:`Administrador`}
                  </button>
                </td>
                <td class="px-4 py-3 text-right">
                  <button class="delete-personal-btn text-rose-700 hover:text-rose-800 p-1.5" title="Eliminar cuenta"
                    data-id="${e.usuario_id}" data-email="${e.email}">
                    <i aria-hidden="true" class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>

      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 mt-4 p-5 max-w-lg">
        <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Invitar personal nuevo</h3>
        <p class="text-xs text-stone-500 mb-3">
          Manda una invitación por correo con el rol ya asignado. La persona la acepta, crea su contraseña y
          queda con acceso de inmediato — sin pasar por el panel de Supabase.
        </p>
        <div class="space-y-3">
          <div>
            <label for="invite-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
            <input id="invite-email" type="email" placeholder="nombre@ejemplo.cl" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="invite-rol" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Rol</label>
            <select id="invite-rol" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">
              <option value="librero">Librero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button id="invite-btn" class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm w-full">
            <i aria-hidden="true" class="fas fa-paper-plane mr-1.5"></i> Enviar invitación
          </button>
        </div>
      </div>`,document.getElementById(`invite-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`invite-email`).value.trim(),n=document.getElementById(`invite-rol`).value;if(!t||!this.isValidEmail(t)){this.showToast(`Escribe un correo válido.`,`error`);return}let r=e.currentTarget;r.disabled=!0;try{await V.invitarPersonal(t,n),this.showToast(`Invitación enviada a ${t}.`,`success`),document.getElementById(`invite-email`).value=``,this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo enviar la invitación.`,`error`),r.disabled=!1}}),e.querySelectorAll(`.role-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.rol;if(await this.showConfirm(`¿Cambiar el rol de esta cuenta a ${t}?`,{title:`Cambiar rol`,confirmText:`Cambiar`,danger:t===`admin`}))try{await V.asignarRol(e.dataset.id,t),this.showToast(`Rol actualizado.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo cambiar el rol.`,`error`)}})}),e.querySelectorAll(`.delete-personal-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Eliminar por completo la cuenta de ${e.dataset.email}? Pierde acceso al sistema de inmediato y no puede deshacerse.`,{title:`Eliminar cuenta`,confirmText:`Eliminar`})){e.disabled=!0;try{await V.eliminarPersonal(e.dataset.id),this.showToast(`Cuenta eliminada.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo eliminar la cuenta.`,`error`),e.disabled=!1}}})})},async _adminEnlacesEscaneo(e){let t=await V.listarEnlacesEscaneo();if(t===null){e.innerHTML=this._avisoMigracion(`014`,`014_enlaces_escaneo_remoto.sql`);return}if(t.length===0){e.innerHTML=l`
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-6 max-w-lg">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Enlaces de escaneo remoto</h3>
          <p class="text-sm text-stone-600">Nadie ha generado un enlace todavía. Se crean desde Mesón, con el botón
            «Escanear desde el celular».</p>
        </div>`;return}e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Enlaces de escaneo remoto</h3>
          <p class="text-xs text-stone-500 mt-0.5">
            Cada uno permite agregar o reponer libros sin iniciar sesión, hasta que vence o se revoca. Se generan
            desde Mesón, con el botón «Escanear desde el celular». Los últimos 200, del más nuevo al más antiguo.
          </p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Generado por</th>
              <th class="text-left px-4 py-3">Vence</th>
              <th class="text-left px-4 py-3">Estado</th>
              <th class="text-left px-4 py-3">Usos</th>
              <th class="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>l`
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3">
                  <div class="text-xs text-stone-500">${e.creado_por_email||`Cuenta eliminada`}</div>
                  <div class="text-[11px] text-stone-500">${this._fechaHoraLegible(e.creado_en)}</div>
                </td>
                <td class="px-4 py-3 text-stone-600 text-xs">${this._fechaHoraLegible(e.expira_en)}</td>
                <td class="px-4 py-3">
                  ${e.vigente?`<span class="stamp stamp-success !rotate-0"><i aria-hidden="true" class="fas fa-check"></i> Vigente</span>`:e.revocado?`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-ban"></i> Revocado</span>`:`<span class="stamp !rotate-0 bg-stone-200 text-stone-600"><i aria-hidden="true" class="fas fa-clock"></i> Vencido</span>`}
                </td>
                <td class="px-4 py-3 text-stone-600 text-xs">
                  ${e.usos}${e.ultimo_uso_en?l`<div class="text-[11px] text-stone-500">último: ${this._fechaHoraLegible(e.ultimo_uso_en)}</div>`:``}
                </td>
                <td class="px-4 py-3 text-right">
                  ${e.vigente?l`
                    <button class="revocar-enlace-btn text-rose-700 hover:text-rose-800 p-1.5" title="Revocar enlace"
                      data-id="${e.id}">
                      <i aria-hidden="true" class="fas fa-ban"></i>
                    </button>`:``}
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.revocar-enlace-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Revocar este enlace? Deja de servir de inmediato, aunque alguien lo tenga guardado.`,{title:`Revocar enlace`,confirmText:`Revocar`})){e.disabled=!0;try{await V.revocarEnlaceEscaneo(e.dataset.id),this.showToast(`Enlace revocado.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo revocar el enlace.`,`error`),e.disabled=!1}}})})},async _adminEliminados(e){let t=await V.listarLibrosEliminados();if(t===null){e.innerHTML=this._avisoMigracion(`021`,`021_papelera_libros.sql`);return}if(t.length===0){e.innerHTML=l`
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-6 max-w-lg">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Libros eliminados</h3>
          <p class="text-sm text-stone-600">Ningún libro eliminado del catálogo está pendiente de restaurar.</p>
        </div>`;return}e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Libros eliminados</h3>
          <p class="text-xs text-stone-500 mt-0.5">
            Se pueden restaurar tal como quedaron justo antes de eliminarse — título, autor, ejemplares y todo su
            historial de préstamos, reenganchado.
          </p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-center px-4 py-3">Ejemplares</th>
              <th class="text-left px-4 py-3">Eliminado</th>
              <th class="text-right px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>l`
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800">${e.titulo||`Sin título`}</div>
                  <div class="text-xs text-stone-500">${e.autor||``}</div>
                  <div class="text-[11px] font-mono text-stone-500">${e.isbn||`sin ISBN`}</div>
                </td>
                <td class="px-4 py-3 text-center tabular-nums">${e.copias_totales??`—`}</td>
                <td class="px-4 py-3 text-stone-500 text-xs">
                  ${this._fechaHoraLegible(e.eliminado_en)}
                  ${e.eliminado_por?l`<div class="text-[11px] text-stone-500">${e.eliminado_por}</div>`:``}
                </td>
                <td class="px-4 py-3 text-right">
                  <button class="restore-book-btn btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.libro_id}">Restaurar</button>
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.restore-book-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Restaurar este libro? Vuelve al catálogo con sus ejemplares y su historial de préstamos.`,{title:`Restaurar libro`,confirmText:`Restaurar`,danger:!1})){e.disabled=!0;try{await V.restaurarLibro(e.dataset.id),this.showToast(`Libro restaurado.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo restaurar.`,`error`),e.disabled=!1}}})})},async _adminAuditoria(e){let t=await V.obtenerAuditoria(100);if(t===null){e.innerHTML=this._avisoMigracion(`005`,`005_renovaciones_auditoria_busqueda.sql`);return}let n=e=>s({INSERT:`<span class="stamp stamp-success !rotate-0"><i aria-hidden="true" class="fas fa-plus"></i> Creó</span>`,UPDATE:`<span class="stamp stamp-info !rotate-0"><i aria-hidden="true" class="fas fa-pen"></i> Modificó</span>`,DELETE:`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-trash"></i> Eliminó</span>`}[e]||String(e??``));e.innerHTML=l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Últimos movimientos</h3>
          <p class="text-xs text-stone-500 mt-0.5">Se registra automáticamente en la base de datos, incluso si alguien escribe directo en las tablas.</p>
        </div>
        ${t.length===0?l`<p class="px-4 py-8 text-center text-sm text-stone-500">Todavía no hay movimientos registrados.</p>`:l`<table class="w-full text-sm">
              <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Cuándo</th>
                  <th class="text-left px-4 py-3">Quién</th>
                  <th class="text-left px-4 py-3">Qué hizo</th>
                  <th class="text-left px-4 py-3">Dónde</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(e=>l`
                  <tr class="border-t border-stone-200">
                    <td class="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">
                      ${new Date(e.created_at).toLocaleString(`es-CL`,{timeZone:`America/Santiago`,dateStyle:`short`,timeStyle:`short`})}
                    </td>
                    <td class="px-4 py-3 text-stone-700 text-xs">${e.usuario_email||`sistema`}</td>
                    <td class="px-4 py-3">${n(e.accion)}</td>
                    <td class="px-4 py-3 text-stone-500 text-xs">${e.tabla} <span class="text-stone-300">#${e.registro_id||`?`}</span></td>
                  </tr>`)}
              </tbody>
            </table>`}
      </div>`},async _adminCumplimiento(e){let[t,n,r,i]=await Promise.all([V.verificarRls(),V.obtenerParametros(),V.verificarCirculacion(),V.obtenerRespaldos(5)]);if(t===null||n===null){e.innerHTML=this._avisoMigracion(`007`,`007_correcciones_y_cumplimiento_legal.sql`);return}let a=t.filter(e=>e.diagnostico!==`Correcto`),o=(r||[]).filter(e=>!e.es_definer),c=i[0]||null;e.innerHTML=l`
      <div class="space-y-4">

        <!-- Respaldo automático -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border ${c&&!c.ok?`border-rose-300`:`border-stone-300`} overflow-hidden">
          <div class="catalog-card-header">
            <h3 class="font-serif font-semibold text-lg text-stone-900">Respaldo automático</h3>
            <p class="text-xs text-stone-500 mt-0.5">
              Una tarea programada (pg_cron) corre todos los días a las 03:00-04:00, hora de Chile, y sube una
              copia completa de los datos a un almacenamiento privado, sin que nadie tenga que apretar un botón.
            </p>
          </div>
          ${i.length===0?l`
            <p class="px-4 py-6 text-center text-sm text-stone-500">
              Todavía no hay ninguna corrida registrada. Si la migración
              <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">018_respaldo_automatico.sql</code>
              recién se aplicó, la primera corrida real llega en la próxima ventana programada.
            </p>`:l`
            <div class="px-4 py-3 border-b border-stone-200 ${c.ok?`bg-patrimonio-bosque/5`:`bg-rose-50`}">
              <p class="text-sm font-bold ${c.ok?`text-patrimonio-bosque`:`text-rose-800`}">
                <i aria-hidden="true" class="fas ${c.ok?`fa-circle-check`:`fa-triangle-exclamation`} mr-1.5"></i>
                Último respaldo: ${c.ok?`correcto`:`falló`}, ${this._fechaLegible(c.ejecutado_en.split(`T`)[0])}
              </p>
              ${!c.ok&&c.mensaje?l`<p class="text-xs text-rose-700 mt-1">${c.mensaje}</p>`:``}
            </div>
            <table class="w-full text-sm">
              <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Fecha</th>
                  <th class="text-center px-4 py-3">Estado</th>
                  <th class="text-right px-4 py-3">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                ${i.map(e=>l`
                  <tr class="border-t border-stone-200">
                    <td class="px-4 py-3 text-stone-600 text-xs">${new Date(e.ejecutado_en).toLocaleString(`es-CL`)}</td>
                    <td class="px-4 py-3 text-center">${e.ok?s(`<i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque"></i>`):s(`<i aria-hidden="true" class="fas fa-circle-xmark text-rose-700"></i>`)}</td>
                    <td class="px-4 py-3 text-right text-stone-500 text-xs tabular-nums">${e.bytes?`${(e.bytes/1024).toFixed(1)} KB`:`—`}</td>
                  </tr>`)}
              </tbody>
            </table>`}
        </div>

        <!-- Seguridad de acceso a los datos -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border ${a.length?`border-rose-300`:`border-stone-300`} shadow-sm overflow-hidden">
          <div class="catalog-card-header">
            <h3 class="font-serif font-semibold text-lg text-stone-900">Protección de las tablas</h3>
            <p class="text-xs text-stone-500 mt-0.5">Sin RLS, cualquiera con la clave pública puede leer y escribir desde la consola del navegador. Ocultar botones no protege nada.</p>
          </div>
          ${a.length?l`
            <div class="bg-rose-50 border-b border-rose-200 px-4 py-3">
              <p class="text-sm font-bold text-rose-800"><i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>${a.length} tabla${a.length===1?``:`s`} sin protección adecuada</p>
            </div>`:``}
          <table class="w-full text-sm">
            <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
              <tr>
                <th class="text-left px-4 py-3">Tabla</th>
                <th class="text-center px-4 py-3">RLS</th>
                <th class="text-center px-4 py-3">Políticas</th>
                <th class="text-left px-4 py-3">Diagnóstico</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(e=>l`
                <tr class="border-t border-stone-200">
                  <td class="px-4 py-3 font-mono text-stone-700">${e.tabla}</td>
                  <td class="px-4 py-3 text-center">${e.rls_activo?s(`<i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque"></i>`):s(`<i aria-hidden="true" class="fas fa-circle-xmark text-rose-700"></i>`)}</td>
                  <td class="px-4 py-3 text-center tabular-nums">${e.politicas}</td>
                  <td class="px-4 py-3 text-xs ${e.diagnostico===`Correcto`?`text-stone-500`:`text-rose-700 font-bold`}">${e.diagnostico}</td>
                </tr>`)}
            </tbody>
          </table>
        </div>

        <!-- Circulación: comprueba que el personal pueda de verdad trabajar -->
        ${r===null?l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-amber-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Funciones de circulación</h3>
            <p class="text-sm text-stone-600">
              Falta ejecutar la migración <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">008_perfiles_y_permisos_librero.sql</code>.
              Hasta entonces no se puede comprobar si el personal con rol librero puede prestar y devolver libros.
            </p>
          </div>`:l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border ${o.length?`border-rose-300`:`border-stone-300`} overflow-hidden">
            <div class="catalog-card-header">
              <h3 class="font-serif font-semibold text-lg text-stone-900">Funciones de circulación</h3>
              <p class="text-xs text-stone-500 mt-0.5">
                Las funciones que escriben deben declararse SECURITY DEFINER. Si no, las mismas políticas RLS
                que protegen las tablas bloquean la escritura, y un préstamo o una devolución pueden fallar
                <span class="font-bold">sin mostrar ningún error</span>: la pantalla dice que se guardó y la base de datos no cambia.
              </p>
            </div>
            ${o.length?l`
              <div class="bg-rose-50 border-b border-rose-200 px-4 py-3">
                <p class="text-sm font-bold text-rose-800"><i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>${o.length} función${o.length===1?``:`es`} en riesgo: el rol librero no podrá operar</p>
              </div>`:``}
            <table class="w-full text-sm">
              <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Función</th>
                  <th class="text-center px-4 py-3">Definer</th>
                  <th class="text-left px-4 py-3">Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                ${r.map(e=>l`
                  <tr class="border-t border-stone-200">
                    <td class="px-4 py-3 font-mono text-stone-700">${e.funcion}</td>
                    <td class="px-4 py-3 text-center">${e.es_definer?s(`<i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque"></i>`):s(`<i aria-hidden="true" class="fas fa-circle-xmark text-rose-700"></i>`)}</td>
                    <td class="px-4 py-3 text-xs ${e.es_definer?`text-stone-500`:`text-rose-700 font-bold`}">${e.diagnostico}</td>
                  </tr>`)}
              </tbody>
            </table>
          </div>`}

        <!-- Derechos del titular -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Derechos del titular</h3>
          <p class="text-xs text-stone-500 mt-0.5 mb-4">
            La Ley 21.719 rige desde el 1 de diciembre de 2026. Un lector puede pedir acceder a sus datos,
            recibirlos en formato reutilizable o solicitar su eliminación. Deja constancia de cada solicitud.
          </p>
          <div class="space-y-3 max-w-md">
            <div>
              <label for="arco-rut" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT del solicitante</label>
              <input id="arco-rut" placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm font-mono focus:outline-none focus:border-patrimonio-lago" />
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="arco-export-btn" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">
                <i aria-hidden="true" class="fas fa-download mr-1.5"></i> Entregar sus datos
              </button>
              <button id="arco-delete-btn" class="btn-secundario bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-xl text-sm font-medium">
                <i aria-hidden="true" class="fas fa-user-slash mr-1.5"></i> Suprimir datos
              </button>
            </div>
            <p class="text-[11px] text-stone-500">
              La supresión borra nombre, RUT y contacto, y conserva el registro estadístico del préstamo sin
              vincularlo a una persona. Es la forma de cumplir el derecho de supresión sin perder la constancia
              de gestión que exige la Ley 20.285 de Transparencia.
            </p>
          </div>
        </div>

        <!-- Conservación -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Plazo de conservación</h3>
          <p class="text-xs text-stone-500 mt-0.5 mb-4">
            No se pueden conservar datos identificables más tiempo del necesario para la finalidad declarada.
            Esta acción anonimiza a los lectores sin actividad en el plazo configurado.
          </p>
          <button id="purge-btn" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-broom mr-1.5"></i> Ejecutar purga por antigüedad
          </button>
        </div>

        <!-- Evidencia de incidentes -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Evidencia para reporte de incidente</h3>
          <p class="text-xs text-stone-500 mt-0.5 mb-4">
            La Ley 21.663 obliga a las municipalidades a dar alerta temprana en 3 horas e informe inicial en 72.
            Esto extrae la actividad del período para adjuntar al reporte al CSIRT Nacional.
          </p>
          <div class="flex flex-wrap gap-2 items-end">
            <div>
              <label for="ev-desde" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Desde</label>
              <input id="ev-desde" type="date" class="px-3 py-2 border border-stone-300 rounded-md bg-white text-sm" />
            </div>
            <div>
              <label for="ev-hasta" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Hasta</label>
              <input id="ev-hasta" type="date" class="px-3 py-2 border border-stone-300 rounded-md bg-white text-sm" />
            </div>
            <button id="ev-btn" class="btn-madera text-white px-4 py-2 rounded-xl text-sm font-medium">
              <i aria-hidden="true" class="fas fa-file-shield mr-1.5"></i> Extraer evidencia
            </button>
          </div>
        </div>

        <!-- Parámetros -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-hidden">
          <div class="catalog-card-header">
            <h3 class="font-serif font-semibold text-lg text-stone-900">Parámetros del sistema</h3>
            <p class="text-xs text-stone-500 mt-0.5">Definidos en la base de datos. La interfaz los lee de aquí, así que no pueden quedar desincronizados.</p>
          </div>
          <table class="w-full text-sm">
            <tbody>
              ${n.map(e=>l`
                <tr class="border-t border-stone-200">
                  <td class="px-4 py-3">
                    <div class="font-mono text-xs text-stone-700">${e.clave}</div>
                    <div class="text-[11px] text-stone-500">${e.descripcion||``}</div>
                  </td>
                  <td class="px-4 py-3 w-32">
                    <input class="param-input w-full px-2 py-1.5 border border-stone-300 rounded-md bg-white text-sm tabular-nums"
                      data-clave="${e.clave}" value="${e.valor}" />
                  </td>
                </tr>`)}
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-stone-200 bg-stone-50/60 flex justify-end">
            <button id="save-params-btn" class="btn-madera text-white px-4 py-2 rounded-xl text-sm font-medium">Guardar parámetros</button>
          </div>
        </div>
      </div>`,document.getElementById(`arco-export-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`arco-rut`).value.trim();if(!this.isValidRut(t))return this.showToast(`El RUT no es válido.`,`error`);let n=e.currentTarget;n.disabled=!0;try{let e=await V.exportarDatosLector(this.formatRut(t));this._descargar(JSON.stringify(e,null,2),`datos-personales-${this.formatRut(t)}.json`,`application/json`),this.showToast(`Datos entregados. Guarda constancia de la solicitud.`,`success`)}catch(e){this.showToast(e.message||`No se pudo exportar.`,`error`)}finally{n.disabled=!1}}),document.getElementById(`arco-delete-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`arco-rut`).value.trim();if(!this.isValidRut(e))return this.showToast(`El RUT no es válido.`,`error`);let t=await V.estadoLector(this.formatRut(e));if(!t.existe)return this.showToast(`Ese RUT no está registrado.`,`error`);if(!await this.showConfirm(`Se borrarán el nombre, RUT y contacto de ${t.nombre}. El historial se conservará sin vincularlo a ninguna persona. Esta acción no se puede deshacer.`,{title:`Suprimir datos personales`,confirmText:`Suprimir`}))return;let n=await this.showPrompt(`Deja constancia del motivo (queda en la auditoría):`,{title:`Motivo de la supresión`,placeholder:`Solicitud del titular del 26/07/2026`,confirmText:`Confirmar`});if(n){if(n.trim().length<10)return this.showToast(`El motivo debe tener al menos 10 caracteres para la auditoría.`,`error`);try{await V.anonimizarLector(t.lector_id,n),this.showToast(`Datos personales suprimidos.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo suprimir.`,`error`)}}}),document.getElementById(`purge-btn`).addEventListener(`click`,async e=>{if(!await this.showConfirm(`Se anonimizarán todos los lectores sin actividad en el plazo configurado. No se puede deshacer.`,{title:`Purga por antigüedad`,confirmText:`Ejecutar`}))return;let t=e.currentTarget;t.disabled=!0;try{let e=await V.purgarDatosAntiguos();this.showToast(e===0?`No había titulares que superaran el plazo.`:`${e} titular(es) anonimizado(s).`,`success`)}catch(e){this.showToast(e.message||`No se pudo ejecutar la purga.`,`error`)}finally{t.disabled=!1}});let u=this._rangoPeriodo(`dia`).desde;document.getElementById(`ev-hasta`).value=u,document.getElementById(`ev-desde`).value=u,document.getElementById(`ev-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`ev-desde`).value,n=document.getElementById(`ev-hasta`).value;if(!t||!n)return this.showToast(`Elige el rango de fechas.`,`error`);let r=e.currentTarget;r.disabled=!0;try{let e=await V.evidenciaIncidente(`${t}T00:00:00`,`${n}T23:59:59`);this._descargar(JSON.stringify(e,null,2),`evidencia-incidente-${t}-a-${n}.json`,`application/json`),this.showToast(`Evidencia extraída.`,`success`)}catch(e){this.showToast(e.message||`No se pudo extraer la evidencia.`,`error`)}finally{r.disabled=!1}}),document.getElementById(`save-params-btn`).addEventListener(`click`,async t=>{let n=t.currentTarget;n.disabled=!0;try{for(let t of e.querySelectorAll(`.param-input`))await V.actualizarParametro(t.dataset.clave,t.value.trim());await this.cargarParametros(),this.showToast(`Parámetros guardados.`,`success`)}catch(e){this.showToast(e.message||`No se pudieron guardar.`,`error`)}finally{n.disabled=!1}})},async _adminDiagnostico(e){let[t,n,r]=await Promise.all([V.resumenErrores(),V.listarErrores(100,!1),V.verificarDefiniciones()]);if(t===null||n===null){e.innerHTML=this._avisoMigracion(`009`,`009_registro_de_errores.sql`);return}let i=e=>e?new Date(e).toLocaleString(`es-CL`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}):`—`,a=(e,t,n=`text-stone-900`)=>l`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
        <p class="font-serif font-semibold text-4xl ${n}">${t}</p>
        <p class="text-xs text-stone-500 font-bold uppercase tracking-wide mt-1">${e}</p>
      </div>`,o=(r||[]).filter(e=>e.estado!==`Correcto`);e.innerHTML=l`
      <div class="space-y-4">

        ${r===null?l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-amber-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Definiciones de funciones</h3>
            <p class="text-sm text-stone-600">
              Falta ejecutar la migración <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">010_consolidacion.sql</code>.
              Sin ella no se puede comprobar si alguna función quedó fuera de norma.
            </p>
          </div>`:o.length?l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-rose-300 overflow-hidden">
            <div class="bg-rose-50 border-b border-rose-200 px-4 py-3">
              <p class="text-sm font-bold text-rose-800">
                <i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>${o.length} función${o.length===1?``:`es`} fuera de norma
              </p>
              <p class="text-xs text-rose-700 mt-1">
                Alguien redefinió una función fuera de la migración 010. Vuelve a ejecutarla para repararlo.
              </p>
            </div>
            <div class="divide-y divide-stone-200">
              ${o.map(e=>l`
                <div class="px-4 py-3">
                  <p class="text-sm font-bold text-stone-800 font-mono">${e.nombre}
                    <span class="stamp stamp-danger !rotate-0 !text-[9px] !py-0.5 !px-1.5 ml-1">${e.estado}</span>
                  </p>
                  <p class="text-xs text-stone-600 mt-1">${e.diagnostico}</p>
                </div>`)}
            </div>
          </div>`:l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 px-4 py-3 flex items-center gap-3">
            <i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque text-lg"></i>
            <div>
              <p class="text-sm font-bold text-stone-800">Las ${r.length} funciones coinciden con la migración 010</p>
              <p class="text-xs text-stone-500">Ninguna perdió su nivel de acceso ni quedó duplicada.</p>
            </div>
          </div>`}

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${a(`Sin revisar`,t.sin_revisar??0,(t.sin_revisar??0)>0?`text-rose-700`:`text-stone-900`)}
          ${a(`Últimas 24 horas`,t.ultimas_24h??0,(t.ultimas_24h??0)>0?`text-amber-700`:`text-stone-900`)}
          ${a(`Total registrado`,t.total??0)}
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
            <p class="font-serif font-semibold text-lg text-stone-900 leading-tight">${i(t.mas_reciente)}</p>
            <p class="text-xs text-stone-500 font-bold uppercase tracking-wide mt-1">Más reciente</p>
          </div>
        </div>

        ${(t.total??0)===0?l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-8 text-center">
            <i aria-hidden="true" class="fas fa-circle-check text-3xl text-patrimonio-bosque mb-3"></i>
            <p class="font-serif font-semibold text-lg text-stone-900">Sin fallos registrados</p>
            <p class="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Desde que se activó el registro no se ha capturado ningún error. Si acabas de ejecutar la
              migración 009, esto es lo esperable: la bitácora empieza vacía.
            </p>
          </div>`:l`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-hidden">
            <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 class="font-serif font-semibold text-lg text-stone-900">Últimos fallos</h3>
                <p class="text-xs text-stone-500 mt-0.5">
                  Nada de esto sale del proyecto: se guarda en tu propia base de datos. Los RUT, correos y
                  teléfonos se reemplazan antes de registrar.
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button id="marcar-todos-btn" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <i aria-hidden="true" class="fas fa-check-double mr-1"></i> Marcar revisados
                </button>
                <button id="purgar-errores-btn" class="btn-secundario border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <i aria-hidden="true" class="fas fa-broom mr-1"></i> Purgar antiguos
                </button>
              </div>
            </div>
            <div class="divide-y divide-stone-200 max-h-[32rem] overflow-y-auto">
              ${n.map(e=>l`
                <div class="px-4 py-3 ${e.visto?`opacity-60`:``}">
                  <div class="flex items-start justify-between gap-3 flex-wrap">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-stone-800 break-words">${e.mensaje}</p>
                      <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span class="stamp ${e.origen===`js`?`stamp-danger`:`stamp-info`} !rotate-0 !text-[9px] !py-0.5 !px-1.5">
                          ${e.origen===`js`?`fallo del navegador`:`operación`}
                        </span>
                        ${e.vista?l`<span class="stamp stamp-success !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-window-maximize"></i> ${e.vista}</span>`:``}
                        ${e.repeticiones>1?l`<span class="stamp stamp-danger !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-repeat"></i> ${e.repeticiones} veces</span>`:``}
                      </div>
                      <p class="text-[11px] text-stone-500 mt-1.5">
                        ${i(e.ocurrido_en)}
                        ${e.usuario_email?` · `+e.usuario_email:``}
                        ${e.navegador?` · `+e.navegador:``}
                      </p>
                      ${e.detalle?l`
                        <details class="mt-1.5">
                          <summary class="text-[11px] text-patrimonio-lago cursor-pointer font-bold">Ver detalle técnico</summary>
                          <pre class="mt-1 bg-stone-50 border border-stone-200 rounded-lg p-2 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap text-stone-600">${e.detalle}</pre>
                        </details>`:``}
                    </div>
                    ${e.visto?``:l`
                      <button data-visto="${e.id}" class="btn-secundario shrink-0 border border-stone-300 bg-white text-stone-600 px-2.5 py-1 rounded-lg text-[11px] font-bold" title="Marcar como revisado">
                        <i aria-hidden="true" class="fas fa-check"></i>
                      </button>`}
                  </div>
                </div>`)}
            </div>
          </div>`}

        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Qué se registra y qué no</h3>
          <p class="text-xs text-stone-600 leading-relaxed">
            Se guarda el mensaje del fallo, la vista donde ocurrió, el correo de quien tenía la sesión y el
            navegador. <span class="font-bold">No</span> se guarda el contenido de la pantalla ni ningún dato de
            un lector: los RUT, correos y teléfonos que pudieran aparecer en un mensaje se reemplazan antes de
            enviarlo. Nada se transmite a un servicio externo, para no abrir una transferencia de datos
            personales que habría que declarar bajo la Ley 21.719.
          </p>
        </div>

      </div>`,e.querySelectorAll(`[data-visto]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{await V.marcarErrorVisto(Number(e.dataset.visto)),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo marcar.`,`error`),e.disabled=!1}})}),document.getElementById(`marcar-todos-btn`)?.addEventListener(`click`,async()=>{try{await V.marcarErrorVisto(null),this.showToast(`Todos marcados como revisados.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo marcar.`,`error`)}}),document.getElementById(`purgar-errores-btn`)?.addEventListener(`click`,async()=>{if(await this.showConfirm(`Se borrarán los fallos de más de 90 días. El registro técnico no tiene por qué conservarse indefinidamente.`,{title:`Purgar registro`,confirmText:`Purgar`}))try{let e=await V.purgarErrores(90);this.showToast(`${e} registro${e===1?``:`s`} eliminado${e===1?``:`s`}.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo purgar.`,`error`)}})}},Y={async obtenerLibros(e=``,t=0,n=25){return V.obtenerLibros(e,t,n)},async consultarLibro(e){return V.consultarLibro(e)},async agregarLibro(e){return V.agregarLibro(e)},async actualizarLibro(e,t){return V.actualizarLibro(e,t)},async eliminarLibro(e){return V.eliminarLibro(e)},async listarLibrosEliminados(){return V.listarLibrosEliminados()},async restaurarLibro(e){return V.restaurarLibro(e)},async ajustarCopias(e,t){return V.ajustarCopias(e,t)}},We={async renderCatalog(){let e=this._container();if(!e)return;let t=this.param(`filas_por_pagina`),{libros:n,total:r}=await Y.obtenerLibros(this.catalogSearch||``,this.bookPage,t);if(this.currentView!==`catalog`)return;if(n.length===0&&this.bookPage>0)return this.bookPage=Math.max(0,Math.ceil(r/t)-1),this.renderCatalog();e.innerHTML=`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 mb-6">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Agregar libro</h3>
        </div>
        <form id="add-book-form" class="grid grid-cols-2 md:grid-cols-6 gap-3 p-5">
          <input id="new-book-isbn" aria-label="ISBN del libro" placeholder="ISBN" class="col-span-2 md:col-span-1 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-title" aria-label="Título del libro" placeholder="Título" class="col-span-2 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-author" aria-label="Autor del libro" placeholder="Autor" class="col-span-2 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-genre" aria-label="Género del libro" placeholder="Género" class="px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-location" aria-label="Ubicación en la biblioteca" placeholder="Ubicación" class="px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-qty" aria-label="Cantidad de ejemplares" type="number" min="1" value="1" placeholder="Cantidad" class="px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <button type="submit" class="btn-madera col-span-2 md:col-span-1 text-white font-sans font-medium rounded-xl shadow py-2 text-sm">Agregar</button>
        </form>
      </div>
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Catálogo de libros</h3>
          <div class="relative sm:w-64">
            <i aria-hidden="true" class="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
            <input id="catalog-search-input" aria-label="Buscar en el catálogo por título, autor o ISBN" type="text" placeholder="Buscar por título, autor o ISBN..." value="${a(this.catalogSearch||``)}"
              class="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-md bg-white focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Obra</th>
              <th class="text-left px-4 py-3">ISBN</th>
              <th class="text-center px-4 py-3">Disponibles</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody id="catalog-tbody">${this._renderBookRows(n)}</tbody>
        </table>
        <div id="catalog-pagination">${this._paginacionHtml(this.bookPage,r,t,`catalog-page-btn`)}</div>
      </div>
    `,this._booksCache=n,document.getElementById(`add-book-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),this.validateBookForm(!1))try{let e=await Y.agregarLibro({isbn:document.getElementById(`new-book-isbn`).value.trim(),titulo:document.getElementById(`new-book-title`).value.trim(),autor:document.getElementById(`new-book-author`).value.trim(),genero:document.getElementById(`new-book-genre`).value.trim(),ubicacion:document.getElementById(`new-book-location`).value.trim(),stock:Number(document.getElementById(`new-book-qty`).value||1)});this.showToast(e?.encolado?e.mensaje:`Libro agregado.`,e?.encolado?`info`:`success`),this.renderCatalog()}catch(e){this.showToast(e.message||`No se pudo agregar el libro.`,`error`)}}),this._bindCatalogRowEvents(e),this._bindPaginacion(e,`.catalog-page-btn`,e=>{this.bookPage=e,this.renderCatalog()});let i=document.getElementById(`catalog-search-input`);i.addEventListener(`input`,()=>{clearTimeout(this._catalogSearchTimer),this._catalogSearchTimer=setTimeout(async()=>{this.catalogSearch=i.value.trim(),this.bookPage=0;let{libros:n,total:r}=await Y.obtenerLibros(this.catalogSearch,0,t),a=document.getElementById(`catalog-tbody`);if(this.currentView!==`catalog`||!a)return;this._booksCache=n,a.innerHTML=this._renderBookRows(n);let o=document.getElementById(`catalog-pagination`);o&&(o.innerHTML=this._paginacionHtml(0,r,t,`catalog-page-btn`),this._bindPaginacion(e,`.catalog-page-btn`,e=>{this.bookPage=e,this.renderCatalog()})),this._bindCatalogRowEvents(e)},350)})},_renderBookRows(e){return e.map(e=>`
      <tr class="border-t border-stone-200">
        <td class="px-4 py-3">
          <div class="flex items-start gap-3">
            ${this._portadaHtml(e)}
            <div class="min-w-0">
              <div class="font-bold text-stone-800">${a(e.titulo)}</div>
              <div class="text-xs text-stone-500">${a(e.autor)}</div>
              ${e.genero||e.ubicacion?`
                <div class="flex flex-wrap gap-1 mt-1">
                  ${e.genero?`<span class="stamp stamp-info !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-tag"></i> ${a(e.genero)}</span>`:``}
                  ${e.ubicacion?`<span class="stamp stamp-success !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-location-dot"></i> ${a(e.ubicacion)}</span>`:``}
                </div>`:``}
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-stone-500">${a(e.isbn)}</td>
        <td class="px-4 py-3 text-center">${e.stock}</td>
        <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
          ${e.stock>0?`<button class="loan-book-btn text-patrimonio-lago font-bold" data-id="${e.id}">Prestar</button>`:`<button class="reserve-book-btn text-patrimonio-lago font-bold" data-id="${e.id}">Reservar</button>`}
          ${this.currentUserRole===`admin`?`
            <button class="edit-book-btn text-stone-500 hover:text-patrimonio-madera font-bold" data-id="${e.id}">Editar</button>
            <button class="delete-book-btn text-rose-700 font-bold" data-id="${e.id}">Eliminar</button>`:``}
        </td>
      </tr>
    `).join(``)||`<tr><td colspan="4" class="px-4 py-6 text-center text-stone-500">Sin libros que coincidan con la búsqueda.</td></tr>`},_bindCatalogRowEvents(e){e.querySelectorAll(`.delete-book-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Eliminar este libro? Esta acción no se puede deshacer.`,{title:`Eliminar libro`,confirmText:`Eliminar`}))try{await Y.eliminarLibro(e.dataset.id),this.showToast(`Libro eliminado.`,`success`),this.renderCatalog()}catch(e){this.showToast(e.message||`No se pudo eliminar.`,`error`)}})}),e.querySelectorAll(`.loan-book-btn`).forEach(e=>{e.addEventListener(`click`,()=>this.promptCreateLoan(e.dataset.id))}),e.querySelectorAll(`.reserve-book-btn`).forEach(e=>{e.addEventListener(`click`,()=>this.promptCreateReserva(e.dataset.id))}),e.querySelectorAll(`.edit-book-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=(this._booksCache||[]).find(t=>String(t.id)===String(e.dataset.id));t&&this.showEditBookModal(t)})})},showEditBookModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let n=(e,t,n,r=``)=>`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${t}</label>
        <input id="${e}" value="${a(n??``)}" ${r}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;t.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="font-serif text-lg font-bold text-stone-900">Editar libro</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${n(`edit-book-title`,`Título`,e.titulo)}
          ${n(`edit-book-author`,`Autor`,e.autor)}
          ${n(`edit-book-isbn`,`ISBN`,e.isbn)}
          ${n(`edit-book-qty`,`Ejemplares en total`,e.copias_totales??e.stock,`type="number" min="0"`)}
          ${n(`edit-book-genre`,`Género`,e.genero)}
          ${n(`edit-book-location`,`Ubicación`,e.ubicacion)}
        </div>
        <p class="text-[11px] text-stone-500 -mt-1">
          Escribe cuántos ejemplares tiene la biblioteca en total. El sistema calcula solo cuántos están
          disponibles según los préstamos activos${(e.copias_totales??e.stock)-(e.stock??0)>0?` (ahora hay ${(e.copias_totales??e.stock)-(e.stock??0)} prestado(s))`:``}.
        </p>
        <div>
          ${n(`edit-book-plazo`,`Plazo de préstamo propio (días, opcional)`,e.dias_prestamo_override,`type="number" min="0" placeholder="Usa el plazo general"`)}
          <p class="text-[11px] text-stone-500 mt-1">
            Déjalo vacío para usar el plazo general del sistema. Escribe <span class="font-mono">0</span> para
            material de referencia que no circula (no se puede prestar). Cualquier otro número reemplaza el
            plazo general solo para este libro.
          </p>
        </div>
        ${n(`edit-book-cover`,`URL de portada (opcional)`,e.portada_url,`placeholder="https://..."`)}
        <p class="text-[11px] text-stone-500">Usa este campo para las obras locales y patrimoniales, que no aparecen en catálogos internacionales.</p>
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Guardar cambios</button>
        </div>
      </div>`,document.body.appendChild(t);let r=this._prepararModal(t);t.querySelector(`[data-action="cancel"]`).addEventListener(`click`,r),t.addEventListener(`click`,e=>{e.target===t&&r()}),t.querySelector(`[data-action="save"]`).addEventListener(`click`,async t=>{if(!this.validateBookForm(!0))return;let n=t.currentTarget;n.disabled=!0;try{let t=document.getElementById(`edit-book-plazo`).value.trim();await Y.actualizarLibro(e.id,{titulo:document.getElementById(`edit-book-title`).value.trim(),autor:document.getElementById(`edit-book-author`).value.trim(),isbn:document.getElementById(`edit-book-isbn`).value.trim(),genero:document.getElementById(`edit-book-genre`).value.trim(),ubicacion:document.getElementById(`edit-book-location`).value.trim(),portada_url:document.getElementById(`edit-book-cover`).value.trim(),diasPrestamoOverride:t===``?null:Number(t)});let n=Number(document.getElementById(`edit-book-qty`).value||0);n!==(e.copias_totales??e.stock)&&await Y.ajustarCopias(e.id,n),r(),this.showToast(`Libro actualizado.`,`success`),this.renderCatalog()}catch(e){this.showToast(e.message||`No se pudo guardar.`,`error`),n.disabled=!1}})},async promptCreateLoan(e){await this.flujoPrestamo(e,()=>{this.currentView===`catalog`&&this.renderCatalog()})},async promptCreateReserva(e){await this.flujoReserva(e,()=>{this.currentView===`catalog`&&this.renderCatalog()})}},X={async obtenerLectores(e=``,t=0,n=25){return V.obtenerLectores(e,t,n)},async estadoLector(e){return V.estadoLector(e)},async agregarLector(e){return V.agregarLector(e)},async actualizarLector(e,t){return V.actualizarLector(e,t)},async eliminarLector(e,t){return V.eliminarLector(e,t)},async actualizarContactoLector(e,t){return V.actualizarContactoLector(e,t)}},Ge={_renderUserRows(e){return e.map(e=>`
      <tr class="border-t border-stone-200">
        <td class="px-4 py-3 font-bold text-stone-800">${a(e.nombre)}</td>
        <td class="px-4 py-3 text-stone-600 font-mono">${a(e.rut)}</td>
        <td class="px-4 py-3 text-stone-600">
          <div>${a(e.email||`—`)}</div>
          <div class="text-xs text-stone-500">${a(e.telefono||`—`)}</div>
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
          <button class="edit-user-btn text-stone-500 hover:text-patrimonio-madera font-bold" data-id="${e.id}">Editar</button>
          ${this.currentUserRole===`admin`?`<button class="delete-user-btn text-rose-700 font-bold" data-id="${e.id}">Eliminar</button>`:``}
        </td>
      </tr>
    `).join(``)||`<tr><td colspan="4" class="px-4 py-6 text-center text-stone-500">${this.userSearch?`Ningún lector coincide con la búsqueda.`:`Sin lectores registrados. Agrega el primero con el formulario de arriba.`}</td></tr>`},_bindUserRowEvents(e){e.querySelectorAll(`.delete-user-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Eliminar este usuario? Esta acción no se puede deshacer.`,{title:`Eliminar lector`,confirmText:`Eliminar`}))try{await X.eliminarLector(e.dataset.id),this.showToast(`Usuario eliminado.`,`success`),this.renderUsers()}catch(e){this.showToast(e.message||`No se pudo eliminar.`,`error`)}})}),e.querySelectorAll(`.edit-user-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=(this._usersCache||[]).find(t=>String(t.id)===String(e.dataset.id));t&&this.showEditUserModal(t)})})},async renderUsers(e=!1){let t=this._container();if(!t)return;let n=this.param(`filas_por_pagina`),{lectores:r,total:i}=await X.obtenerLectores(this.userSearch||``,this.userPage,n);if(this.currentView!==`users`)return;if(r.length===0&&this.userPage>0)return this.userPage=Math.max(0,Math.ceil(i/n)-1),this.renderUsers(e);if(this._usersCache=r,e){let e=t.querySelector(`tbody`);if(e){e.innerHTML=this._renderUserRows(r);let a=t.querySelector(`#users-pagination`);a&&(a.innerHTML=this._paginacionHtml(this.userPage,i,n,`user-page-btn`)),this._bindUserRowEvents(t),this._bindPaginacion(t,`.user-page-btn`,e=>{this.userPage=e,this.renderUsers(!0)})}return}t.innerHTML=`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 mb-6">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Agregar lector</h3>
        </div>
        <form id="add-user-form" class="p-5">
          <p class="text-xs text-stone-500 mb-4">Todos los datos son obligatorios. El correo y el teléfono se usan para avisar cuando un préstamo está por vencer.</p>          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="new-user-name" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Nombre completo</label>
              <input id="new-user-name" required placeholder="María Antileo Huenchumán" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
            <div>
              <label for="new-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
              <input id="new-user-id" required placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm font-mono" />
            </div>
            <div>
              <label for="new-user-phone" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Teléfono</label>
              <input id="new-user-phone" required type="tel" placeholder="9 1234 5678" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
            <div>
              <label for="new-user-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
              <input id="new-user-email" required type="email" placeholder="nombre@correo.cl" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
          </div>
          <div class="mt-4">${this._bloqueConsentimiento(`new`)}</div>
          <button type="submit" class="btn-madera mt-4 w-full md:w-auto md:px-8 text-white font-sans font-medium rounded-xl shadow py-2.5 text-sm">Agregar lector</button>
        </form>
      </div>
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Lectores registrados</h3>
          <div class="relative sm:w-64">
            <i aria-hidden="true" class="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
            <input id="user-search-input" aria-label="Buscar lector por nombre, RUT o correo" type="text" placeholder="Buscar por nombre, RUT o correo..." value="${a(this.userSearch||``)}"
              class="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-md bg-white focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Lector</th>
              <th class="text-left px-4 py-3">RUT</th>
              <th class="text-left px-4 py-3">Contacto</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${this._renderUserRows(r)}
          </tbody>
        </table>
        <div id="users-pagination">${this._paginacionHtml(this.userPage,i,n,`user-page-btn`)}</div>
      </div>
    `,document.getElementById(`add-user-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),this.validateUserForm(!1))try{let e=this._datosConsentimiento(`new`);if(!e)return;let t=await X.agregarLector({rut:this.formatRut(document.getElementById(`new-user-id`).value),nombre:document.getElementById(`new-user-name`).value.trim(),email:document.getElementById(`new-user-email`).value.trim().toLowerCase(),telefono:this.formatPhone(document.getElementById(`new-user-phone`).value),...e});this.showToast(t?.encolado?t.mensaje:`Lector agregado.`,t?.encolado?`info`:`success`),this.renderUsers()}catch(e){this.showToast(e.message||`No se pudo agregar el lector.`,`error`)}}),this._bindUserRowEvents(t),this._bindConsentimiento(`new`),this._bindPaginacion(t,`.user-page-btn`,e=>{this.userPage=e,this.renderUsers(!0)});let o=document.getElementById(`user-search-input`);o.addEventListener(`input`,()=>{clearTimeout(this._userSearchTimer),this._userSearchTimer=setTimeout(()=>{this.userSearch=o.value.trim(),this.userPage=0,this.renderUsers(!0)},350)})},showEditUserModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let n=(e,t,n,r=``)=>`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${t}</label>
        <input id="${e}" value="${a(n??``)}" ${r}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`,r=this.currentUserRole===`admin`;t.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900">Editar lector</h3>
        <div class="space-y-3">
          ${n(`edit-user-name`,`Nombre completo`,e.nombre)}
          ${r?n(`edit-user-id`,`RUT`,e.rut):`<div>
                 <label for="edit-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
                 <input id="edit-user-id" value="${a(e.rut??``)}" readonly
                   class="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm font-mono text-stone-500" />
                 <p class="text-[11px] text-stone-500 mt-1">Solo un administrador puede corregir un RUT.</p>
               </div>`}
          ${n(`edit-user-phone`,`Teléfono`,e.telefono,`type="tel"`)}
          ${n(`edit-user-email`,`Correo`,e.email,`type="email"`)}
        </div>
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Guardar cambios</button>
        </div>
      </div>`,document.body.appendChild(t);let i=this._prepararModal(t);t.querySelector(`[data-action="cancel"]`).addEventListener(`click`,i),t.addEventListener(`click`,e=>{e.target===t&&i()}),t.querySelector(`[data-action="save"]`).addEventListener(`click`,async t=>{if(!this.validateUserForm(!0))return;let n=t.currentTarget;n.disabled=!0;try{let t={nombre:document.getElementById(`edit-user-name`).value.trim(),email:document.getElementById(`edit-user-email`).value.trim().toLowerCase(),telefono:this.formatPhone(document.getElementById(`edit-user-phone`).value)};r?await X.actualizarLector(e.id,{...t,rut:this.formatRut(document.getElementById(`edit-user-id`).value)}):await X.actualizarContactoLector(e.id,t),i(),this.showToast(`Lector actualizado.`,`success`),this.renderUsers()}catch(e){this.showToast(e.message||`No se pudo guardar.`,`error`),n.disabled=!1}})}},Z={async obtenerPrestamos(e=`activos`,t=0,n=25,r=2){return V.obtenerPrestamos(e,t,n,r)},async obtenerPendientesDeAviso(e=2){return V.obtenerPendientesDeAviso(e)},async registrarPrestamo(e,t){return V.registrarPrestamo(e,t)},async devolverPrestamo(e){return V.devolverPrestamo(e)},async renovarPrestamo(e){return V.renovarPrestamo(e)}},Ke={async reservarLibro(e,t){return V.reservarLibro(e,t)},async retirarReserva(e){return V.retirarReserva(e)},async cancelarReserva(e){return V.cancelarReserva(e)},async listarReservas(e){return V.listarReservas(e)}},qe={async renderLoans(){let e=this._container();if(!e)return;let t=this.loanFilter||`todos`,n=this.param(`filas_por_pagina`),r=this.param(`dias_aviso_previo`),{prestamos:i,total:o,conteos:s}=await Z.obtenerPrestamos(t,this.loanPage,n,r);if(this.currentView!==`loans`)return;if(i.length===0&&this.loanPage>0)return this.loanPage=Math.max(0,Math.ceil(o/n)-1),this.renderLoans();this._loansCache=i;let c=s.vencidos+s.porVencer,l=(e,n,r,i)=>`
      <button data-filter="${e}" class="loan-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold border transition ${t===e?`bg-patrimonio-lago text-white border-patrimonio-lago`:`bg-white text-stone-600 border-stone-300 hover:border-patrimonio-lago`}">
        ${n} <span class="${t===e?`text-white/70`:i}">${r}</span>
      </button>`;e.innerHTML=`
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-2">
          ${l(`todos`,`Todos`,s.todos,`text-stone-500`)}
          ${l(`vencidos`,`Atrasados`,s.vencidos,`text-rose-700`)}
          ${l(`porVencer`,`Por vencer`,s.porVencer,`text-amber-700`)}
        </div>
        <button id="notify-all-btn" ${c===0?`disabled`:``}
          class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <i aria-hidden="true" class="fas fa-bell mr-1.5"></i> Avisar a los pendientes (${c})
        </button>
      </div>

      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header flex items-center justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Préstamos activos</h3>
          <span class="text-[11px] text-stone-500"><i aria-hidden="true" class="fas fa-circle-info mr-1"></i>Máx. ${this.param(`max_prestamos_por_lector`)} por lector</span>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-left px-4 py-3">Lector</th>
              <th class="text-left px-4 py-3">Devolución</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${i.map(e=>{let t=this._estadoPrestamo(e.fecha_devolucion_esperada),n=!e.lectores?.email&&this.formatPhone(e.lectores?.telefono).length<11,r=t.clave===`vencido`?`text-rose-700 font-bold`:t.clave===`porVencer`?`text-amber-700 font-bold`:`text-stone-600`;return`
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3 font-bold text-stone-800">${a(e.libros?.titulo)}</td>
                <td class="px-4 py-3 text-stone-600">
                  <div>${a(e.lectores?.nombre)}</div>
                  <div class="text-[11px] text-stone-500 font-mono">${a(e.lectores?.rut||``)}</div>
                </td>
                <td class="px-4 py-3 ${r}">
                  <div>${this._fechaLegible(e.fecha_devolucion_esperada)}</div>
                  ${t.clave===`vencido`?`<span class="stamp stamp-danger mt-1"><i aria-hidden="true" class="fas fa-triangle-exclamation"></i> ${a(t.etiqueta)}</span>`:`<div class="text-[11px] font-medium ${t.clave===`porVencer`?`text-amber-700`:`text-stone-500`}">${a(t.etiqueta)}</div>`}
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap space-x-3">
                  ${t.clave===`alDia`?``:`
                    <button class="notify-loan-btn font-bold ${n?`text-stone-500`:`text-patrimonio-madera`}" data-id="${e.id}"
                      title="${n?`Sin datos de contacto`:`Enviar aviso al lector`}">
                      <i aria-hidden="true" class="fas fa-bell"></i> Avisar
                    </button>`}
                  ${t.clave!==`vencido`&&(e.renovaciones??0)<this.param(`max_renovaciones`)?`
                    <button class="renew-loan-btn text-patrimonio-lago font-bold" data-id="${e.id}"
                      title="Extiende 7 días. Quedan ${this.param(`max_renovaciones`)-(e.renovaciones??0)}.">
                      <i aria-hidden="true" class="fas fa-clock-rotate-left"></i> Renovar
                    </button>`:``}
                  <button class="return-loan-btn text-patrimonio-bosque font-bold" data-id="${e.id}">Devolver</button>
                </td>
              </tr>
            `}).join(``)||`<tr><td colspan="4" class="px-4 py-8 text-center text-stone-500">${t===`vencidos`?`No hay préstamos atrasados.`:t===`porVencer`?`No hay préstamos por vencer.`:`No hay préstamos activos.`}</td></tr>`}
          </tbody>
        </table>
        <div id="loans-pagination">${this._paginacionHtml(this.loanPage,o,n,`loan-page-btn`)}</div>
      </div>
    `,this._bindPaginacion(e,`.loan-page-btn`,e=>{this.loanPage=e,this.renderLoans()}),e.querySelectorAll(`.loan-filter-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.loanFilter=e.dataset.filter,this.loanPage=0,this.renderLoans()})}),e.querySelectorAll(`.notify-loan-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=this._loansCache.find(t=>String(t.id)===String(e.dataset.id));t&&this.showNotifyModal(t)})}),document.getElementById(`notify-all-btn`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0;try{let e=await Z.obtenerPendientesDeAviso(r);this.showBulkNotifyModal(e)}catch(e){this.showToast(e.message||`No se pudo cargar la lista de avisos.`,`error`)}finally{t.disabled=!1}}),e.querySelectorAll(`.renew-loan-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await Z.renovarPrestamo(e.dataset.id);if(t?.encolado)this.showToast(t.mensaje,`info`);else{let e=t?.nueva_fecha?this._fechaLegible(t.nueva_fecha):`la nueva fecha`;this.showToast(`Préstamo renovado hasta el ${e}.`,`success`)}this.renderLoans()}catch(t){this.showToast(t.message||`No se pudo renovar.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`.return-loan-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{try{let t=await Z.devolverPrestamo(e.dataset.id);t?.encolado?this.showToast(t.mensaje,`info`):this.showToast(`Préstamo devuelto.`,`success`),this.renderLoans()}catch(e){this.showToast(e.message||`No se pudo registrar la devolución.`,`error`)}})})},showBulkNotifyModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,t.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
        <div class="p-6 pb-4">
          <h3 class="font-serif text-lg font-bold text-stone-900">Avisos pendientes</h3>
          <p class="text-xs text-stone-500 mt-0.5">${e.length} ${e.length===1?`lector`:`lectores`} con devoluciones atrasadas o próximas. Envía los avisos uno por uno.</p>
        </div>
        <div class="overflow-y-auto px-6 divide-y divide-stone-200 border-t border-stone-200">
          ${e.map(e=>{let t=this._estadoPrestamo(e.fecha_devolucion_esperada);return`
            <div class="py-3 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-stone-800 text-sm truncate">${a(e.lectores?.nombre)}</p>
                <p class="text-xs text-stone-500 truncate">${a(e.libros?.titulo)}</p>
                <p class="text-[11px] font-bold ${t.clave===`vencido`?`text-rose-700`:`text-amber-700`}">${a(t.etiqueta)}</p>
              </div>
              <button data-notify-id="${e.id}" class="btn-secundario shrink-0 bg-patrimonio-madera text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-bell mr-1"></i> Avisar
              </button>
            </div>`}).join(``)}
        </div>
        <div class="p-6 pt-4 flex justify-end border-t border-stone-200">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        </div>
      </div>
    `,document.body.appendChild(t);let n=this._prepararModal(t);t.querySelector(`[data-action="close"]`).addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()}),t.querySelectorAll(`[data-notify-id]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=e.find(e=>String(e.id)===String(t.dataset.notifyId));n&&this.showNotifyModal(n)})})},async flujoPrestamo(e,t){let n=await this.showPrompt(`Escribe el RUT del lector:`,{title:`Prestar libro`,placeholder:`12345678-5`,confirmText:`Consultar`});if(!n)return;if(!this.isValidRut(n)){this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`);return}let r;try{r=await X.estadoLector(this.formatRut(n))}catch(e){this.showToast(e.message||`No se pudo consultar el lector.`,`error`);return}this.showConfirmarPrestamoModal(e,this.formatRut(n),r,t)},showConfirmarPrestamoModal(e,t,n,r){let i=document.createElement(`div`);i.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let o,s;n.existe?n.puede_prestar?(o=`
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>${a(n.nombre)}</p>
          <p class="text-sm text-emerald-700 mt-0.5">Puede llevar este libro.</p>
        </div>
        ${this._resumenLector(n)}`,s=`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
        <button data-action="prestar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Confirmar préstamo</button>`):(o=`
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p class="font-bold text-rose-800 mb-1"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>No se puede prestar</p>
          <p class="text-sm text-rose-700">${a(n.motivo_rechazo||`El lector está impedido de pedir libros.`)}</p>
        </div>
        ${this._resumenLector(n)}`,s=`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        <button data-action="ver-prestamos" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">Ver sus préstamos</button>`):(o=`
        <div class="bg-patrimonio-lago/5 border border-patrimonio-lago/20 rounded-xl p-4 text-center">
          <i aria-hidden="true" class="fas fa-user-plus text-2xl text-patrimonio-lago mb-2"></i>
          <p class="font-bold text-stone-800">Lector nuevo</p>
          <p class="text-sm text-stone-600 mt-1">El RUT <span class="font-mono font-bold">${a(t)}</span> no está registrado.</p>
          <p class="text-xs text-stone-500 mt-2">Regístralo para poder prestarle libros.</p>
        </div>`,s=`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
        <button data-action="registrar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar lector</button>`),i.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900">Situación del lector</h3>
        ${o}
        <div class="flex justify-end gap-3 pt-1 flex-wrap">${s}</div>
      </div>`,document.body.appendChild(i);let c=this._prepararModal(i);i.querySelector(`[data-action="cancel"]`).addEventListener(`click`,c),i.addEventListener(`click`,e=>{e.target===i&&c()}),i.querySelector(`[data-action="prestar"]`)?.addEventListener(`click`,async n=>{let i=n.currentTarget;i.disabled=!0;try{let n=await Z.registrarPrestamo(e,t);c(),n?.encolado?this.showToast(n.mensaje,`info`):this.showToast(`Préstamo registrado.`,`success`),r?.()}catch(e){this.showToast(e.message||`No se pudo registrar el préstamo.`,`error`),i.disabled=!1}}),i.querySelector(`[data-action="registrar"]`)?.addEventListener(`click`,()=>{c(),this.showNuevoLectorModal(t,async()=>{let n=await X.estadoLector(t);this.showConfirmarPrestamoModal(e,t,n,r)})}),i.querySelector(`[data-action="ver-prestamos"]`)?.addEventListener(`click`,()=>{c(),this.loanFilter=`vencidos`,this.switchView(`loans`)})},_resumenLector(e){let t=(e,t,n=`text-stone-900`)=>`
      <div class="text-center">
        <p class="font-serif font-bold text-2xl ${n}">${t}</p>
        <p class="text-[10px] uppercase tracking-widest text-stone-500 mt-0.5">${e}</p>
      </div>`;return`
      <div class="grid grid-cols-3 gap-2 border border-stone-200 rounded-xl py-3">
        ${t(`Activos`,e.prestamos_activos??0)}
        ${t(`Atrasados`,e.prestamos_atrasados??0,(e.prestamos_atrasados??0)>0?`text-rose-700`:`text-stone-900`)}
        ${t(`Máximo`,this.param(`max_prestamos_por_lector`))}
      </div>
      ${e.email||e.telefono?`
        <p class="text-[11px] text-stone-500 text-center">
          ${e.email?a(e.email):``}${e.email&&e.telefono?` · `:``}${e.telefono?a(e.telefono):``}
        </p>`:``}`},showNuevoLectorModal(e,t){let n=document.createElement(`div`);n.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,n.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900">Registrar lector nuevo</h3>
          <p class="text-xs text-stone-500 mt-0.5">Todos los datos son obligatorios.</p>
        </div>
        <div class="space-y-3">
          <div>
            <label for="new-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
            <input id="new-user-id" value="${a(e)}" readonly
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm font-mono text-stone-600" />
          </div>
          <div>
            <label for="new-user-name" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Nombre completo</label>
            <input id="new-user-name" placeholder="María Antileo Huenchumán"
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="new-user-phone" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Teléfono</label>
            <input id="new-user-phone" type="tel" placeholder="9 1234 5678"
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="new-user-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
            <input id="new-user-email" type="email" placeholder="nombre@correo.cl"
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        ${this._bloqueConsentimiento(`new`)}
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar y continuar</button>
        </div>
      </div>`,document.body.appendChild(n);let r=this._prepararModal(n);n.querySelector(`[data-action="cancel"]`).addEventListener(`click`,r),this._bindConsentimiento(`new`),setTimeout(()=>document.getElementById(`new-user-name`)?.focus(),20),n.querySelector(`[data-action="save"]`).addEventListener(`click`,async e=>{if(!this.validateUserForm(!1))return;let n=e.currentTarget;n.disabled=!0;try{let e=this._datosConsentimiento(`new`);if(!e){n.disabled=!1;return}let i=await X.agregarLector({rut:this.formatRut(document.getElementById(`new-user-id`).value),nombre:document.getElementById(`new-user-name`).value.trim(),email:document.getElementById(`new-user-email`).value.trim().toLowerCase(),telefono:this.formatPhone(document.getElementById(`new-user-phone`).value),...e});r(),this.showToast(i?.encolado?i.mensaje:`Lector registrado.`,i?.encolado?`info`:`success`),await t?.()}catch(e){this.showToast(e.message||`No se pudo registrar el lector.`,`error`),n.disabled=!1}})},async flujoReserva(e,t){let n=await this.showPrompt(`Escribe el RUT del lector:`,{title:`Reservar libro`,placeholder:`12345678-5`,confirmText:`Consultar`});if(!n)return;if(!this.isValidRut(n)){this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`);return}let r;try{r=await X.estadoLector(this.formatRut(n))}catch(e){this.showToast(e.message||`No se pudo consultar el lector.`,`error`);return}this.showConfirmarReservaModal(e,this.formatRut(n),r,t)},showConfirmarReservaModal(e,t,n,r){let i=document.createElement(`div`);i.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let o,s;n.existe?n.puede_prestar?(o=`
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>${a(n.nombre)}</p>
          <p class="text-sm text-emerald-700 mt-0.5">Se puede poner en la fila de espera de este libro.</p>
        </div>
        ${this._resumenLector(n)}`,s=`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
        <button data-action="reservar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Confirmar reserva</button>`):(o=`
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p class="font-bold text-rose-800 mb-1"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>No se puede reservar</p>
          <p class="text-sm text-rose-700">${a(n.motivo_rechazo||`El lector está impedido de pedir libros.`)}</p>
        </div>
        ${this._resumenLector(n)}`,s=`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        <button data-action="ver-prestamos" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">Ver sus préstamos</button>`):(o=`
        <div class="bg-patrimonio-lago/5 border border-patrimonio-lago/20 rounded-xl p-4 text-center">
          <i aria-hidden="true" class="fas fa-user-plus text-2xl text-patrimonio-lago mb-2"></i>
          <p class="font-bold text-stone-800">Lector nuevo</p>
          <p class="text-sm text-stone-600 mt-1">El RUT <span class="font-mono font-bold">${a(t)}</span> no está registrado.</p>
          <p class="text-xs text-stone-500 mt-2">Regístralo para poder reservarle un libro.</p>
        </div>`,s=`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
        <button data-action="registrar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar lector</button>`),i.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900">Situación del lector</h3>
        ${o}
        <div class="flex justify-end gap-3 pt-1 flex-wrap">${s}</div>
      </div>`,document.body.appendChild(i);let c=this._prepararModal(i);i.querySelector(`[data-action="cancel"]`).addEventListener(`click`,c),i.addEventListener(`click`,e=>{e.target===i&&c()}),i.querySelector(`[data-action="reservar"]`)?.addEventListener(`click`,async n=>{let i=n.currentTarget;i.disabled=!0;try{let n=await Ke.reservarLibro(e,t);if(c(),n?.encolado)this.showToast(n.mensaje,`info`);else{let e=n?.posicion_en_fila;this.showToast(e?`Reserva registrada: posición ${e} en la fila de espera.`:`Reserva registrada.`,`success`)}r?.()}catch(e){this.showToast(e.message||`No se pudo registrar la reserva.`,`error`),i.disabled=!1}}),i.querySelector(`[data-action="registrar"]`)?.addEventListener(`click`,()=>{c(),this.showNuevoLectorModal(t,async()=>{let n=await X.estadoLector(t);this.showConfirmarReservaModal(e,t,n,r)})}),i.querySelector(`[data-action="ver-prestamos"]`)?.addEventListener(`click`,()=>{c(),this.loanFilter=`vencidos`,this.switchView(`loans`)})},async showLectorModal(e){try{let t=await X.estadoLector(e),n=document.createElement(`div`);n.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,n.innerHTML=`
        <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900">${a(t.nombre||`Lector`)}</h3>
            <p class="text-xs font-mono text-stone-500">${a(t.rut||e)}</p>
          </div>
          ${t.puede_prestar?`
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p class="text-sm text-emerald-700"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Puede pedir libros prestados.</p>
            </div>`:`
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <p class="text-sm text-rose-700"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>${a(t.motivo_rechazo||``)}</p>
            </div>`}
          ${this._resumenLector(t)}
          <div class="flex justify-end pt-1">
            <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
          </div>
        </div>`,document.body.appendChild(n);let r=this._prepararModal(n);n.querySelector(`[data-action="close"]`).addEventListener(`click`,r),n.addEventListener(`click`,e=>{e.target===n&&r()})}catch(e){this.showToast(e.message||`No se pudo consultar el lector.`,`error`)}}},Q={async crearEnlaceEscaneo(e){return V.crearEnlaceEscaneo(e)},async revocarEnlaceEscaneo(e){return V.revocarEnlaceEscaneo(e)}};async function Je(e){let t=(e||``).replace(/[^0-9Xx]/g,``);if(!t)return null;try{let e=new AbortController,n=setTimeout(()=>e.abort(),6e3),r;try{r=await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(t)}&format=json&jscmd=data`,{signal:e.signal})}finally{clearTimeout(n)}if(!r.ok)return null;let i=(await r.json())[`ISBN:${t}`];return i?{titulo:i.title||``,autor:(i.authors||[]).map(e=>e.name).filter(Boolean).join(`, `)}:null}catch{return null}}var Ye=`modulepreload`,Xe=function(e){return`/`+e},Ze={},Qe=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Xe(t,n),t=s(t),t in Ze)return;Ze[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:Ye,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},$e=null;function et(){return $e||=Qe(()=>import(`/vendor/js/qrcode.min.js`).then(e=>e.default),[]),$e}async function tt(e){let t=(await et())(0,`M`);return t.addData(e),t.make(),t.createSvgTag(5,2)}Object.assign(Ie.prototype,Le,Re,ze,He,Ue,We,Ge,qe,{renderScannerView(){let e=this._container();if(!e)return;e.innerHTML=`
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-6 max-w-xl">
        <div class="flex items-start justify-between gap-3 flex-wrap mb-4">
          <h3 class="font-serif font-semibold text-lg text-stone-900"><i aria-hidden="true" class="fas fa-qrcode text-amber-400 mr-2"></i>Escanear libro</h3>
          <button id="qr-remoto-btn" type="button"
            class="btn-secundario border border-stone-300 bg-white text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">
            <i aria-hidden="true" class="fas fa-mobile-screen-button mr-1"></i> Escanear desde el celular
          </button>
        </div>
        <p class="text-xs text-stone-500 mb-4">
          Use "Escanear desde el celular" para leer códigos de barras con la cámara.
          Aquí también puede escribir el código a mano.
        </p>
        <div class="flex gap-3">
          <input id="manual-scan-input" aria-label="Escribir el código del libro manualmente" placeholder="Ingrese el ISBN manualmente" class="flex-1 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <button id="manual-scan-btn" class="bg-patrimonio-lago hover:bg-[#14303c] text-white font-sans font-medium rounded-xl shadow px-4 py-2 text-sm transition-colors">Buscar</button>
        </div>
        <div id="scan-result" class="mt-5"></div>
      </div>
    `;let t=async e=>{let t=document.getElementById(`scan-result`);if(t){this._ultimoCodigoEscaneado=e,t.innerHTML=`<div class="flex items-center gap-2 text-sm text-stone-500"><i aria-hidden="true" class="fas fa-spinner fa-spin text-patrimonio-lago"></i> Consultando…</div>`;try{let n=await Y.consultarLibro(e);if(!n){await this._formularioAltaRapida(t,e);return}let r=await Ke.listarReservas(n.libro?.id).catch(()=>null);t.innerHTML=this._fichaCirculacion(n,r),this._bindFichaCirculacion(t,n,e)}catch(e){t.innerHTML=`<p class="text-rose-700 font-bold text-sm">${a(e.message||`Error al consultar la base de datos.`)}</p>`}}};this._mostrarResultadoEscaneo=t,document.getElementById(`qr-remoto-btn`).addEventListener(`click`,()=>this.showQrRemotoModal());let n=()=>{let e=document.getElementById(`manual-scan-input`).value.trim();e&&t(e)};document.getElementById(`manual-scan-btn`).addEventListener(`click`,n),document.getElementById(`manual-scan-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&n()})},async _formularioAltaRapida(e,t){let n=(e,t,n,r=``)=>`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${t}</label>
        <input id="${e}" value="${a(n??``)}" ${r}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;e.innerHTML=`
      <div class="border border-stone-300 rounded-xl p-4">
        <p class="text-sm text-stone-600 mb-1">
          Ningún libro registrado con el código <span class="font-mono font-bold">${a(t)}</span>.
        </p>
        <p class="text-xs text-stone-500 mb-3">Complete los datos y agréguelo al catálogo.</p>
        <p id="scan-new-book-buscando" class="text-xs text-stone-500 mb-3">
          <i aria-hidden="true" class="fas fa-spinner fa-spin"></i> Buscando título y autor en Open Library…
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${n(`scan-new-book-isbn`,`ISBN`,t,`readonly`)}
          ${n(`scan-new-book-qty`,`Ejemplares`,1,`type="number" min="1"`)}
          ${n(`scan-new-book-title`,`Título`,``)}
          ${n(`scan-new-book-author`,`Autor`,``)}
          ${n(`scan-new-book-genre`,`Género (opcional)`,``)}
          ${n(`scan-new-book-location`,`Ubicación (opcional)`,``)}
        </div>
        <div class="flex justify-end gap-3 pt-3">
          <button id="scan-new-book-btn" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-plus mr-1"></i> Agregar al catálogo
          </button>
        </div>
      </div>`,document.getElementById(`scan-new-book-btn`).addEventListener(`click`,async t=>{if(!this.validateBookForm(`scan-new-book`))return;let n=t.currentTarget;n.disabled=!0;try{let t=await Y.agregarLibro({isbn:document.getElementById(`scan-new-book-isbn`).value.trim(),titulo:document.getElementById(`scan-new-book-title`).value.trim(),autor:document.getElementById(`scan-new-book-author`).value.trim(),genero:document.getElementById(`scan-new-book-genre`).value.trim(),ubicacion:document.getElementById(`scan-new-book-location`).value.trim(),stock:Number(document.getElementById(`scan-new-book-qty`).value||1)});this.showToast(t?.encolado?t.mensaje:`Libro agregado al catálogo.`,t?.encolado?`info`:`success`),e.innerHTML=``}catch(e){this.showToast(e.message||`No se pudo agregar el libro.`,`error`),n.disabled=!1}});let r=await Je(t),i=document.getElementById(`scan-new-book-buscando`);if(i&&i.remove(),r){let e=document.getElementById(`scan-new-book-title`),t=document.getElementById(`scan-new-book-author`);e&&!e.value.trim()&&r.titulo&&(e.value=r.titulo),t&&!t.value.trim()&&r.autor&&(t.value=r.autor)}},async showQrRemotoModal(){let e=document.createElement(`div`);e.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,e.innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
        <h3 class="font-serif text-lg font-bold text-stone-900">Escanear desde el celular</h3>
        <p class="text-xs text-stone-600">
          Quien escanee este código NO necesita iniciar sesión. Si el libro es nuevo lo agrega al
          catálogo; si ya existe, solo muestra quién lo tiene — nada más — y el enlace deja de
          servir cuando vence o lo revoca. Cada escaneo remoto se avisa aquí, en vivo.
        </p>
        <label for="qr-remoto-horas" class="text-[11px] font-black uppercase tracking-wide text-stone-600 block">Vigente por</label>
        <select id="qr-remoto-horas" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm">
          <option value="1">1 hora</option>
          <option value="4" selected>4 horas</option>
          <option value="8">8 horas (una jornada)</option>
          <option value="24">24 horas (máximo)</option>
        </select>
        <div id="qr-remoto-cuerpo">
          <div class="flex items-center justify-center py-2 min-h-[180px]">
            <i aria-hidden="true" class="fas fa-spinner fa-spin text-2xl text-patrimonio-lago"></i>
            <span class="sr-only">Generando el enlace…</span>
          </div>
        </div>
        <button data-action="cerrar" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-bold w-full">Cerrar</button>
      </div>`,document.body.appendChild(e);let t=null,n=null,i=!1,o=()=>{if(n&&r)try{r.removeChannel(n)}catch{}n=null},s=this._prepararModal(e,{alCerrar:()=>{i=!0,o()}});e.querySelector(`[data-action="cerrar"]`).addEventListener(`click`,s),e.addEventListener(`click`,t=>{t.target===e&&s()});let c=async e=>{if(o(),r&&!i)try{let t=await u(e);if(i)return;n=r.channel(t).on(`broadcast`,{event:`libro-escaneado`},({payload:e})=>{this.showToast(`Escaneo remoto: ${e?.titulo||e?.isbn||`libro`}`,`info`),e?.isbn&&e.isbn===this._ultimoCodigoEscaneado&&document.getElementById(`scan-result`)&&this._mostrarResultadoEscaneo?.(e.isbn)}).subscribe()}catch{}},l=async()=>{let e=document.getElementById(`qr-remoto-cuerpo`);if(!e)return;if(e.innerHTML=`<div class="flex items-center justify-center py-2 min-h-[180px]">
        <i aria-hidden="true" class="fas fa-spinner fa-spin text-2xl text-patrimonio-lago"></i>
        <span class="sr-only">Generando el enlace…</span></div>`,o(),t){try{await Q.revocarEnlaceEscaneo(t.id)}catch{}t=null}let n=Number(document.getElementById(`qr-remoto-horas`)?.value||4);try{if(t=await Q.crearEnlaceEscaneo(n),!t)throw Error(`El sistema no devolvió el enlace.`)}catch(t){e.innerHTML=`<p class="text-xs text-rose-700 py-6">${a(t.message||`No se pudo generar el enlace.`)}</p>`;return}c(t.token);let r=`${window.location.origin}${window.location.pathname.replace(/index\.html$/,``)}escaneo-remoto.html?token=${encodeURIComponent(t.token)}`;e.innerHTML=`
        <div id="qr-remoto-imagen" class="flex items-center justify-center py-2 min-h-[180px]">
          <i aria-hidden="true" class="fas fa-spinner fa-spin text-2xl text-patrimonio-lago"></i>
          <span class="sr-only">Dibujando el código QR…</span>
        </div>
        <p class="text-[11px] font-mono text-stone-500 break-all">${a(r)}</p>
        <p class="text-[11px] text-stone-500">Vence el ${a(this._fechaHoraLegible(t.expira_en))}.</p>
        <button data-action="revocar" class="text-rose-700 hover:text-rose-800 text-xs font-bold underline mt-1">
          <i aria-hidden="true" class="fas fa-ban mr-1"></i>Revocar este enlace ahora
        </button>`;try{let e=await tt(r),t=document.getElementById(`qr-remoto-imagen`);t&&(t.innerHTML=e)}catch{let e=document.getElementById(`qr-remoto-imagen`);e&&(e.innerHTML=`<p class="text-xs text-rose-700">No se pudo generar el código QR. Puede copiar la dirección de más abajo.</p>`)}e.querySelector(`[data-action="revocar"]`)?.addEventListener(`click`,async n=>{let r=n.currentTarget;r.disabled=!0;try{await Q.revocarEnlaceEscaneo(t.id),t=null,o(),this.showToast(`Enlace revocado. Ya no sirve para agregar libros.`,`success`),e.innerHTML=`<p class="text-xs text-stone-500 py-6">Este enlace fue revocado. Genere uno nuevo si lo necesita.</p>`}catch(e){this.showToast(e.message||`No se pudo revocar el enlace.`,`error`),r.disabled=!1}})};document.getElementById(`qr-remoto-horas`).addEventListener(`change`,l),l()},_fichaCirculacion({libro:e,prestamos:t},n){let r=e.stock??0,i=r>0,o=(n||[]).filter(e=>e.estado===`activa`||e.estado===`apartada`);return`
      <div class="border border-stone-300 rounded-xl overflow-hidden">
        <div class="p-4 bg-stone-50/70 flex items-start gap-3">
          ${this._portadaHtml(e)}
          <div class="min-w-0 flex-1">
            <p class="font-serif font-semibold text-stone-900 leading-tight">${a(e.titulo)}</p>
            <p class="text-sm text-stone-500">${a(e.autor)}</p>
            <p class="text-[11px] font-mono text-stone-500 mt-0.5">${a(e.isbn||`sin ISBN`)}</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span class="stamp ${i?`stamp-success`:`stamp-danger`} !rotate-0">
                <i aria-hidden="true" class="fas ${i?`fa-check`:`fa-xmark`}"></i>
                ${Number(r)} de ${Number(e.copias_totales??r)} disponible${r===1?``:`s`}
              </span>
              ${e.ubicacion?`<span class="stamp stamp-info !rotate-0"><i aria-hidden="true" class="fas fa-location-dot"></i> ${a(e.ubicacion)}</span>`:``}
            </div>
          </div>
        </div>

        <div class="p-4">
          ${t.length===0?`<p class="text-xs text-stone-500"><i aria-hidden="true" class="fas fa-circle-info mr-1"></i>Sin préstamos activos. Todos los ejemplares están en la biblioteca.</p>`:`<p class="text-[10px] font-black uppercase tracking-widest text-stone-500">${t.length} préstamo${t.length===1?``:`s`} activo${t.length===1?``:`s`}</p>
               ${t.map(e=>{let t=this._estadoPrestamo(e.fecha_devolucion_esperada),n=e.lector||{},r=n.bloqueado_manual||(n.atrasados??0)>0,i=Number(n.atrasados??0),o=n.bloqueado_manual?`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-ban"></i> Bloqueado</span>`:i>0?`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-triangle-exclamation"></i> Debe ${i} libro${i===1?``:`s`}</span>`:`<span class="stamp stamp-success !rotate-0"><i aria-hidden="true" class="fas fa-check"></i> Al día</span>`;return`
        <div class="border-t border-stone-200 pt-3 mt-3">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-0.5">En poder de</p>
              <p class="font-bold text-stone-800">${a(n.nombre||`Lector desconocido`)}</p>
              <p class="text-xs font-mono text-stone-500">${a(n.rut||`—`)}</p>
              <div class="mt-1.5">${o}</div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-0.5">Devolución</p>
              <p class="text-sm ${t.clave===`vencido`?`text-rose-700 font-bold`:t.clave===`porVencer`?`text-amber-700 font-bold`:`text-stone-700`}">
                ${this._fechaLegible(e.fecha_devolucion_esperada)}
              </p>
              <p class="text-[11px] ${t.clave===`vencido`?`text-rose-700`:t.clave===`porVencer`?`text-amber-700`:`text-stone-500`}">${a(t.etiqueta)}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <button data-devolver="${a(String(e.id))}" class="btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              <i aria-hidden="true" class="fas fa-rotate-left mr-1"></i> Registrar devolución
            </button>
            ${t.clave===`alDia`?``:`
              <button data-avisar="${a(String(e.id))}" class="btn-secundario bg-patrimonio-madera text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-bell mr-1"></i> Avisar
              </button>`}
            ${t.clave!==`vencido`&&(e.renovaciones??0)<this.param(`max_renovaciones`)?`
              <button data-renovar="${a(String(e.id))}" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-clock-rotate-left mr-1"></i> Renovar
              </button>`:``}
            ${r?`
              <button data-ver-lector="${a(n.rut||``)}" class="btn-secundario border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-user-large mr-1"></i> Ver situación
              </button>`:``}
          </div>
        </div>`}).join(``)}`}

          ${o.length>0?`
            <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 mt-4">${o.length} reserva${o.length===1?``:`s`} vigente${o.length===1?``:`s`}</p>
            ${o.map(e=>`
      <div class="border-t border-stone-200 pt-3 mt-3">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-0.5">
              ${e.estado===`apartada`?`Apartado para`:`En fila (posición ${a(String(e.posicion_en_fila??`?`))})`}
            </p>
            <p class="font-bold text-stone-800">${a(e.lector_nombre||`Lector desconocido`)}</p>
            <p class="text-xs font-mono text-stone-500">${a(e.lector_rut||`—`)}</p>
          </div>
          ${e.estado===`apartada`?`<span class="stamp stamp-info !rotate-0 shrink-0"><i aria-hidden="true" class="fas fa-box-archive"></i> Apartado</span>`:`<span class="stamp !rotate-0 shrink-0"><i aria-hidden="true" class="fas fa-user-clock"></i> En fila</span>`}
        </div>
      </div>`).join(``)}`:``}

          <div class="border-t border-stone-200 pt-4 mt-4">
            <button data-prestar-libro="${a(String(e.id))}" ${i?``:`disabled`}
              class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <i aria-hidden="true" class="fas fa-right-left mr-1.5"></i> ${i?`Prestar este libro`:`Sin ejemplares disponibles`}
            </button>
          </div>
        </div>
      </div>`},_bindFichaCirculacion(e,t,n){let r=()=>this._mostrarResultadoEscaneo?.(n);e.querySelectorAll(`[data-devolver]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await Z.devolverPrestamo(e.dataset.devolver);t?.encolado?this.showToast(t.mensaje,`info`):this.showToast(`Devolución registrada.`,`success`),r()}catch(t){this.showToast(t.message||`No se pudo registrar la devolución.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`[data-renovar]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await Z.renovarPrestamo(e.dataset.renovar);t?.encolado?this.showToast(t.mensaje,`info`):this.showToast(`Renovado hasta el ${this._fechaLegible(t?.nueva_fecha)}.`,`success`),r()}catch(t){this.showToast(t.message||`No se pudo renovar.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`[data-avisar]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=t.prestamos.find(t=>String(t.id)===String(e.dataset.avisar));n&&this.showNotifyModal({id:n.id,fecha_devolucion_esperada:n.fecha_devolucion_esperada,libros:t.libro,lectores:n.lector})})}),e.querySelectorAll(`[data-ver-lector]`).forEach(e=>{e.addEventListener(`click`,()=>this.showLectorModal(e.dataset.verLector))}),e.querySelectorAll(`[data-prestar-libro]`).forEach(e=>{e.addEventListener(`click`,()=>this.flujoPrestamo(e.dataset.prestarLibro,r))})}});var $=new Ie,nt=`No se pudo iniciar la aplicación a tiempo. Recargue la página; si el problema sigue, cierre esta pestaña y ábrala de nuevo.`;function rt(){try{Object.keys(localStorage).filter(e=>e.startsWith(`sb-`)&&e.endsWith(`-auth-token`)).forEach(e=>localStorage.removeItem(e))}catch{}}function it(){return(window.location.hash||``).includes(`type=recovery`)}function at(){return(window.location.hash||``).includes(`type=invite`)}function ot(){`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sw.js`).catch(e=>{k.registrarOperacion(`arranque`,e)})})}ot();var st=3e5,ct=!1;function lt(){ct||(ct=!0,H.iniciar(),D.sincronizarTodo(),z.reintentarPendientes(),setInterval(()=>{D.sincronizarTodo(),z.reintentarPendientes()},st),window.addEventListener(`online`,()=>D.sincronizarTodo()))}document.addEventListener(`DOMContentLoaded`,async()=>{k.iniciar(()=>`arranque`);try{if(!r)throw Error(`No se pudo inicializar la conexión con Supabase (CDN no disponible).`);if(it()){$.renderNuevaPassword(),window.__appBooted=!0;return}if(at()){$.renderCompletarInvitacion(),window.__appBooted=!0;return}let e=null,t=async t=>{if(e){await e;return}e=$.renderShell(t),await e,lt()};ee(async(n,r)=>{if(n===`PASSWORD_RECOVERY`){$.renderNuevaPassword();return}n===`SIGNED_IN`&&r&&!$.sesionRenderizada&&($.sesionRenderizada=!0,await t(r.user)),n===`SIGNED_OUT`&&($.sesionRenderizada=!1,e=null,$.renderLogin())});let{data:{session:n},error:a}=await i(r.auth.getSession(),8e3,nt);if(a)throw a;n?($.sesionRenderizada=!0,await t(n.user)):$.renderLogin(),window.__appBooted=!0}catch(e){window.__appBooted=!0,k.registrarOperacion(`arranque`,e),e?.message===nt&&rt(),window.__showCriticalError?window.__showCriticalError(e.message||`Fallo crítico en el inicio. Verifique su conexión a internet.`):document.body.innerHTML=`<div class="p-10 text-center text-red-600 font-bold">Fallo crítico en el inicio. Verifique la consola de red.</div>`}});