import{a as e,c as t,i as n,l as r,n as i,o as a,r as o,s,t as c,u as l}from"./libros-externos-DVLDPn1e.js";/* empty css               */var u=Object.defineProperty,d=(e,t)=>{let n={};for(var r in e)u(n,r,{get:e[r],enumerable:!0});return t||u(n,Symbol.toStringTag,{value:`Module`}),n};(function(){window.__appBooted=!1;try{if(window.top!==window.self){var e=!0;try{window.top.location=window.self.location}catch{}e&&document.addEventListener(`DOMContentLoaded`,function(){if(window.top!==window.self){document.body.textContent=``;var e=document.createElement(`div`);e.setAttribute(`role`,`alert`),e.style.cssText=`font-family:system-ui,sans-serif;padding:2rem;text-align:center;background:#1c1917;color:#fafaf9;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem`;var t=document.createElement(`strong`);t.textContent=`Esta página no puede mostrarse dentro de otro sitio`;var n=document.createElement(`span`);n.style.cssText=`font-size:0.875rem;max-width:28rem;line-height:1.5`,n.textContent=`Por seguridad, el sistema de la biblioteca solo funciona en su propia ventana. Abre la dirección directamente en el navegador.`,e.appendChild(t),e.appendChild(n),document.body.appendChild(e)}})}}catch{}window.__showCriticalError=function(e){var t=document.getElementById(`views-container`)||document.body;t.textContent=``;var n=document.createElement(`div`);n.className=`h-screen w-full bg-patrimonio-lago flex items-center justify-center p-6`;var r=document.createElement(`div`);r.className=`bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4`,r.setAttribute(`role`,`alert`);var i=document.createElement(`i`);i.setAttribute(`aria-hidden`,`true`),i.className=`fas fa-triangle-exclamation text-3xl text-rose-700`;var a=document.createElement(`h3`);a.className=`font-serif text-lg font-bold text-stone-900`,a.textContent=`No se pudo conectar`;var o=document.createElement(`p`);o.className=`text-stone-600 text-sm`,o.textContent=e;var s=document.createElement(`button`);s.className=`w-full bg-patrimonio-madera hover:bg-[#633414] text-white font-medium rounded-xl shadow py-2.5 text-sm`,s.textContent=`Reintentar`,s.addEventListener(`click`,function(){location.reload()}),r.appendChild(i),r.appendChild(a),r.appendChild(o),r.appendChild(s),n.appendChild(r),t.appendChild(n)};function t(e,t){var n=document.getElementById(e);n&&n.addEventListener(`error`,function(){window.__showCriticalError(t)})}document.addEventListener(`DOMContentLoaded`,function(){t(`script-supabase`,`No se pudo cargar el módulo de base de datos. Verifique que la carpeta vendor esté publicada.`),t(`script-app`,`No se pudo cargar la aplicación.`)}),setTimeout(function(){window.__appBooted||window.__showCriticalError(`La aplicación tardó demasiado en cargar. Verifique su conexión a internet e intente nuevamente.`)},1e4)})();var f=d({supabase:()=>h});async function p(e,t,n){return await n()}var m=null;if(!window.supabase)console.error(`Error crítico: Supabase no cargado desde el CDN.`);else try{m=window.supabase.createClient(l.SUPABASE_URL,l.SUPABASE_ANON_KEY,{auth:{lock:p}})}catch(e){console.error(`Error crítico: Supabase CDN disponible pero createClient falló:`,e.message)}var h=m;async function ee(e,t){let{data:n,error:r}=await a(h.auth.signInWithPassword({email:e,password:t}),15e3,`El inicio de sesión tardó demasiado en responder. Intente nuevamente; si el problema persiste, recargue la página.`);if(r)throw Error(`Credenciales inválidas. Acceso denegado.`);return n}async function te(){let{error:e}=await h.auth.signInWithOAuth({provider:`google`,options:{redirectTo:window.location.origin}});if(e)throw Error(`No se pudo iniciar sesión con Google.`)}async function ne(e){let{error:t}=await h.auth.resetPasswordForEmail(e,{redirectTo:window.location.origin});if(t)throw Error(`No se pudo enviar el correo de recuperación.`)}async function re(e){let{error:t}=await h.auth.updateUser({password:e});if(t)throw/session/i.test(t.message)?Error(`El enlace expiró. Solicita uno nuevo desde la pantalla de ingreso.`):Error(t.message||`No se pudo cambiar la contraseña.`)}async function ie(e,t){let{data:{user:n}}=await h.auth.getUser();if(!n?.email)throw Error(`No hay una sesión válida. Vuelve a iniciar sesión.`);let{error:r}=await h.auth.signInWithPassword({email:n.email,password:e});if(r)throw Error(`La contraseña actual no es correcta.`);let{error:i}=await h.auth.updateUser({password:t});if(i)throw Error(i.message||`No se pudo cambiar la contraseña.`)}function ae(e){return h.auth.onAuthStateChange((t,n)=>e(t,n))}async function g(){await h.auth.signOut(),window.location.reload()}function oe(e){return e?l.ADMIN_EMAILS.includes(e.toLowerCase().trim()):!1}async function se(e){let t=typeof e==`string`?e:e?.id,n=typeof e==`string`?null:e?.email;try{let{data:e,error:r}=await h.from(`usuarios`).select(`rol`).eq(`id`,t).maybeSingle();return r&&console.warn(`No se pudo leer el rol desde la tabla usuarios:`,r.message),e?.rol?e.rol:n&&l.ADMIN_EMAILS.includes(n.toLowerCase().trim())?(console.warn(`El usuario ${n} no tiene fila en la tabla "usuarios". Se le asignó el rol admin por CONFIG.ADMIN_EMAILS. Crea su fila en la tabla para que el rol quede respaldado por RLS.`),`admin`):`librero`}catch(e){return console.error(`Error inesperado al obtener el rol:`,e),`librero`}}var ce=`biblionexo-local`,le=2,ue=30,de=50,fe=500,_=null;function v(){return _||(_=new Promise((e,t)=>{if(typeof indexedDB>`u`){t(Error(`Este navegador no soporta almacenamiento local (IndexedDB).`));return}let n=indexedDB.open(ce,le);n.onupgradeneeded=()=>{let e=n.result,t=n.transaction,r=e.objectStoreNames.contains(`libros`)?t.objectStore(`libros`):e.createObjectStore(`libros`,{keyPath:`id`});r.indexNames.contains(`isbn`)||r.createIndex(`isbn`,`isbn`);let i=e.objectStoreNames.contains(`lectores`)?t.objectStore(`lectores`):e.createObjectStore(`lectores`,{keyPath:`id`});i.indexNames.contains(`consultadoEn`)||i.createIndex(`consultadoEn`,`consultadoEn`),i.indexNames.contains(`rut`)||i.createIndex(`rut`,`rut`),e.objectStoreNames.contains(`meta`)||e.createObjectStore(`meta`,{keyPath:`clave`}),e.objectStoreNames.contains(`colaSync`)||e.createObjectStore(`colaSync`,{keyPath:`id`,autoIncrement:!0}).createIndex(`proximoIntentoEn`,`proximoIntentoEn`)},n.onsuccess=()=>e(n.result),n.onerror=()=>{_=null,t(n.error||Error(`No se pudo abrir el almacén local.`))}}),_)}function y(e,t,n,r){return new Promise((i,a)=>{let o=e.transaction(t,n),s=o.objectStore(t),c;Promise.resolve(r(s)).then(e=>{c=e}).catch(a),o.oncomplete=()=>i(c),o.onerror=()=>a(o.error||Error(`Fallo en el almacén local "${t}".`)),o.onabort=()=>a(o.error||Error(`Transacción abortada en "${t}".`))})}function b(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}async function x(e){let t=await y(await v(),`meta`,`readonly`,t=>b(t.get(e)));return t?t.valor:null}async function S(e,t){await y(await v(),`meta`,`readwrite`,n=>n.put({clave:e,valor:t}))}async function C(e,t){t.length&&await y(await v(),e,`readwrite`,e=>{t.forEach(t=>e.put(t))})}async function w(e,t){t.length&&await y(await v(),e,`readwrite`,e=>{t.forEach(t=>e.delete(t))})}async function T(e){return y(await v(),e,`readonly`,e=>b(e.getAll()))}async function pe(e){let t=[],n=e;for(let e=0;e<de;e++){let e=h.from(`libros`).select(`*`).order(`actualizado_en`,{ascending:!0}).limit(fe);e=n?e.gte(`actualizado_en`,n):e;let{data:r,error:i}=await e;if(i)throw i;if(!r||r.length===0||(t.push(...r),n=r[r.length-1].actualizado_en,r.length<fe))break}return{filas:t,marca:t.length?t[t.length-1].actualizado_en:e}}async function me(e,t){let n=h.from(`elementos_eliminados`).select(`id, eliminado_en`).eq(`tabla`,e).order(`eliminado_en`,{ascending:!0}).limit(2e3);n=t?n.gt(`eliminado_en`,t):n;let{data:r,error:i}=await n;if(i)throw i;return r||[]}var E=new class{async buscarLibrosLocales(e=``,t=0,n=25){let r=await y(await v(),`libros`,`readonly`,e=>b(e.getAll())),i=(e||``).trim().toLowerCase(),a=i?r.filter(e=>e.titulo&&e.titulo.toLowerCase().includes(i)||e.autor&&e.autor.toLowerCase().includes(i)||e.isbn&&e.isbn.includes(i)):r;a.sort((e,t)=>(e.titulo||``).localeCompare(t.titulo||``));let o=t*n;return{libros:a.slice(o,o+n),total:a.length}}async buscarLectoresLocales(e=``,t=0,n=25){let r=await y(await v(),`lectores`,`readonly`,e=>b(e.getAll())),i=(e||``).trim().toLowerCase(),a=i?r.filter(e=>e.nombre&&e.nombre.toLowerCase().includes(i)||e.rut&&e.rut.toLowerCase().includes(i)||e.email&&e.email.toLowerCase().includes(i)):r;a.sort((e,t)=>(e.nombre||``).localeCompare(t.nombre||``));let o=t*n;return{lectores:a.slice(o,o+n),total:a.length}}async sincronizarLibros(){try{let{filas:e,marca:t}=await pe(await x(`libros_ultima_sync`));await C(`libros`,e),t&&await S(`libros_ultima_sync`,t);let n=await me(`libros`,await x(`libros_eliminados_ultima_sync`));return await w(`libros`,n.map(e=>e.id)),n.length&&await S(`libros_eliminados_ultima_sync`,n[n.length-1].eliminado_en),{libros:e.length,eliminados:n.length}}catch(e){return{error:e.message||String(e)}}}async guardarLectorConsultado(e){if(e&&e.existe!==!1&&e.lector_id!=null)try{await y(await v(),`lectores`,`readwrite`,async t=>{let n=await b(t.get(e.lector_id));t.put({id:e.lector_id,nombre:e.nombre??null,rut:e.rut??null,email:e.email??null,telefono:e.telefono??null,bloqueadoManual:!!e.bloqueado_manual,motivoBloqueo:e.motivo_bloqueo??null,prestamosActivosDetalle:e.prestamos_activos_detalle??n?.prestamosActivosDetalle??[],consultadoEn:Date.now()})})}catch{}}async sincronizarLectoresActivos(){try{let{data:e,error:t}=await h.from(`prestamos`).select(`fecha_devolucion_esperada, libros(titulo), lectores(id, nombre, rut, email, telefono, bloqueado_manual, motivo_bloqueo)`).eq(`estado`,`activo`).limit(2e3);if(t)throw t;let n=new Map,r=new Map;for(let t of e||[]){let e=t.lectores;e&&e.id!=null&&(n.set(e.id,e),r.has(e.id)||r.set(e.id,[]),r.get(e.id).push({fechaDevolucionEsperada:t.fecha_devolucion_esperada??null,tituloLibro:t.libros?.titulo??null}))}let i=Date.now(),a=[...n.values()].map(e=>({id:e.id,nombre:e.nombre??null,rut:e.rut??null,email:e.email??null,telefono:e.telefono??null,bloqueadoManual:!!e.bloqueado_manual,motivoBloqueo:e.motivo_bloqueo??null,prestamosActivosDetalle:r.get(e.id)||[],consultadoEn:i}));return await C(`lectores`,a),{lectores:a.length}}catch(e){return{error:e.message||String(e)}}}async purgarLectoresEliminados(){try{let e=await me(`lectores`,await x(`lectores_eliminados_ultima_sync`));return await w(`lectores`,e.map(e=>e.id)),e.length&&await S(`lectores_eliminados_ultima_sync`,e[e.length-1].eliminado_en),{eliminados:e.length}}catch(e){return{error:e.message||String(e)}}}async purgarLectoresAntiguos(e=ue){try{let t=Date.now()-e*24*60*60*1e3,n=await y(await v(),`lectores`,`readonly`,e=>b(e.index(`consultadoEn`).getAllKeys(IDBKeyRange.upperBound(t,!0))));return await w(`lectores`,n),{purgados:n.length}}catch(e){return{error:e.message||String(e)}}}async sincronizarTodo(){return{libros:await this.sincronizarLibros(),activos:await this.sincronizarLectoresActivos(),bajasLectores:await this.purgarLectoresEliminados(),purgados:await this.purgarLectoresAntiguos()}}async obtenerLibrosLocal(){return T(`libros`)}async obtenerLectoresLocal(){return T(`lectores`)}async guardarLibroLocalOptimista(e){try{await C(`libros`,[{id:-Date.now(),isbn:e.isbn,titulo:e.titulo,autor:e.autor,genero:e.genero||null,ubicacion:e.ubicacion||null,portada_url:e.portada_url||null,copias_totales:e.stock,stock:e.stock,actualizado_en:new Date().toISOString(),pendienteSync:!0}])}catch{}}async quitarLibroLocalOptimista(e){try{await y(await v(),`libros`,`readwrite`,async t=>{let n=await b(t.index(`isbn`).get(String(e)));n?.pendienteSync&&n.id<0&&t.delete(n.id)})}catch{}}async guardarLectorLocalOptimista(e){try{await C(`lectores`,[{id:-Date.now(),nombre:e.nombre??null,rut:e.rut??null,email:e.email??null,telefono:e.telefono??null,bloqueadoManual:!1,motivoBloqueo:null,prestamosActivosDetalle:[],consultadoEn:Date.now(),pendienteSync:!0}])}catch{}}async quitarLectorLocalOptimista(e){try{await y(await v(),`lectores`,`readwrite`,async t=>{let n=await b(t.index(`rut`).get(e));n?.pendienteSync&&n.id<0&&t.delete(n.id)})}catch{}}async buscarLibroLocalPorCodigo(e){if(e==null)return null;let t=await v(),n=await y(t,`libros`,`readonly`,t=>b(t.index(`isbn`).get(String(e))));if(n)return n;let r=Number(e);return Number.isFinite(r)?await y(t,`libros`,`readonly`,e=>b(e.get(r)))??null:null}async buscarLectorLocalPorRut(e){return e?await y(await v(),`lectores`,`readonly`,t=>b(t.index(`rut`).get(e)))??null:null}async encolarOperacion(e,t,n){return y(await v(),`colaSync`,`readwrite`,r=>b(r.add({tipo:e,params:t,descripcion:n||null,creadoEn:Date.now(),intentos:0,proximoIntentoEn:Date.now(),ultimoError:null})))}async listarOperacionesPendientes(){return T(`colaSync`)}async actualizarOperacion(e,t){await y(await v(),`colaSync`,`readwrite`,async n=>{let r=await b(n.get(e));r&&n.put({...r,...t})})}async quitarOperacion(e){await y(await v(),`colaSync`,`readwrite`,t=>t.delete(e))}async estado(){let[e,t,n,r,i]=await Promise.all([T(`libros`),T(`lectores`),T(`colaSync`),x(`libros_ultima_sync`),x(`lectores_eliminados_ultima_sync`)]);return{librosGuardados:e.length,lectoresGuardados:t.length,operacionesPendientes:n.length,librosUltimaSync:r,lectoresEliminadosUltimaSync:i}}},he=[/ResizeObserver loop/i,/Script error\.?$/i,/Non-Error promise rejection/i,/Failed to fetch.*openlibrary/i,/AbortError/i,/play\(\) failed/i],ge=[{patron:/\b\d{7,8}-[0-9kK]\b/g,por:`[RUT]`},{patron:/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g,por:`[correo]`},{patron:/\b(?:\+?56)?9\d{8}\b/g,por:`[teléfono]`},{patron:/eyJ[A-Za-z0-9_-]{10,}/g,por:`[token]`}];function _e(e){let t=(e??``).toString();return ge.forEach(({patron:e,por:n})=>{t=t.replace(e,n)}),t}function ve(){let e=navigator.userAgent||``;return`${/Edg\//.test(e)?`Edge`:/Chrome\//.test(e)?`Chrome`:/Firefox\//.test(e)?`Firefox`:/Safari\//.test(e)?`Safari`:`Otro`} · ${/Windows/.test(e)?`Windows`:/Android/.test(e)?`Android`:/iPhone|iPad/.test(e)?`iOS`:/Mac OS/.test(e)?`macOS`:/Linux/.test(e)?`Linux`:`Otro`} · ${window.innerWidth}×${window.innerHeight}`}var D=new class{constructor(){this.activo=!1,this.disponible=!0,this.cola=[],this.enviando=!1,this._recientes=new Map,this.obtenerVista=()=>null}iniciar(e){typeof e==`function`&&(this.obtenerVista=e),!this.activo&&(this.activo=!0,window.addEventListener(`error`,e=>{e.target&&e.target!==window||this.registrar(e.message,{detalle:`${e.filename||``}:${e.lineno||0}\n${e.error?.stack||``}`})}),window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;this.registrar(t?.message||String(t),{detalle:t?.stack||``,accion:`promesa sin capturar`})}),window.addEventListener(`pagehide`,()=>{this._vaciar()}))}registrar(e,{detalle:t=``,accion:n=null,origen:r=`js`}={}){if(!this.disponible||!h)return;let i=_e(e);if(!i||he.some(e=>e.test(i)))return;let a=`${i}|${this.obtenerVista()||``}`,o=Date.now();o-(this._recientes.get(a)||0)<3e4||(this._recientes.set(a,o),this._recientes.size>50&&this._recientes.clear(),this.cola.push({p_mensaje:i.slice(0,500),p_origen:r,p_detalle:_e(t).slice(0,2e3),p_vista:this.obtenerVista(),p_accion:n,p_navegador:ve()}),this._vaciar())}registrarOperacion(e,t){this.registrar(t?.message||String(t),{origen:`operacion`,accion:e,detalle:t?.stack||``})}async _vaciar(){if(!(this.enviando||this.cola.length===0)){this.enviando=!0;try{for(;this.cola.length;){let e=this.cola.shift(),{error:t}=await h.rpc(`registrar_error`,e);if(t){(t.code===`42883`||t.code===`PGRST202`||/function .* does not exist|could not find/i.test(t.message||``))&&(this.disponible=!1,this.cola=[],console.warn(`Registro de errores desactivado: falta ejecutar la migración 009.`));break}}}catch{}finally{this.enviando=!1}}}},O=15e3;function k(){return new Date().toLocaleDateString(`en-CA`,{timeZone:`America/Santiago`})}function A(e){return(e||``).toString().replace(/[,()"'\\]/g,` `).replace(/[%_]/g,``).trim()}function j(e){return e?.code===`42883`||e?.code===`PGRST202`||/function .* does not exist|could not find/i.test(e?.message||``)}async function M(e,t={}){let n=t.bloque||1e3,r=t.espera||25e3,i=[],o=0;for(;;){let{data:t,error:s}=await a(e(o,o+n-1),r);if(s)return{data:null,error:s};if(i.push(...t||[]),!t||t.length<n)break;o+=n}return{data:i,error:null}}var ye={async obtenerLibros(e=``,t=0,n=25){let r=t*n,{data:i,error:o}=await a(h.rpc(`buscar_libros`,{p_busqueda:e||``,p_limite:n,p_desplazamiento:r}),O);if(!o){let e=i||[];return{libros:e,total:e.length?Number(e[0].total_coincidencias):0}}if(!j(o))throw o;let s=h.from(`libros`).select(`*`,{count:`exact`}).order(`titulo`).range(r,r+n-1),c=A(e);c&&(s=s.or(`titulo.ilike.%${c}%,autor.ilike.%${c}%,isbn.ilike.%${c}%`));let{data:l,error:u,count:d}=await a(s,O);if(u)throw u;return{libros:l||[],total:d||0}},async actualizarLibro(e,t){let{error:n}=await a(h.from(`libros`).update({titulo:t.titulo,autor:t.autor,isbn:t.isbn,genero:t.genero||null,ubicacion:t.ubicacion||null,portada_url:t.portada_url||null,dias_prestamo_override:t.diasPrestamoOverride??null}).eq(`id`,e),O);if(n)throw Error(n.code===`23505`?`Ese ISBN ya pertenece a otro libro.`:`No se pudo guardar el libro.`)},async eliminarLibro(e){let{error:t}=await a(h.rpc(`eliminar_libro`,{p_libro_id:e}),O);if(t)throw j(t)?Error(`Falta ejecutar la migración 020 en Supabase.`):Error(t.message||`No se pudo eliminar el libro.`)},async listarLibrosEliminados(){let{data:e,error:t}=await a(h.rpc(`listar_libros_eliminados`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudieron listar los libros eliminados.`)}return e||[]},async restaurarLibro(e){let{error:t}=await a(h.rpc(`restaurar_libro`,{p_libro_id:e}),O);if(t)throw j(t)?Error(`Falta ejecutar la migración 021 en Supabase.`):Error(t.message||`No se pudo restaurar el libro.`)}},be={async obtenerLectores(e=``,t=0,n=25){if(!navigator.onLine)return await E.buscarLectoresLocales(e,t,n);let r=t*n,i=h.from(`lectores`).select(`*`,{count:`exact`}).order(`nombre`).range(r,r+n-1),o=A(e);o&&(i=i.or(`nombre.ilike.%${o}%,rut.ilike.%${o}%,email.ilike.%${o}%`));try{let{data:e,error:t,count:n}=await a(i,O);if(t)throw t;return{lectores:e||[],total:n||0}}catch(r){if(r.message===`Timeout`||String(r).includes(`fetch`)||!navigator.onLine)return await E.buscarLectoresLocales(e,t,n);throw r}},async actualizarLector(e,t){let{error:n}=await a(h.from(`lectores`).update({nombre:t.nombre,rut:t.rut,email:t.email,telefono:t.telefono}).eq(`id`,e),O);if(n)throw Error(n.code===`23505`?`Ese RUT ya pertenece a otro lector.`:`No se pudo guardar el lector.`)},async eliminarLector(e,t=`Derecho de supresión (ARCO)`){let{error:n}=await a(h.from(`lectores`).delete().eq(`id`,e),O);if(n){if(n.code===`23503`){let{error:n}=await a(h.from(`lectores`).update({nombre:`Lector Eliminado`,rut:`Anonimizado-`+e+`-`+Date.now(),email:null,telefono:null,motivo_bloqueo:t,bloqueado_manual:!0}).eq(`id`,e),O);if(n)throw Error(`No se pudo borrar ni anonimizar al lector: `+n.message);return}throw Error(`No se puede eliminar. El lector tiene historial en el sistema.`)}},async bloquearLector(e,t,n=null){let{error:r}=await a(h.rpc(`bloquear_lector`,{p_lector_id:e,p_bloquear:t,p_motivo:n}),O);if(r)throw j(r)?Error(`Falta ejecutar la migración 006 en Supabase.`):Error(r.message||`No se pudo cambiar el bloqueo.`)},async obtenerBloqueados(){let{data:e,error:t}=await a(h.from(`lectores`).select(`id, nombre, rut, email, telefono, motivo_bloqueo, bloqueado_en`).eq(`bloqueado_manual`,!0).order(`bloqueado_en`,{ascending:!1}),O);if(t){if(/does not exist/i.test(t.message||``))return null;throw t}return e||[]}},xe={async obtenerTodosActivosSinPaginar(){let{data:e,error:t}=await a(h.from(`prestamos`).select(`id, fecha_prestamo, fecha_devolucion_esperada, libros(titulo), lectores(nombre, rut, telefono)`).is(`fecha_devolucion_real`,null).order(`fecha_devolucion_esperada`,{ascending:!0}));if(t)throw Error(t.message);return e||[]},async obtenerPrestamos(e=`todos`,t=0,n=25,r=3){let i=k(),o=new Date(`${i}T12:00:00`);o.setDate(o.getDate()+r);let s=o.toISOString().split(`T`)[0],c=t=>e===`vencidos`?t.lt(`fecha_devolucion_esperada`,i):e===`porVencer`?t.gte(`fecha_devolucion_esperada`,i).lte(`fecha_devolucion_esperada`,s):t,l=t*n,u=h.from(`prestamos`).select(`id, fecha_prestamo, fecha_devolucion_esperada, estado, renovaciones, libros(id, titulo, stock), lectores(id, nombre, rut, email, telefono)`,{count:`exact`}).eq(`estado`,`activo`);u=c(u).order(`fecha_devolucion_esperada`).range(l,l+n-1);let d=e=>{let t=h.from(`prestamos`).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`activo`);return e===`vencidos`&&(t=t.lt(`fecha_devolucion_esperada`,i)),e===`porVencer`&&(t=t.gte(`fecha_devolucion_esperada`,i).lte(`fecha_devolucion_esperada`,s)),t},[f,p,m,ee]=await a(Promise.all([u,d(`todos`),d(`vencidos`),d(`porVencer`)]),O);if(f.error)throw f.error;return{prestamos:f.data||[],total:f.count||0,conteos:{todos:p.count||0,vencidos:m.count||0,porVencer:ee.count||0}}},async obtenerPendientesDeAviso(e=3){let t=k(),n=new Date(`${t}T12:00:00`);n.setDate(n.getDate()+e);let{data:r,error:i}=await a(h.from(`prestamos`).select(`id, fecha_devolucion_esperada, renovaciones, libros(id, titulo), lectores(id, nombre, rut, email, telefono)`).eq(`estado`,`activo`).lte(`fecha_devolucion_esperada`,n.toISOString().split(`T`)[0]).order(`fecha_devolucion_esperada`).limit(500),O);if(i)throw i;return r||[]}},Se={async ajustarCopias(e,t){let{data:n,error:r}=await a(h.rpc(`ajustar_copias`,{p_libro_id:e,p_copias_totales:t}),O);if(r)throw j(r)?Error(`Falta ejecutar la migración 006 en Supabase.`):Error(r.message||`No se pudo ajustar los ejemplares.`);return Array.isArray(n)?n[0]:n},async revisarInventario(){let{data:e,error:t}=await a(h.rpc(`revisar_inventario`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo revisar el inventario.`)}return e||[]},async corregirInventario(e){let{data:t,error:n}=await a(h.rpc(`corregir_inventario`,{p_libro_id:e}),O);if(n)throw Error(n.message||`No se pudo corregir el inventario.`);return Array.isArray(t)?t[0]:t},async obtenerParametros(){let{data:e,error:t}=await a(h.from(`parametros`).select(`clave, valor, descripcion`).order(`clave`),O);if(t){if(/does not exist/i.test(t.message||``))return null;throw t}return e||[]},async actualizarParametro(e,t){let{error:n}=await a(h.from(`parametros`).update({valor:String(t),actualizado_en:new Date().toISOString()}).eq(`clave`,e),O);if(n)throw Error(n.message||`No se pudo guardar el parámetro.`)}},Ce={async listarPersonal(){let{data:e,error:t}=await a(h.rpc(`listar_personal`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo listar el personal.`)}return e||[]},async asignarRol(e,t){let{error:n}=await a(h.rpc(`asignar_rol`,{p_usuario_id:e,p_rol:t}),O);if(n)throw Error(n.message||`No se pudo cambiar el rol.`)},async eliminarPersonal(e){let{error:t}=await a(h.rpc(`eliminar_personal`,{p_usuario_id:e}),O);if(t)throw Error(t.message||`No se pudo eliminar la cuenta.`)},async invitarPersonal(e,t){let{data:n,error:r}=await a(h.functions.invoke(`invitar-personal`,{body:{email:e,rol:t}}),O);if(r){let e=r.message;try{let t=await r.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e||`No se pudo enviar la invitación.`)}if(n?.error)throw Error(n.error);return n}},we={async miPerfil(){let{data:e,error:t}=await a(h.rpc(`mi_perfil`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo cargar tu perfil.`)}return Array.isArray(e)?e[0]:e},async actualizarMiPerfil({nombre:e,telefono:t,cargo:n}){let{error:r}=await a(h.rpc(`actualizar_mi_perfil`,{p_nombre:e,p_telefono:t||null,p_cargo:n||null}),O);if(r)throw j(r)?Error(`Falta ejecutar la migración 008 en Supabase.`):Error(r.message||`No se pudo guardar tu perfil.`)},async actualizarContactoLector(e,{nombre:t,email:n,telefono:r}){let{error:i}=await a(h.rpc(`actualizar_contacto_lector`,{p_lector_id:e,p_nombre:t,p_email:n||null,p_telefono:r||null}),O);if(i)throw j(i)?Error(`Falta ejecutar la migración 008 en Supabase.`):Error(i.message||`No se pudo guardar el contacto del lector.`)}},Te={async verificarDefiniciones(){let{data:e,error:t}=await a(h.rpc(`verificar_definiciones`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo verificar las definiciones.`)}return e||[]},async verificarCirculacion(){let{data:e,error:t}=await a(h.rpc(`verificar_circulacion`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo verificar la circulación.`)}return e||[]},async verificarRls(){let{data:e,error:t}=await a(h.rpc(`verificar_rls`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo verificar RLS.`)}return e||[]},async obtenerAuditoria(e=50){let{data:t,error:n}=await a(h.from(`auditoria`).select(`id, tabla, registro_id, accion, usuario_email, created_at`).order(`created_at`,{ascending:!1}).limit(e),O);if(n){if(n.code===`42P01`||/does not exist|could not find/i.test(n.message||``))return null;throw n}return t||[]}},Ee={async resumenErrores(){let{data:e,error:t}=await a(h.rpc(`resumen_errores`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo leer el registro de errores.`)}return Array.isArray(e)?e[0]:e},async listarErrores(e=100,t=!1){let{data:n,error:r}=await a(h.rpc(`listar_errores`,{p_limite:e,p_solo_nuevos:t}),O);if(r){if(j(r))return null;throw Error(r.message||`No se pudo leer el registro de errores.`)}return n||[]},async marcarErrorVisto(e=null){let{error:t}=await a(h.rpc(`marcar_error_visto`,{p_id:e}),O);if(t)throw Error(t.message||`No se pudo marcar el error.`)},async purgarErrores(e=90){let{data:t,error:n}=await a(h.rpc(`purgar_errores`,{p_dias:e}),O);if(n)throw Error(n.message||`No se pudo purgar el registro.`);return t??0}},De={async crearEnlaceEscaneo(e=4){let{data:t,error:n}=await a(h.rpc(`crear_enlace_escaneo`,{p_horas:e}),O);if(n)throw Error(n.message||`No se pudo generar el enlace.`);return t?.[0]||null},async listarEnlacesEscaneo(){let{data:e,error:t}=await a(h.rpc(`listar_enlaces_escaneo`),O);if(t){if(j(t))return null;throw Error(t.message||`No se pudo listar los enlaces.`)}return e||[]},async revocarEnlaceEscaneo(e){let{error:t}=await a(h.rpc(`revocar_enlace_escaneo`,{p_id:e}),O);if(t)throw Error(t.message||`No se pudo revocar el enlace.`)}},Oe={async exportarTodo(){let e=[`libros`,`lectores`,`prestamos`,`reservas`,`parametros`,`usuarios`],t={generado:new Date().toISOString(),version:1,tablas:{}};for(let n of e){let{data:e,error:r}=await M((e,t)=>h.from(n).select(`*`).range(e,t));if(r)throw Error(`No se pudo respaldar la tabla ${n}: ${r.message}`);t.tablas[n]=e||[]}return t},async obtenerRespaldos(e=5){let{data:t,error:n}=await a(h.from(`respaldos_log`).select(`*`).order(`ejecutado_en`,{ascending:!1}).limit(e),O);if(n){if(n.code===`42P01`||j(n))return[];throw Error(n.message||`No se pudo consultar el estado de los respaldos.`)}return t||[]}},ke={async exportarDatosLector(e){let{data:t,error:n}=await a(h.rpc(`exportar_datos_lector`,{p_rut:e}),O);if(n)throw j(n)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(n.message||`No se pudo exportar los datos.`);return t},async anonimizarLector(e,t){let{error:n}=await a(h.rpc(`anonimizar_lector`,{p_lector_id:e,p_motivo:t}),O);if(n)throw j(n)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(n.message||`No se pudo suprimir los datos.`)},async purgarDatosAntiguos(){let{data:e,error:t}=await a(h.rpc(`purgar_datos_antiguos`),O);if(t)throw j(t)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(t.message||`No se pudo ejecutar la purga.`);return e??0},async evidenciaIncidente(e,t){let{data:n,error:r}=await a(h.rpc(`evidencia_incidente`,{p_desde:e,p_hasta:t}),O);if(r)throw j(r)?Error(`Falta ejecutar la migración 007 en Supabase.`):Error(r.message||`No se pudo extraer la evidencia.`);return n}};function Ae(e){let t=new Date(`${e}T12:00:00Z`),n=new Date(t.toLocaleString(`en-US`,{timeZone:`UTC`})),r=new Date(t.toLocaleString(`en-US`,{timeZone:`America/Santiago`})),i=Math.round((r-n)/6e4),a=i<=0?`-`:`+`,o=Math.abs(i);return`${a}${String(Math.floor(o/60)).padStart(2,`0`)}:${String(o%60).padStart(2,`0`)}`}var je={async obtenerEstadisticas(){try{let e=k(),[t,n,r,i,o]=await a(Promise.all([h.from(`libros`).select(`*`,{count:`exact`,head:!0}),h.from(`lectores`).select(`*`,{count:`exact`,head:!0}),h.from(`prestamos`).select(`*`,{count:`exact`,head:!0}).eq(`estado`,`activo`),h.from(`prestamos`).select(`*`,{count:`exact`,head:!0}).eq(`estado`,`devuelto`),h.from(`prestamos`).select(`*`,{count:`exact`,head:!0}).eq(`estado`,`activo`).lt(`fecha_devolucion_esperada`,e)]),O),s=await M((e,t)=>h.from(`libros`).select(`stock`).range(e,t));if(s.error)throw s.error;let c=(s.data||[]).reduce((e,t)=>e+(t.stock||0),0);return{libros:t.count||0,lectores:n.count||0,prestamos:r.count||0,devueltos:i.count||0,noDevueltos:o.count||0,enEstante:c}}catch{return{libros:0,lectores:0,prestamos:0,devueltos:0,noDevueltos:0,enEstante:0}}},async obtenerReporte(e,t){let[n,r,i]=await Promise.all([M((n,r)=>h.from(`prestamos`).select(`id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, libros(id, titulo, autor), libro_titulo_archivado, libro_autor_archivado, lectores(id, nombre, rut)`).gte(`fecha_prestamo`,e).lte(`fecha_prestamo`,t).range(n,r)),M((n,r)=>h.from(`prestamos`).select(`id, fecha_devolucion_real, fecha_devolucion_esperada, libros(id, titulo)`).gte(`fecha_devolucion_real`,e).lte(`fecha_devolucion_real`,t).range(n,r)),M((n,r)=>h.from(`lectores`).select(`id, nombre, rut, created_at`).gte(`created_at`,`${e}T00:00:00${Ae(e)}`).lte(`created_at`,`${t}T23:59:59${Ae(t)}`).range(n,r))]),a=[n.error,r.error,i.error].filter(Boolean);if(a.some(e=>e.code===`42703`||/column .* does not exist/i.test(e.message||``)))return{faltaMigracion:!0};if(a.length)throw Error(a[0].message||`No se pudo generar el reporte.`);let o=(n.data||[]).map(e=>({...e,libros:e.libros||(e.libro_titulo_archivado?{id:null,titulo:e.libro_titulo_archivado,autor:e.libro_autor_archivado}:null)})),s=r.data||[],c=i.data||[],l=s.filter(e=>e.fecha_devolucion_real&&e.fecha_devolucion_esperada&&e.fecha_devolucion_real>e.fecha_devolucion_esperada).length,u=(e,t,n)=>{let r=new Map;return e.forEach(e=>{let i=t(e);if(i==null)return;let a=r.get(i)||{etiqueta:n(e),total:0};a.total++,r.set(i,a)}),[...r.values()].sort((e,t)=>t.total-e.total).slice(0,5)};return{faltaMigracion:!1,desde:e,hasta:t,totalPrestamos:o.length,totalDevoluciones:s.length,totalNuevosLectores:c.length,devolucionesAtrasadas:l,topLibros:u(o,e=>e.libros?.id??e.libros?.titulo,e=>e.libros?.titulo||`Sin título`),topLectores:u(o,e=>e.lectores?.id,e=>e.lectores?.nombre||`Sin nombre`),prestamos:o,nuevosLectores:c}}},Me={async obtenerReservasApartadas(){let{data:e,error:t}=await a(h.rpc(`listar_reservas`,{p_libro_id:null})).catch(()=>({data:null,error:null}));return t||!e?[]:e.filter(e=>e.estado===`apartada`)},async cancelarReserva(e){let{error:t}=await a(h.rpc(`cancelar_reserva`,{p_reserva_id:e}),O);if(t)throw j(t)?Error(`Falta ejecutar la migración 022 en Supabase para poder cancelar una reserva.`):Error(t.message||`No se pudo cancelar la reserva.`)},async listarReservas(e=null,t=!1){let{data:n,error:r}=await a(h.rpc(`listar_reservas`,{p_libro_id:e,p_incluir_historial:t}),O);if(r){if(j(r))return null;throw Error(r.message||`No se pudieron listar las reservas.`)}return n||[]}};function N(e){return!e?.code}var Ne=3e4,Pe=18e5,Fe=5,Ie={prestar_libro:e=>h.rpc(`prestar_libro`,e),devolver_prestamo:e=>h.rpc(`devolver_prestamo`,e),renovar_prestamo:e=>h.rpc(`renovar_prestamo`,e),reservar_libro:e=>h.rpc(`reservar_libro`,e),retirar_reserva:e=>h.rpc(`retirar_reserva`,e),agregar_libro:async e=>{let{error:t}=await h.from(`libros`).insert([e]);return t||await E.quitarLibroLocalOptimista(e.isbn),{error:t}},agregar_lector:async e=>{let{error:t}=await h.from(`lectores`).insert([e]);return t||await E.quitarLectorLocalOptimista(e.rut),{error:t}}};async function Le(e){let t=await E.buscarLibroLocalPorCodigo(e);if(!t)throw Error(`Sin conexión, y este libro no está en la copia local del mesón.`);return{libro:t,prestamos:[],offline:!0}}async function P(e){let t=await E.buscarLectorLocalPorRut(e);if(!t)throw Error(`Sin conexión, y este lector no está en la copia local del mesón (hay que consultarlo antes, con conexión, para poder atenderlo sin ella).`);let n=k(),r=t.prestamosActivosDetalle||[],i=r.filter(e=>e.fechaDevolucionEsperada&&e.fechaDevolucionEsperada<n),a=!t.bloqueadoManual,o=t.bloqueadoManual?Re(t.motivoBloqueo):null;if(a&&i.length>0){a=!1;let e=i[0].tituloLibro?` (incluye "${i[0].tituloLibro}")`:``;o=`Tiene ${i.length} libro(s) con la devolución atrasada${e}, según la última sincronización.`}return{existe:!0,offline:!0,lector_id:t.id,nombre:t.nombre,rut:t.rut,email:t.email,telefono:t.telefono,bloqueado_manual:!!t.bloqueadoManual,motivo_bloqueo:t.motivoBloqueo??null,prestamos_activos:r.length,prestamos_atrasados:i.length,atrasados_detalle:i,puede_prestar:a,motivo_rechazo:o}}function Re(e){return e?`Bloqueado por la biblioteca: ${e}`:`Bloqueado por la biblioteca.`}async function F(e){if(await E.buscarLibroLocalPorCodigo(e.isbn))throw Error(`El ISBN ya está registrado.`);return await E.guardarLibroLocalOptimista(e),L.encolar(`agregar_libro`,e,`Alta del libro "${e.titulo}" (ISBN ${e.isbn})`)}async function I(e){return await E.guardarLectorLocalOptimista(e),L.encolar(`agregar_lector`,e,`Alta del lector ${e.nombre} (RUT ${e.rut})`)}var L=new class{constructor(){this._reintentando=!1,this._temporizador=null,this._escuchas=new Set}async encolar(e,t,n){let r=await E.encolarOperacion(e,t,n);return this._programarReintento(1e3),await this._avisar(),{encolado:!0,id:r,mensaje:`Sin conexión: la operación se guardó y se completará sola apenas vuelva la red.`}}alCambiar(e){return this._escuchas.add(e),()=>this._escuchas.delete(e)}async _avisar(){if(this._escuchas.size!==0)try{let{pendientes:e}=await this.estado();this._escuchas.forEach(t=>t({pendientes:e,sincronizando:this._reintentando}))}catch{}}_programarReintento(e){typeof window>`u`||(clearTimeout(this._temporizador),this._temporizador=setTimeout(()=>this.reintentarPendientes(),e))}async reintentarPendientes(){if(!this._reintentando){this._reintentando=!0,await this._avisar();try{let e=await E.listarOperacionesPendientes(),t=Date.now();for(let n of e)n.proximoIntentoEn>t||await this._intentarUna(n)}catch{}finally{this._reintentando=!1;let e=await E.listarOperacionesPendientes().catch(()=>[]);if(e.length){let t=Math.min(...e.map(e=>e.proximoIntentoEn));this._programarReintento(Math.max(1e3,t-Date.now()))}await this._avisar()}}}async _intentarUna(e){let t=Ie[e.tipo];if(!t){await E.quitarOperacion(e.id),D.registrarOperacion(`sincronizacion`,Error(`Operación en cola de tipo desconocido: "${e.tipo}".`));return}try{let{error:n}=await t(e.params);if(n){N(n)?await this._reprogramar(e):await this._fallaPermanente(e,n.message||`Rechazado por el servidor.`);return}await E.quitarOperacion(e.id)}catch(t){N(t)?await this._reprogramar(e):await this._fallaPermanente(e,t?.message||String(t))}}async _reprogramar(e){let t=(e.intentos||0)+1,n=Math.min(Ne*2**(t-1),Pe);await E.actualizarOperacion(e.id,{intentos:t,proximoIntentoEn:Date.now()+n,ultimoError:`Sin conexión`}),t===Fe&&D.registrarOperacion(`sincronizacion`,Error(`Una operación pendiente (${e.descripcion||e.tipo}) lleva ${t} intentos sin poder sincronizarse por falta de conexión. Sigue en cola y se seguirá reintentando; revisar la conexión del equipo del mesón.`))}async _fallaPermanente(e,t){await E.quitarOperacion(e.id),D.registrarOperacion(`sincronizacion`,Error(`Operación pendiente (${e.descripcion||e.tipo}) rechazada al sincronizar, no se reintentará: ${t}`))}async estado(){return{pendientes:(await E.listarOperacionesPendientes()).length}}};typeof window<`u`&&window.addEventListener(`online`,()=>L.reintentarPendientes());async function R(e,t,n,r={}){let i;try{i=await a(h.rpc(e,t),O)}catch(r){if(N(r))return L.encolar(e,t,n);throw r}let{data:o,error:s}=i;if(s){if(j(s)&&r.migracionFaltante)throw Error(r.migracionFaltante);if(N(s))return L.encolar(e,t,n);throw Error(s.message||r.porDefecto||`Error en la operación ${e}.`)}return Array.isArray(o)?o[0]:o}var z={async registrarPrestamo(e,t){return R(`prestar_libro`,{p_libro_id:e,p_lector_rut:t},`Préstamo del libro #${e} al RUT ${t}`,{porDefecto:`Fallo al registrar préstamo.`})},async devolverPrestamo(e){return R(`devolver_prestamo`,{p_prestamo_id:e},`Devolución del préstamo #${e}`,{porDefecto:`Error en devolución.`})},async renovarPrestamo(e){return R(`renovar_prestamo`,{p_prestamo_id:e},`Renovación del préstamo #${e}`,{porDefecto:`No se pudo renovar el préstamo.`,migracionFaltante:`Falta ejecutar la migración 005 en Supabase para poder renovar.`})},async reservarLibro(e,t){return R(`reservar_libro`,{p_libro_id:e,p_lector_rut:t},`Reserva del libro #${e} para el RUT ${t}`,{porDefecto:`No se pudo registrar la reserva.`,migracionFaltante:`Falta ejecutar la migración 022 en Supabase para poder reservar.`})},async retirarReserva(e){return R(`retirar_reserva`,{p_reserva_id:e},`Retiro de la reserva #${e}`,{porDefecto:`No se pudo registrar el retiro.`,migracionFaltante:`Falta ejecutar la migración 022 en Supabase para poder retirar una reserva.`})},async consultarLibro(e){let t;try{t=await a(h.rpc(`consultar_libro`,{p_codigo:e}),O)}catch(t){if(N(t))return Le(e);throw t}let{data:n,error:r}=t;if(r){if(j(r))throw Error(`Falta ejecutar la migración 006 en Supabase para usar el mesón.`);if(N(r))return Le(e);throw Error(r.message||`No se pudo consultar el libro.`)}if(!n||n.length===0)return null;let i=n[0];return{libro:{id:i.libro_id,isbn:i.isbn,titulo:i.titulo,autor:i.autor,genero:i.genero,ubicacion:i.ubicacion,portada_url:i.portada_url,copias_totales:i.copias_totales,stock:i.stock},prestamos:n.filter(e=>e.prestamo_id!=null).map(e=>({id:e.prestamo_id,fecha_prestamo:e.fecha_prestamo,fecha_devolucion_esperada:e.fecha_devolucion_esperada,dias_restantes:e.dias_restantes,renovaciones:e.renovaciones,lector:{id:e.lector_id,nombre:e.lector_nombre,rut:e.lector_rut,email:e.lector_email,telefono:e.lector_telefono,bloqueado_manual:e.lector_bloqueado,atrasados:e.lector_atrasados}}))}},async estadoLector(e){let t;try{t=await a(h.rpc(`estado_lector`,{p_rut:e}),O)}catch(t){if(N(t))return P(e);throw t}let{data:n,error:r}=t;if(r){if(j(r))throw Error(`Falta ejecutar la migración 006 en Supabase.`);if(N(r))return P(e);throw Error(r.message||`No se pudo consultar el lector.`)}let i=Array.isArray(n)?n[0]:n,o;if(i?.existe&&i.lector_id!=null)try{let{data:e}=await a(h.from(`prestamos`).select(`fecha_devolucion_esperada, libros(titulo)`).eq(`lector_id`,i.lector_id).eq(`estado`,`activo`),O);o=(e||[]).map(e=>({fechaDevolucionEsperada:e.fecha_devolucion_esperada??null,tituloLibro:e.libros?.titulo??null}))}catch{o=void 0}return E.guardarLectorConsultado({...i,prestamos_activos_detalle:o}).catch(()=>{}),i},async agregarLibro(e){let t={isbn:e.isbn,titulo:e.titulo,autor:e.autor,genero:e.genero||null,ubicacion:e.ubicacion||null,portada_url:e.portada_url||null,copias_totales:e.stock,stock:e.stock},n;try{n=await a(h.from(`libros`).insert([t]),O)}catch(e){if(N(e))return F(t);throw e}let{error:r}=n;if(r){if(N(r))return F(t);throw Error(r.code===`23505`?`El ISBN ya está registrado.`:`Error al guardar el libro.`)}},async agregarLector(e){let t={rut:e.rut,nombre:e.nombre,email:e.email,telefono:e.telefono,consentimiento_fecha:e.consentimiento_fecha||null,consentimiento_version:e.consentimiento_version||null,es_menor:e.es_menor||!1,apoderado_nombre:e.apoderado_nombre||null,apoderado_rut:e.apoderado_rut||null},n;try{n=await a(h.from(`lectores`).insert([t]),O)}catch(e){if(N(e))return I(t);throw e}let{error:r}=n;if(r){if(N(r))return I(t);throw Error(r.code===`23505`?`El RUT ya está registrado.`:`Error al guardar lector.`)}},...ye,...be,...xe,...Se,...Ce,...we,...Te,...Ee,...De,...Oe,...ke,...je,...Me},B={async miPerfil(){return z.miPerfil()},async actualizarMiPerfil(e){return z.actualizarMiPerfil(e)},async obtenerParametros(){return z.obtenerParametros()},async listarPersonal(){return z.listarPersonal()},async invitarPersonal(e,t){return z.invitarPersonal(e,t)},async asignarRol(e,t){return z.asignarRol(e,t)},async eliminarPersonal(e){return z.eliminarPersonal(e)},async actualizarParametro(e,t){return z.actualizarParametro(e,t)}},V=new class{constructor(){this._enLinea=typeof navigator<`u`?navigator.onLine!==!1:!0,this._sincronizando=!1,this._pendientes=0,this._escuchas=new Set,this._iniciado=!1}iniciar(){this._iniciado||typeof window>`u`||(this._iniciado=!0,window.addEventListener(`online`,()=>this._actualizar({enLinea:!0})),window.addEventListener(`offline`,()=>this._actualizar({enLinea:!1})),L.alCambiar(({pendientes:e,sincronizando:t})=>{this._actualizar({pendientes:e,sincronizando:t})}),L.estado().then(({pendientes:e})=>this._actualizar({pendientes:e})).catch(()=>{}))}suscribir(e){return this._escuchas.add(e),e(this.obtener()),()=>this._escuchas.delete(e)}obtener(){return{enLinea:this._enLinea,sincronizando:this._sincronizando,pendientes:this._pendientes}}_actualizar(e){e.enLinea!==void 0&&(this._enLinea=e.enLinea),e.sincronizando!==void 0&&(this._sincronizando=e.sincronizando),e.pendientes!==void 0&&(this._pendientes=e.pendientes);let t=this.obtener();this._escuchas.forEach(e=>e(t))}},H={async obtenerPrestamos(e=`activos`,t=0,n=25,r=2){return z.obtenerPrestamos(e,t,n,r)},async obtenerTodosActivosSinPaginar(){return z.obtenerTodosActivosSinPaginar()},async obtenerPendientesDeAviso(e=2){return z.obtenerPendientesDeAviso(e)},async registrarPrestamo(e,t){return z.registrarPrestamo(e,t)},async devolverPrestamo(e){return z.devolverPrestamo(e)},async renovarPrestamo(e){return z.renovarPrestamo(e)}},U={},W=null;function ze(){return window.Chart?Promise.resolve():W||(W=new Promise((e,t)=>{let n=document.createElement(`script`);n.src=`vendor/js/chart.umd.js`,n.onload=()=>e(),n.onerror=()=>t(Error(`No se pudo cargar Chart.js`)),document.head.appendChild(n)}),W)}var Be=`biblionexo-escala-fuente`;function Ve(){try{let e=localStorage.getItem(Be);e&&document.documentElement.style.setProperty(`--escala-fuente`,e)}catch{}}var He=class e{constructor(){this.currentView=null,this.currentUserRole=`librero`,this._lastScannedCode=null,this._lastScanTimestamp=0,this.bookPage=0,this.userPage=0,this.loanPage=0,this.catalogSearch=``,this.userSearch=``,this.loanFilter=`todos`,this.reportPeriod=`mes`,this.adminTab=`inventario`,this._parametros=null,this._controlInactividadActivo=!1,this._loansCache=[],this._booksCache=[],this._usersCache=[],this.sesionRenderizada=!1,window.uiManager=this,Ve(),document.getElementById(`login-form`)&&this.initLoginForm()}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}formatRut(e){let t=(e||``).toString().replace(/[.\-\s]/g,``).toUpperCase();return t.length<2?t:`${t.slice(0,-1)}-${t.slice(-1)}`}isValidRut(e){let t=(e||``).toString().replace(/[.\-\s]/g,``).toUpperCase();if(!/^\d{7,8}[0-9K]$/.test(t))return!1;let n=t.slice(0,-1),r=t.slice(-1),i=0,a=2;for(let e=n.length-1;e>=0;e--)i+=Number(n[e])*a,a=a===7?2:a+1;let o=11-i%11;return r===(o===11?`0`:o===10?`K`:String(o))}formatPhone(e){let t=(e||``).toString().replace(/\D/g,``);return t.startsWith(`56`)?t:t.startsWith(`9`)&&t.length===9?`56${t}`:t.length===8?`569${t}`:t}validarPassword(e){return e?e.length<12?`La contraseña debe tener al menos 12 caracteres.`:/[A-Z]/.test(e)?/[0-9]/.test(e)?null:`La contraseña debe tener al menos un número.`:`La contraseña debe tener al menos una letra mayúscula.`:`La contraseña no puede estar vacía.`}validateUserForm(e=!1){let t=document.getElementById(e?`edit-user-id`:`new-user-id`)?.value.trim()||``,n=document.getElementById(e?`edit-user-name`:`new-user-name`)?.value.trim()||``,r=document.getElementById(e?`edit-user-email`:`new-user-email`)?.value.trim()||``,i=document.getElementById(e?`edit-user-phone`:`new-user-phone`)?.value.trim()||``;return n?n.split(/\s+/).length<2?(this.showToast(`Escribe el nombre y al menos un apellido.`,`error`),!1):!t&&!e?(this.showToast(`Escribe el RUT del lector.`,`error`),!1):t&&!this.isValidRut(t)?(this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`),!1):i?this.formatPhone(i).length<11?(this.showToast(`El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.`,`error`),!1):r?this.isValidEmail(r)?!0:(this.showToast(`El correo no es válido.`,`error`),!1):(this.showToast(`Escribe el correo del lector.`,`error`),!1):(this.showToast(`Escribe el teléfono del lector.`,`error`),!1):(this.showToast(`Escribe el nombre completo del lector.`,`error`),!1)}validateBookForm(e=!1){let t=e===!0||e===`edit`,n=t?`edit-book`:e===!1||e===`new`?`new-book`:e,r=document.getElementById(`${n}-isbn`)?.value.trim()||``,i=document.getElementById(`${n}-title`)?.value.trim()||``,a=document.getElementById(`${n}-author`)?.value.trim()||``,o=document.getElementById(`${n}-qty`)?.value||``,s=parseInt(o,10);return!r&&!t?(this.showToast(`El ISBN es obligatorio.`,`error`),!1):i?a?isNaN(s)||s<+!t?(this.showToast(t?`La cantidad no puede ser negativa.`:`La cantidad debe ser al menos 1.`,`error`),!1):!0:(this.showToast(`El autor es obligatorio.`,`error`),!1):(this.showToast(`El título es obligatorio.`,`error`),!1)}initLoginForm(){let e=document.getElementById(`email-input`),t=document.getElementById(`password-input`),n=document.getElementById(`login-form`),r=n.querySelector(`button[type="submit"]`),i=this.createErrorSpan(e),a=this.createErrorSpan(t);e.addEventListener(`input`,()=>{this.isValidEmail(e.value.trim())?this.clearInlineError(e,i):this.showInlineError(e,i,`Correo inválido.`)}),t.addEventListener(`input`,()=>{t.value.length===0?this.showInlineError(t,a,`Contraseña requerida.`):this.clearInlineError(t,a)}),n.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.value.trim(),s=t.value,c=!0;if(o?this.isValidEmail(o)?this.clearInlineError(e,i):(this.showInlineError(e,i,`Correo inválido.`),c=!1):(this.showInlineError(e,i,`El correo es obligatorio.`),c=!1),s?this.clearInlineError(t,a):(this.showInlineError(t,a,`La contraseña es obligatoria.`),c=!1),!c)return;r.disabled=!0;let l=this.showSpinner(r);try{await ee(o,s),this.showToast(`Sesión iniciada correctamente.`,`success`)}catch(e){this.showToast(e.message||`Error al iniciar sesión.`,`error`)}finally{r.disabled=!1,this.hideSpinner(l)}})}createErrorSpan(e){let t=e.parentNode.querySelector(`.input-error`);return t||(t=document.createElement(`span`),t.className=`input-error text-xs text-rose-700 mt-1 block font-bold`,e.parentNode.appendChild(t)),t}showInlineError(e,t,n){t.textContent=n,e.classList.add(`border-rose-700`,`ring-rose-700`),e.setAttribute(`aria-invalid`,`true`)}clearInlineError(e,t){t.textContent=``,e.classList.remove(`border-rose-700`,`ring-rose-700`),e.removeAttribute(`aria-invalid`)}showSpinner(e){let t=document.createElement(`span`);return t.className=`spinner ml-2 inline-block border-[3px] border-t-white border-white/30 rounded-full w-4 h-4 animate-spin`,e.appendChild(t),t}hideSpinner(e){e&&e.parentNode&&e.parentNode.removeChild(e)}_diasRestantes(e){let[t,n,r]=k().split(`-`).map(Number),i=new Date(t,n-1,r),[a,o,s]=(e||``).split(`-`).map(Number),c=new Date(a,(o||1)-1,s||1);return Math.round((c-i)/864e5)}_estadoPrestamo(e){let t=this._diasRestantes(e);return t<0?{clave:`vencido`,dias:t,etiqueta:`Atrasado ${Math.abs(t)} ${Math.abs(t)===1?`día`:`días`}`}:t===0?{clave:`porVencer`,dias:t,etiqueta:`Vence hoy`}:t<=this.param(`dias_aviso_previo`)?{clave:`porVencer`,dias:t,etiqueta:`Vence en ${t} ${t===1?`día`:`días`}`}:{clave:`alDia`,dias:t,etiqueta:`Vence en ${t} días`}}_textoAviso(e){let t=this._estadoPrestamo(e.fecha_devolucion_esperada),n=e.lectores?.nombre||`Estimado/a lector/a`,r=e.libros?.titulo||`el libro prestado`,i=this._fechaLegible(e.fecha_devolucion_esperada),a=l.BIBLIOTECA,o=Math.abs(t.dias),s=o===1?`día`:`días`,c;return c=t.clave===`vencido`?`El plazo de devolución de “${r}” venció el ${i}, hace ${o} ${s}.\n\nMientras el libro no sea devuelto, tu inscripción queda suspendida y no podrás llevar otros libros. La suspensión se levanta automáticamente al momento de devolverlo.\n\nTe pedimos acercarte a la biblioteca para regularizar tu situación.`:t.dias===0?`“${r}” debe ser devuelto hoy.\n\nSi no lo devuelves, tu inscripción quedará suspendida y no podrás llevar otros libros hasta regularizar. Si necesitas más tiempo, puedes acercarte a la biblioteca para renovar el préstamo.`:`Te recordamos que “${r}” debe ser devuelto el ${i}, en ${o} ${s}.\n\nPasada esa fecha, tu inscripción queda suspendida y no podrás llevar otros libros hasta devolverlo. Si necesitas más tiempo, puedes renovar el préstamo acercándote a la biblioteca.`,`Hola ${n}:\n\n${c}\n\n${a.nombre}\n${a.direccion} · ${a.telefono}`}_fechaLegible(e){let[t,n,r]=(e||``).split(`-`).map(Number);return t?new Date(t,(n||1)-1,r||1).toLocaleDateString(`es-CL`,{day:`numeric`,month:`long`,year:`numeric`}):e||``}_fechaHoraLegible(e){if(!e)return`—`;let t=new Date(e);return isNaN(t)?e:t.toLocaleString(`es-CL`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`})}showNotifyModal(e){let n=this._textoAviso(e),r=this._estadoPrestamo(e.fecha_devolucion_esperada),i=e.lectores||{},a=this.formatPhone(i.telefono),o=i.email,s=r.clave===`vencido`?`Devolución pendiente en la Biblioteca Municipal de Futrono`:`Recordatorio de devolución — Biblioteca Municipal de Futrono`,c=document.createElement(`div`);c.className=`fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4`,c.innerHTML=`
      <div class="bg-patrimonio-card dark:bg-stone-900/95 backdrop-blur-xl border border-white/20 dark:border-stone-700/50 rounded-[2rem] max-w-lg w-full p-8 shadow-soft-xl shadow-patrimonio-lago/20 transform transition-all space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Avisar a ${t(i.nombre||`el lector`)}</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">${t(r.etiqueta)} · ${t(e.libros?.titulo||``)}</p>
        </div>

        <div>
          <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Mensaje</label>
          <textarea id="notify-message" aria-label="Texto del aviso al lector" rows="7" class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">${t(n)}</textarea>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Puedes editarlo antes de enviarlo.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button data-action="whatsapp" ${a.length<11?`disabled`:``}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-bosque hover:bg-[#22392F] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fa-brands fa-whatsapp"></i> WhatsApp
          </button>
          <button data-action="email" ${o?``:`disabled`}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-lago hover:bg-[#14303c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-envelope"></i> Correo
          </button>
          <button data-action="copy"
            class="btn-secundario flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:bg-stone-800/50 text-stone-700 px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-copy"></i> Copiar
          </button>
        </div>
        ${a.length<11||!o?`<p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">Este lector no tiene ${o?``:`correo`}${!o&&a.length<11?` ni `:``}${a.length<11?`teléfono`:``} registrado. Complétalo en la vista Lectores para poder avisarle.</p>`:``}

        <div class="flex justify-end pt-1">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cerrar</button>
        </div>
      </div>
    `,document.body.appendChild(c);let l=c.querySelector(`#notify-message`),u=this._prepararModal(c);c.querySelector(`[data-action="close"]`).addEventListener(`click`,u),c.addEventListener(`click`,e=>{e.target===c&&u()}),c.querySelector(`[data-action="whatsapp"]`).addEventListener(`click`,()=>{window.open(`https://wa.me/${a}?text=${encodeURIComponent(l.value)}`,`_blank`,`noopener`),u()}),c.querySelector(`[data-action="email"]`).addEventListener(`click`,()=>{window.location.href=`mailto:${o}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(l.value)}`,u()}),c.querySelector(`[data-action="copy"]`).addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(l.value),this.showToast(`Mensaje copiado.`,`success`)}catch{l.select(),this.showToast(`Selecciona y copia el mensaje manualmente.`,`error`)}})}showNotifyReservaModal(e,n,r){let i=this._fechaLegible?this._fechaLegible(e.vence_apartado_en):e.vence_apartado_en||`próximamente`,a=`Estimado/a ${r.nombre||`lector/a`},\n\nEl libro "${n?.titulo||``}" que reservaste ya está disponible para ti en la Biblioteca Pública Municipal de Futrono.\n\nTienes plazo hasta el ${i} para retirarlo en el mesón. ¡Te esperamos!`,o=this.formatPhone(r.telefono),s=r.email,c=document.createElement(`div`);c.className=`fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4`,c.innerHTML=`
      <div class="bg-patrimonio-card dark:bg-stone-900/95 backdrop-blur-xl border border-white/20 dark:border-stone-700/50 rounded-[2rem] max-w-lg w-full p-8 shadow-soft-xl shadow-patrimonio-lago/20 transform transition-all space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Avisar a ${t(r.nombre||`el lector`)}</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Reserva disponible · ${t(n?.titulo||``)}</p>
        </div>

        <div>
          <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Mensaje</label>
          <textarea id="notify-reserva-message" aria-label="Texto del aviso al lector" rows="7"
            class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">${t(a)}</textarea>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Puedes editarlo antes de enviarlo.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button data-action="whatsapp" ${o.length<11?`disabled`:``}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-bosque hover:bg-[#22392F] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fa-brands fa-whatsapp"></i> WhatsApp
          </button>
          <button data-action="email" ${s?``:`disabled`}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-lago hover:bg-[#14303c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-envelope"></i> Correo
          </button>
          <button data-action="copy"
            class="btn-secundario flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:bg-stone-800/50 text-stone-700 px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-copy"></i> Copiar
          </button>
        </div>
        ${o.length<11||!s?`<p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">Este lector no tiene ${s?``:`correo`}${!s&&o.length<11?` ni `:``}${o.length<11?`teléfono`:``} registrado. Complétalo en la vista Lectores para poder avisarle.</p>`:``}

        <div class="flex justify-end pt-1">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cerrar</button>
        </div>
      </div>
    `,document.body.appendChild(c);let l=c.querySelector(`#notify-reserva-message`),u=this._prepararModal(c);c.querySelector(`[data-action="close"]`).addEventListener(`click`,u),c.addEventListener(`click`,e=>{e.target===c&&u()}),c.querySelector(`[data-action="whatsapp"]`).addEventListener(`click`,()=>{window.open(`https://wa.me/${o}?text=${encodeURIComponent(l.value)}`,`_blank`,`noopener`),u()}),c.querySelector(`[data-action="email"]`).addEventListener(`click`,()=>{window.location.href=`mailto:${s}?subject=Tu%20reserva%20est%C3%A1%20lista%20%E2%80%94%20Biblioteca%20Municipal%20de%20Futrono&body=${encodeURIComponent(l.value)}`,u()}),c.querySelector(`[data-action="copy"]`).addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(l.value),this.showToast(`Mensaje copiado.`,`success`)}catch{l.select(),this.showToast(`Selecciona y copia el mensaje manualmente.`,`error`)}})}_portadaUrl(e){return o(e)}_portadaHtml(e,t=`w-10 h-14`){return i(e,t)}_vigilarPortadas(){n()}_paginacionHtml(e,t,n,r){let i=Math.ceil(t/n);return i<=1?``:`
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50/60">
        <p class="text-xs text-stone-500 dark:text-stone-400">Mostrando ${e*n+1}–${Math.min((e+1)*n,t)} de ${t}</p>
        <div class="flex items-center gap-1">
          <button data-page="${e-1}" aria-label="Página anterior" ${e===0?`disabled`:``}
            class="${r} px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:border-patrimonio-lago disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-chevron-left"></i>
          </button>
          <span class="text-xs text-stone-600 dark:text-stone-300 px-2 tabular-nums">${e+1} / ${i}</span>
          <button data-page="${e+1}" aria-label="Página siguiente" ${e>=i-1?`disabled`:``}
            class="${r} px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold hover:border-patrimonio-lago disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>`}static get CONSENTIMIENTO(){return{version:`2026-07-v1`,texto:`Los datos que entregues se usan únicamente para administrar tus préstamos y avisarte cuando debas devolver un libro. El responsable es la Ilustre Municipalidad de Futrono. Puedes pedir acceder a tus datos, corregirlos o solicitar su eliminación en el mesón de la biblioteca. No se comparten con terceros ni se usan para otros fines.`}}_bloqueConsentimiento(n=`new`){let r=e.CONSENTIMIENTO;return`
      <div class="border border-stone-300 dark:border-stone-600 rounded-xl p-3 bg-stone-50 dark:bg-stone-800/50/60 space-y-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Tratamiento de datos personales</p>
        <p class="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">${t(r.texto)} <a href="/privacidad.html" target="_blank" rel="noopener" class="text-patrimonio-lago hover:underline">Ver la política completa.</a></p>
        <label class="flex items-start gap-2 cursor-pointer pt-1">
          <input type="checkbox" id="${n}-user-consent" class="mt-0.5 accent-[#7A431D]" />
          <span class="text-[11px] text-stone-700">El lector fue informado y autoriza el uso de sus datos para este fin.</span>
        </label>
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" id="${n}-user-minor" class="mt-0.5 accent-[#7A431D]" />
          <span class="text-[11px] text-stone-700">Es menor de 18 años (requiere autorización del apoderado).</span>
        </label>
        <div id="${n}-guardian-fields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <input id="${n}-guardian-name" aria-label="Nombre del apoderado" placeholder="Nombre del apoderado"
            class="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago" />
          <input id="${n}-guardian-rut" aria-label="RUT del apoderado" placeholder="RUT del apoderado"
            class="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-patrimonio-lago" />
        </div>
      </div>`}_bindConsentimiento(e=`new`){let t=document.getElementById(`${e}-user-minor`),n=document.getElementById(`${e}-guardian-fields`);t?.addEventListener(`change`,()=>n?.classList.toggle(`hidden`,!t.checked))}_datosConsentimiento(t=`new`){if(!document.getElementById(`${t}-user-consent`)?.checked)return this.showToast(`Debes confirmar que el lector fue informado sobre el uso de sus datos.`,`error`),null;let n=document.getElementById(`${t}-user-minor`)?.checked||!1,r=document.getElementById(`${t}-guardian-name`)?.value.trim()||``,i=document.getElementById(`${t}-guardian-rut`)?.value.trim()||``;if(n){if(!r)return this.showToast(`Escribe el nombre del apoderado.`,`error`),null;if(!this.isValidRut(i))return this.showToast(`El RUT del apoderado no es válido.`,`error`),null}return{consentimiento_fecha:new Date().toISOString(),consentimiento_version:e.CONSENTIMIENTO.version,es_menor:n,apoderado_nombre:n?r:null,apoderado_rut:n?this.formatRut(i):null}}async cargarParametros(){try{let e=await B.obtenerParametros();e&&(this._parametros=Object.fromEntries(e.map(e=>[e.clave,e.valor])))}catch{this._parametros=null}}param(e){let t={max_prestamos_por_lector:l.MAX_PRESTAMOS_POR_LECTOR,max_renovaciones:l.MAX_RENOVACIONES,dias_aviso_previo:l.DIAS_AVISO_PREVIO,dias_prestamo:7,filas_por_pagina:l.FILAS_POR_PAGINA},n=this._parametros?.[e],r=Number(n);return Number.isFinite(r)&&n!=null&&n!==``?r:t[e]}iniciarControlDeInactividad(e=20){let t=e*60*1e3,n=t-6e4,r=!1,i=()=>{document.getElementById(`aviso-inactividad`)?.remove(),r=!1},a=()=>{if(r)return;r=!0;let e=document.createElement(`div`);e.id=`aviso-inactividad`,e.setAttribute(`role`,`alert`),e.className=`fixed bottom-5 left-5 z-[10001] max-w-xs bg-patrimonio-card dark:bg-stone-900 border-2 border-amber-400 rounded-xl shadow-2xl p-4`,e.innerHTML=`
        <p class="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
          <i aria-hidden="true" class="fas fa-clock text-amber-700 mr-1.5"></i>Sesión por cerrarse
        </p>
        <p class="text-xs text-stone-600 dark:text-stone-300">Por seguridad, la sesión se cerrará en un minuto por inactividad.</p>
        <button id="seguir-activo-btn" class="btn-madera mt-3 w-full text-white rounded-lg py-2 text-xs font-bold">
          Seguir trabajando
        </button>`,document.body.appendChild(e),document.getElementById(`seguir-activo-btn`).addEventListener(`click`,o)},o=()=>{clearTimeout(this._temporizadorAviso),clearTimeout(this._temporizadorCierre),i(),this._temporizadorAviso=setTimeout(a,n),this._temporizadorCierre=setTimeout(async()=>{this.showToast(`Sesión cerrada por inactividad.`,`error`),await g()},t)};this._inactividadHandler=()=>{r||o()},[`mousedown`,`keydown`,`touchstart`,`scroll`].forEach(e=>{document.addEventListener(e,this._inactividadHandler,{passive:!0})}),o(),this._controlInactividadActivo=!0}limpiarControlDeInactividad(){this._controlInactividadActivo&&=(clearTimeout(this._temporizadorAviso),clearTimeout(this._temporizadorCierre),[`mousedown`,`keydown`,`touchstart`,`scroll`].forEach(e=>{document.removeEventListener(e,this._inactividadHandler)}),this._inactividadHandler=null,!1)}async updateUserInfo(e){this._perfil=null;try{this._perfil=await B.miPerfil()}catch(e){console.warn(`No se pudo cargar el perfil:`,e.message)}this.currentUserEmail=this._perfil?.email||e.email||``,this.currentUserName=this._perfil?.nombre||``,this.currentUserRole=this._perfil?.rol||await se(e),this.desajusteDeRol=!1,this.currentUserRole!==`admin`&&oe(this.currentUserEmail)&&(this.currentUserRole=`admin`,this.desajusteDeRol=!0,console.warn(`El correo ${this.currentUserEmail} figura en CONFIG.ADMIN_EMAILS, pero su fila en la tabla "usuarios" no dice admin. Se muestra la interfaz de administrador, pero el servidor rechazará las acciones hasta que el rol quede asignado en la base de datos.`));let t=l.ROLE_LABELS[this.currentUserRole]||l.ROLE_LABELS.librero,n=document.getElementById(`current-user-name`),r=document.getElementById(`current-user-sub`),i=document.getElementById(`current-user-badge`),a=document.getElementById(`current-user-initial`);n&&(n.textContent=this.currentUserName||this.currentUserEmail),r&&(r.textContent=this.currentUserName?this.currentUserEmail:``),i&&(i.textContent=this._perfil?.cargo||t.title),a&&(a.textContent=(this.currentUserName||this.currentUserEmail||`?`).trim().charAt(0).toUpperCase())}_nombreParaSaludo(){return this.currentUserName?this.currentUserName.split(/\s+/)[0]:(l.ROLE_LABELS[this.currentUserRole]||l.ROLE_LABELS.librero).title}async _actualizarBadgeAtrasados(){let e=document.getElementById(`badge-atrasados`),t=document.getElementById(`notificaciones-badge`),n=document.getElementById(`notificaciones-lista`);try{let{conteos:r}=await H.obtenerPrestamos(`todos`,0,1,0),i=0,a=``;r.vencidos>0?(e&&(e.textContent=r.vencidos,e.classList.remove(`hidden`)),i+=1,a+=`
          <div class="p-4 flex items-start gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition cursor-pointer" onclick="document.querySelector('[data-view=\'loans\']').click()">
            <div class="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shrink-0">
              <i aria-hidden="true" class="fas fa-exclamation-triangle text-xs"></i>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-stone-800 dark:text-stone-200">Préstamos vencidos</p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Tienes ${r.vencidos} préstamo(s) fuera de plazo.</p>
            </div>
          </div>`):e&&e.classList.add(`hidden`),r.porVencer>0&&(i+=1,a+=`
          <div class="p-4 flex items-start gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition cursor-pointer" onclick="document.querySelector('[data-view=\'loans\']').click()">
            <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
              <i aria-hidden="true" class="fas fa-clock text-xs"></i>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-stone-800 dark:text-stone-200">Préstamos por vencer</p>
              <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Hay ${r.porVencer} préstamo(s) que vencen pronto.</p>
            </div>
          </div>`),i>0?(t&&(t.textContent=i,t.classList.remove(`hidden`)),n&&(n.innerHTML=a)):(t&&t.classList.add(`hidden`),n&&(n.innerHTML=`<div class="p-6 text-center text-stone-500 text-sm"><i aria-hidden="true" class="fas fa-check-circle text-2xl text-emerald-500 mb-2 block"></i> Todo está al día.</div>`))}catch{e&&e.classList.add(`hidden`),t&&t.classList.add(`hidden`)}}renderNavMenu(){let e=document.getElementById(`nav-menu`);if(!e)return;let n=l.VIEWS_BY_ROLE[this.currentUserRole]||l.VIEWS_BY_ROLE.librero,r=[];n.forEach(e=>{let t=e.section||`General`,n=r.find(e=>e.name===t);n||(n={name:t,items:[]},r.push(n)),n.items.push(e)}),e.innerHTML=r.map(e=>`
      <div class="mb-5">
        <p class="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">${t(e.name)}</p>
        <div class="space-y-0.5">
          ${e.items.map(e=>`
            <button
              data-view="${e.id}"
              class="nav-btn w-full px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition text-stone-300 hover:bg-white dark:bg-stone-800/10 hover:text-white"
            >
              <i aria-hidden="true" class="fas ${e.icon} w-4 text-center ${e.id===`scanner`?`text-amber-400`:``}"></i>
              <span>${t(e.label)}</span>
            </button>
          `).join(``)}
        </div>
      </div>
    `).join(``),e.querySelectorAll(`.nav-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.switchView(e.dataset.view),document.getElementById(`sidebar`)?.classList.remove(`active`),document.getElementById(`sidebar-overlay`)?.classList.add(`hidden`)})}),this._actualizarBadgeAtrasados()}_setActiveNavButton(e){document.querySelectorAll(`#nav-menu .nav-btn`).forEach(t=>{let n=t.dataset.view===e;t.classList.toggle(`bg-patrimonio-madera`,n),t.classList.toggle(`text-white`,n),t.classList.toggle(`text-stone-300`,!n)})}_skeletonLoader(e){return e===`catalog`||e===`users`||e===`loans`?`
          <div class="flex flex-col gap-4 p-4 animate-pulse">
            ${[,,,,].fill(0).map(()=>`
              <div class="bg-white dark:bg-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center border border-stone-200 dark:border-stone-700 shadow-sm">
                <div class="flex items-start gap-4 flex-1">
                  <div class="w-16 h-24 bg-stone-200 rounded-lg shrink-0"></div>
                  <div class="flex flex-col justify-center gap-2 flex-1 py-1">
                    <div class="h-5 bg-stone-200 rounded-md w-3/4"></div>
                    <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded-md w-1/2"></div>
                    <div class="flex gap-2 mt-2">
                      <div class="h-5 bg-stone-100 dark:bg-stone-700 rounded-md w-16"></div>
                      <div class="h-5 bg-stone-100 dark:bg-stone-700 rounded-md w-20"></div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-2 shrink-0 sm:w-32 hidden sm:flex">
                   <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded-md w-16"></div>
                   <div class="h-8 bg-stone-200 rounded-xl w-24"></div>
                </div>
              </div>
            `).join(``)}
          </div>
        `:e===`dashboard`?`
          <div class="animate-pulse p-4">
            <div class="mb-5 space-y-2">
               <div class="h-6 bg-stone-200 rounded-md w-1/3"></div>
               <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded-md w-1/4"></div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              ${[,,,,].fill(0).map(()=>`
                <div class="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 p-6 shadow-sm">
                  <div class="h-6 w-6 bg-stone-200 rounded-full mb-3"></div>
                  <div class="h-10 bg-stone-200 rounded-md w-1/2 mb-2"></div>
                  <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded-md w-3/4"></div>
                </div>
              `).join(``)}
            </div>
          </div>
        `:`<div class="flex justify-center py-20 animate-pulse"><i aria-hidden="true" class="fas fa-circle-notch fa-spin text-4xl text-patrimonio-lago"></i></div>`}async switchView(e){this.currentView=e,this._setActiveNavButton(e);let n=(l.VIEWS_BY_ROLE[this.currentUserRole]||l.VIEWS_BY_ROLE.librero).find(t=>t.id===e),r=document.getElementById(`page-title`);r&&(r.textContent=n?.label||`Dashboard`);let i=this._container();i&&(i.innerHTML=this._skeletonLoader(e));let a={dashboard:()=>this.renderDashboard(),reports:()=>this.renderReports(),catalog:()=>this.renderCatalog(),users:()=>this.renderUsers(),loans:()=>this.renderLoans(),scanner:()=>this.renderScannerView(),admin:()=>this.renderAdmin(),profile:()=>this.renderProfile()};try{await(a[e]||a.dashboard)()}catch(n){console.error(`Fallo al cargar la vista "${e}":`,n),D.registrarOperacion(`cargar la vista ${e}`,n),i&&(i.innerHTML=`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900/95 backdrop-blur-xl rounded-[2rem] border border-rose-300/50 p-8 max-w-lg shadow-soft-xl">
            <p class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">No se pudo cargar esta sección</p>
            <p class="text-sm text-stone-600 dark:text-stone-300">${t(n?.message||`Error desconocido.`)}</p>
            <button id="retry-view-btn" class="btn-madera mt-4 text-white rounded-xl px-4 py-2 text-sm font-medium">
              <i aria-hidden="true" class="fas fa-rotate-right mr-1.5"></i> Reintentar
            </button>
          </div>`),document.getElementById(`retry-view-btn`)?.addEventListener(`click`,()=>this.switchView(e))}}_container(){return document.getElementById(`views-container`)}_momentoDelDia(){let e=new Date().getHours();return e>=5&&e<9?`amanecer`:e>=9&&e<18?`dia`:e>=18&&e<20?`atardecer`:`noche`}renderNuevaPassword(){let e=this._momentoDelDia();document.body.innerHTML=`
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
          <h1 class="font-serif font-semibold text-xl text-stone-900 dark:text-stone-100 mb-1">Crea tu contraseña nueva</h1>
          <p class="text-xs text-stone-600 dark:text-stone-300 mb-5">Debe tener al menos 8 caracteres.</p>

          <form id="new-password-form" class="space-y-4">
            <div>
              <label for="np-1" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Contraseña nueva</label>
              <input id="np-1" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800/90 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div>
              <label for="np-2" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Repite la contraseña</label>
              <input id="np-2" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800/90 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <button type="submit" class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm">
              Guardar contraseña
            </button>
          </form>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,document.getElementById(`new-password-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`np-1`).value,n=document.getElementById(`np-2`).value,r=this.validarPassword(t);if(r){this.showToast(r,`error`);return}if(t!==n){this.showToast(`Las dos contraseñas no coinciden.`,`error`);return}let i=e.target.querySelector(`button[type="submit"]`);i.disabled=!0;try{await re(t),this.showToast(`Contraseña guardada. Ya puedes entrar.`,`success`),window.history.replaceState({},``,window.location.pathname),setTimeout(()=>window.location.reload(),1200)}catch(e){this.showToast(e.message||`No se pudo guardar la contraseña.`,`error`),i.disabled=!1}})}renderCompletarInvitacion(){let e=this._momentoDelDia();document.body.innerHTML=`
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
            <h1 class="font-serif font-semibold text-xl text-stone-900 dark:text-stone-100">Bienvenido/a a Biblio<span class="text-patrimonio-madera">Nexo</span></h1>
          </div>
          <p class="text-xs text-stone-600 dark:text-stone-300 mb-5">Te invitaron a formar parte del equipo. Completa tus datos y crea tu contraseña para empezar.</p>

          <form id="completar-invitacion-form" class="space-y-4">
            <div>
              <label for="ci-nombre" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Nombre completo</label>
              <input id="ci-nombre" type="text" required placeholder="María Antileo Huenchumán"
                class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800/90 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div>
              <label for="ci-cargo" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Cargo <span class="normal-case font-normal text-stone-500 dark:text-stone-400">(opcional)</span></label>
              <input id="ci-cargo" type="text" placeholder="Encargada de biblioteca"
                class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800/90 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <div class="h-px bg-stone-300/70 my-1"></div>
            <div>
              <label for="ci-pass-1" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Contraseña nueva</label>
              <input id="ci-pass-1" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800/90 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
              <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Mínimo 8 caracteres, con al menos una mayúscula y un número.</p>
            </div>
            <div>
              <label for="ci-pass-2" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Repite la contraseña</label>
              <input id="ci-pass-2" type="password" autocomplete="new-password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800/90 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            </div>
            <button type="submit" class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm">
              Crear mi cuenta y entrar
            </button>
          </form>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,document.getElementById(`completar-invitacion-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`ci-nombre`).value.trim(),n=document.getElementById(`ci-cargo`).value.trim(),r=document.getElementById(`ci-pass-1`).value,i=document.getElementById(`ci-pass-2`).value;if(!t){this.showToast(`Escribe tu nombre completo.`,`error`);return}if(t.split(/\s+/).length<2){this.showToast(`Escribe tu nombre y al menos un apellido.`,`error`);return}let a=this.validarPassword(r);if(a){this.showToast(a,`error`);return}if(r!==i){this.showToast(`Las dos contraseñas no coinciden.`,`error`);return}let o=e.target.querySelector(`button[type="submit"]`);o.disabled=!0;try{await re(r);try{await B.actualizarMiPerfil({nombre:t,cargo:n||null,telefono:null})}catch(e){D.registrarOperacion(`completar-invitacion`,e)}this.showToast(`Cuenta activada. Bienvenido/a a BiblioNexo.`,`success`),window.history.replaceState({},``,window.location.pathname),setTimeout(()=>window.location.reload(),1200)}catch(e){this.showToast(e.message||`No se pudo activar la cuenta.`,`error`),o.disabled=!1}})}renderLogin(){this.limpiarControlDeInactividad();let e=this._momentoDelDia();document.body.innerHTML=`
      <div id="login-screen" class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">

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

        <!-- Botón modo oscuro flotante -->
        <button class="dark-mode-toggle absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-md text-stone-800 dark:text-stone-100 border border-white/30 dark:border-white/10 hover:bg-white/30 dark:hover:bg-black/50 transition-all shadow-sm" title="Alternar modo oscuro">
          <i aria-hidden="true" class="dark-mode-icon fas fa-moon transition-transform duration-300"></i>
        </button>

        <!-- Tarjeta de vidrio esmerilado: flota sobre el paisaje en vez de cortarlo -->
        <div class="glass-panel relative z-10 w-full max-w-md rounded-[2rem] shadow-2xl p-8 md:p-9 transition-colors duration-500">
          <div class="flex items-center gap-2 mb-1">
            <i aria-hidden="true" class="fas fa-book text-patrimonio-madera text-xl"></i>
            <h1 class="font-serif font-semibold text-2xl leading-tight text-stone-900 dark:text-stone-100">Biblio<span class="text-patrimonio-madera">Nexo</span></h1>
          </div>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wide mt-1">Municipalidad de Futrono · Región de Los Ríos</p>
          <p class="text-[11px] text-stone-500 dark:text-stone-400/80 italic font-serif mt-1.5">“Futronhue” — lugar de humo, a orillas del Lago Ranco.</p>

          <div class="h-px bg-stone-300/50 dark:bg-stone-600/50 my-5 transition-colors duration-500"></div>

          <h2 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Iniciar sesión</h2>
          <p class="text-xs text-stone-600 dark:text-stone-400 mb-5">Acceso de personal — ingresa con tu cuenta institucional.</p>

          <form id="login-form" class="space-y-4">
            <div>
              <label for="email-input" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-400 mb-1 block">Correo</label>
              <input id="email-input" type="email" placeholder="nombre@futrono.cl" autocomplete="username"
                class="w-full px-4 py-3 border border-stone-300/50 dark:border-stone-600/50 rounded-xl bg-white/70 dark:bg-stone-950/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-2 focus:ring-patrimonio-lago/30 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 backdrop-blur-sm" />
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="password-input" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-400 block">Contraseña</label>
                <button type="button" id="forgot-password-btn" class="text-[11px] font-bold text-patrimonio-lago dark:text-patrimonio-lago hover:underline transition-colors">¿Olvidaste tu contraseña?</button>
              </div>
              <input id="password-input" type="password" placeholder="••••••••" autocomplete="current-password"
                class="w-full px-4 py-3 border border-stone-300/50 dark:border-stone-600/50 rounded-xl bg-white/70 dark:bg-stone-950/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-patrimonio-lago focus:ring-2 focus:ring-patrimonio-lago/30 transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 backdrop-blur-sm" />
            </div>
            <button type="submit" class="btn-madera w-full text-white font-sans font-bold rounded-xl shadow-lg py-3 text-sm mt-2 transform hover:-translate-y-0.5 transition-all">
              Ingresar <i aria-hidden="true" class="fas fa-arrow-right ml-1"></i>
            </button>
          </form>

          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-stone-300/50 dark:bg-stone-600/50 transition-colors duration-500"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">o</span>
            <div class="flex-1 h-px bg-stone-300/50 dark:bg-stone-600/50 transition-colors duration-500"></div>
          </div>

          <button id="google-login-btn" type="button" class="btn-secundario w-full flex items-center justify-center gap-2.5 border border-stone-300 dark:border-stone-600 bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl py-3 text-sm transition-all backdrop-blur-sm shadow-sm hover:shadow">
            <i aria-hidden="true" class="fa-brands fa-google text-[16px]"></i> Continuar con Google
          </button>

          <p style="text-align:center; margin-top:20px;">
            <a href="/privacidad.html" class="text-[11px] font-bold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:underline transition-colors">Política de privacidad y términos</a>
          </p>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,this.initLoginForm(),this._initDarkMode(),document.getElementById(`google-login-btn`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0;try{await te()}catch(e){this.showToast(e.message||`No se pudo iniciar sesión con Google.`,`error`),t.disabled=!1}}),document.getElementById(`forgot-password-btn`).addEventListener(`click`,async()=>{let e=await this.showPrompt(`Ingresa el correo de tu cuenta institucional para recibir el enlace de recuperación.`,{title:`Recuperar contraseña`,placeholder:`nombre@futrono.cl`,confirmText:`Enviar enlace`});if(e){if(!this.isValidEmail(e)){this.showToast(`Ingresa un correo válido.`,`error`);return}try{await ne(e),this.showToast(`Si el correo existe, recibirás un enlace para recuperar tu contraseña.`,`success`)}catch(e){this.showToast(e.message||`No se pudo enviar el correo.`,`error`)}}})}_initDarkMode(){let e=!1;try{e=localStorage.getItem(`theme`)===`dark`||!localStorage.getItem(`theme`)&&window.matchMedia(`(prefers-color-scheme: dark)`).matches}catch{}document.body.classList.contains(`transition-colors`)||document.body.classList.add(`transition-colors`,`duration-500`);let t=e=>{if(e){document.documentElement.classList.add(`dark`);try{localStorage.setItem(`theme`,`dark`)}catch{}}else{document.documentElement.classList.remove(`dark`);try{localStorage.setItem(`theme`,`light`)}catch{}}document.querySelectorAll(`.dark-mode-toggle`).forEach(t=>{let n=t.querySelector(`.dark-mode-icon`);n&&(n.style.transform=`rotate(180deg)`,setTimeout(()=>{e?n.classList.replace(`fa-moon`,`fa-sun`):n.classList.replace(`fa-sun`,`fa-moon`),n.style.transform=`rotate(0deg)`},150))})};t(e),document.querySelectorAll(`.dark-mode-toggle`).forEach(e=>{let n=e.cloneNode(!0);e.parentNode.replaceChild(n,e),n.addEventListener(`click`,()=>{let e=document.documentElement.classList.contains(`dark`);t(!e)})})}async renderShell(e){document.body.innerHTML=`
      <div class="h-screen w-full flex bg-patrimonio-base dark:bg-stone-950 overflow-hidden transition-colors duration-500">

        <!-- Fondo oscuro para cerrar el menú lateral en móvil -->
        <div id="sidebar-overlay" class="hidden fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-sm z-40 transition-opacity"></div>

        <!-- Menú lateral: identidad institucional + navegación agrupada por rol -->
        <a href="#views-container" class="skip-link">Saltar al contenido principal</a>
        <aside id="sidebar" class="momento-${this._momentoDelDia()} w-72 shrink-0 text-white flex flex-col z-50">
          <div class="tab-corner px-5 py-5 border-b border-white/10 flex items-center gap-2">
            <i aria-hidden="true" class="fas fa-book text-patrimonio-madera text-lg"></i>
            <div class="leading-none">
              <span class="font-serif font-semibold text-white text-lg block">
                Biblio<span class="text-patrimonio-madera">Nexo</span>
              </span>
              <span class="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest">Futrono · Región de Los Ríos</span>
            </div>
          </div>

          <nav id="nav-menu" class="flex-1 overflow-y-auto px-3 py-5"></nav>

          <!-- Ficha de usuario: como la tarjeta de un socio de biblioteca.
               Ahora es un botón, porque es el lugar donde uno espera pinchar
               para ver y editar sus propios datos. -->
          <div class="border-t border-white/10 p-4 flex items-center gap-3">
            <button class="dark-mode-toggle w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition shrink-0" title="Alternar modo oscuro"><i aria-hidden="true" class="dark-mode-icon fas fa-moon"></i></button>
              <button id="perfil-btn" title="Ver y editar mi perfil"
              class="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg -m-1 p-1 hover:bg-white dark:bg-stone-800/10 transition">
              <span id="current-user-initial" class="w-9 h-9 rounded-full bg-patrimonio-madera flex items-center justify-center font-black text-sm shrink-0 text-white"></span>
              <span class="min-w-0 flex-1 block">
                <span id="current-user-name" class="text-xs font-bold text-white leading-none truncate block"></span>
                <span id="current-user-sub" class="text-[10px] text-stone-500 dark:text-stone-400 leading-none truncate block mt-0.5"></span>
                <span id="current-user-badge" class="stamp-onDark mt-1.5"></span>
              </span>
            </button>
            <button id="logout-btn" title="Cerrar sesión"
              class="w-9 h-9 rounded-lg text-stone-300 hover:bg-white dark:bg-stone-800/10 hover:text-white flex items-center justify-center transition shrink-0">
              <i aria-hidden="true" class="fas fa-right-from-bracket"></i>
            </button>
          </div>
        </aside>

        <!-- Columna principal -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Franja de título: como la etiqueta de un cajón de fichero -->
          <div class="franja-titulo bg-white dark:bg-stone-800/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-700/50 px-4 md:px-6 py-4 flex shadow-sm items-center gap-3 shrink-0">
            <button id="sidebar-toggle-btn" class="md:hidden w-8 h-8 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:text-stone-200">
              <i aria-hidden="true" class="fas fa-bars"></i>
            </button>
            <span class="w-1.5 h-4 bg-patrimonio-madera rounded-sm hidden sm:block"></span>
            <h2 id="page-title" class="font-serif font-semibold text-stone-800 dark:text-stone-200 text-base">Dashboard</h2>
            <div class="ml-auto flex items-center gap-4 relative">
              
              <!-- Campana de notificaciones -->
              <div class="relative">
                <button id="notificaciones-btn" class="relative text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors" title="Centro de notificaciones">
                  <i aria-hidden="true" class="fas fa-bell text-[1.1rem]"></i>
                  <span id="notificaciones-badge" class="absolute -top-1.5 -right-1.5 bg-rose-600 shadow text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden">0</span>
                </button>

                <!-- Panel de notificaciones -->
                <div id="notificaciones-panel" class="absolute right-0 mt-3 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl opacity-0 invisible transition-all transform origin-top-right scale-95 z-50">
                  <div class="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-800/20 rounded-t-2xl">
                    <h3 class="font-bold text-stone-800 dark:text-stone-200">Notificaciones</h3>
                    <button id="notificaciones-close" class="text-stone-400 hover:text-stone-600"><i aria-hidden="true" class="fas fa-times"></i></button>
                  </div>
                  <div id="notificaciones-lista" class="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/50">
                    <!-- Dinámico -->
                  </div>
                </div>
              </div>

              <span id="estado-conexion" class="shrink-0"></span>
            </div>
          </div>

          <main id="views-container" tabindex="-1" aria-label="Contenido principal" class="flex-1 overflow-y-auto p-4 md:p-6"></main>
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `,document.getElementById(`logout-btn`).addEventListener(`click`,()=>g()),this._initDarkMode(),document.getElementById(`perfil-btn`).addEventListener(`click`,()=>this.switchView(`profile`));let t=document.getElementById(`notificaciones-btn`),n=document.getElementById(`notificaciones-panel`);if(t&&n){let e=()=>{n.classList.contains(`opacity-0`)?(n.classList.remove(`opacity-0`,`invisible`,`scale-95`),n.classList.add(`opacity-100`,`scale-100`)):(n.classList.add(`opacity-0`,`invisible`,`scale-95`),n.classList.remove(`opacity-100`,`scale-100`))};t.addEventListener(`click`,e),document.getElementById(`notificaciones-close`).addEventListener(`click`,e),document.addEventListener(`click`,r=>{!n.classList.contains(`opacity-0`)&&!t.contains(r.target)&&!n.contains(r.target)&&e()})}let r=document.getElementById(`sidebar`),i=document.getElementById(`sidebar-overlay`);document.getElementById(`sidebar-toggle-btn`).addEventListener(`click`,()=>{r.classList.toggle(`active`),i.classList.toggle(`hidden`)}),i.addEventListener(`click`,()=>{r.classList.remove(`active`),i.classList.add(`hidden`)}),D.iniciar(()=>this.currentView),this._vigilarPortadas(),this._detenerEstadoConexion?.(),this._detenerEstadoConexion=V.suscribir(e=>this._renderIndicadorConexion(e)),await this.cargarParametros(),this._controlInactividadActivo||this.iniciarControlDeInactividad(),await this.updateUserInfo(e),this.renderNavMenu(),await this.switchView(this._vistaInicial(this.currentUserRole))}_renderIndicadorConexion({enLinea:e,sincronizando:n,pendientes:r}={}){let i=document.getElementById(`estado-conexion`);if(!i)return;let a=r===1?`pendiente`:`pendientes`,o,s,c;e?n?(o=`bg-patrimonio-lago/10 text-patrimonio-lago`,s=`fa-arrows-rotate fa-spin`,c=`Sincronizando…`):r>0?(o=`bg-amber-100 text-amber-800`,s=`fa-clock`,c=`${r} ${a}`):(o=`bg-emerald-100 text-emerald-800`,s=`fa-circle-check`,c=`En línea`):(o=`bg-rose-100 text-rose-800`,s=`fa-triangle-exclamation`,c=r>0?`Sin conexión · ${r} ${a}`:`Sin conexión`),i.className=`ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${o}`,i.innerHTML=`<i aria-hidden="true" class="fas ${s}"></i><span>${t(c)}</span>`,i.setAttribute(`role`,`status`),i.setAttribute(`aria-label`,`Estado de conexión: ${c}`)}_vistaInicial(e){let t=l.VIEWS_BY_ROLE[e]||l.VIEWS_BY_ROLE.librero,n=new URLSearchParams(window.location.search).get(`vista`);return t.some(e=>e.id===n)?n:t[0].id}async _renderDonut(e,n,r){let i=document.getElementById(e);if(!i)return;let a=i.parentElement;try{await ze()}catch{a.innerHTML=`
        <div class="h-full flex flex-col items-center justify-center gap-2 text-center">
          <p class="text-sm text-stone-500 dark:text-stone-400">No se pudo cargar el gráfico.</p>
          <button class="retry-chart-btn text-xs font-bold text-patrimonio-lago hover:underline">
            <i aria-hidden="true" class="fas fa-rotate-right mr-1"></i> Reintentar
          </button>
        </div>`,a.querySelector(`.retry-chart-btn`)?.addEventListener(`click`,()=>{W=null,a.innerHTML=`<canvas id="${t(e)}"></canvas>`,this._renderDonut(e,n,r)});return}if(!document.getElementById(e))return;let o=r.reduce((e,t)=>e+t.valor,0),s=e=>o===0?0:Math.round(e/o*1e3)/10,c=o>0;U[e]&&(U[e].destroy(),delete U[e]),U[e]=new window.Chart(document.getElementById(e).getContext(`2d`),{type:`doughnut`,data:{labels:r.map(e=>e.etiqueta),datasets:[{data:c?r.map(e=>e.valor):[1],backgroundColor:c?r.map(e=>e.color):[`#E7E5E4`],borderColor:`#FFFFFF`,borderWidth:3,hoverOffset:8}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:`62%`,plugins:{legend:{display:!1},tooltip:{enabled:c,callbacks:{label:e=>` ${e.label}: ${e.parsed} (${s(e.parsed)}%)`},titleFont:{family:`Plus Jakarta Sans`},bodyFont:{family:`Plus Jakarta Sans`}}}}});let l=document.getElementById(`${e}-centro`);l&&(l.innerHTML=`
      <span class="block font-serif font-bold text-3xl text-stone-900 dark:text-stone-100 leading-none">${t(String(o))}</span>
      <span class="block text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-1">Total</span>`);let u=document.getElementById(n);u&&(u.innerHTML=r.map(e=>`
      <div class="flex items-center gap-2.5 py-1.5">
        <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${t(e.color)}"></span>
        <span class="text-xs text-stone-600 dark:text-stone-300 flex-1 truncate">${t(e.etiqueta)}</span>
        <span class="text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">${t(String(e.valor))}</span>
        <span class="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums w-12 text-right">${t(String(s(e.valor)))}%</span>
      </div>
    `).join(``))}_descargar(e,t,n){let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(i)}_avisoMigracion(e,t){return r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900/95 backdrop-blur-xl rounded-[2rem] border border-stone-200 dark:border-stone-700 p-8 max-w-xl shadow-soft-xl">
        <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-2">Falta un paso en la base de datos</h3>
        <p class="text-sm text-stone-600 dark:text-stone-300">
          Esta herramienta necesita la migración ${e}. Abre el editor SQL de Supabase y ejecuta
          <code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-xs font-mono">${t}</code>,
          luego vuelve aquí.
        </p>
      </div>`}_bindPaginacion(e,t,n){e.querySelectorAll(t).forEach(e=>{e.addEventListener(`click`,()=>{e.hasAttribute(`disabled`)||n(Number(e.dataset.page))})})}},Ue={showToast(e,n=`success`){n===`error`&&D.registrar(e,{origen:`operacion`,accion:this.currentView||null});let r=document.getElementById(`toast-container`);if(!r)return;let i=document.createElement(`div`),a=n===`success`?`fa-check-circle`:n===`error`?`fa-exclamation-triangle`:`fa-info-circle`;i.className="${bgColor} text-white px-5 py-4 rounded-2xl shadow-soft-xl border border-white/10 backdrop-blur-md font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 scale-95 opacity-0 z-50 text-sm",i.innerHTML=`<i aria-hidden="true" class="fas ${a} text-lg"></i> <span>${t(e)}</span>`,r.appendChild(i),setTimeout(()=>i.classList.remove(`translate-y-10`,`scale-95`,`opacity-0`),10),setTimeout(()=>{i.classList.add(`translate-y-10`,`scale-95`,`opacity-0`),setTimeout(()=>i.remove(),300)},3500)},showConfirm(e,{title:n=`Confirmar acción`,confirmText:r=`Confirmar`,danger:i=!0}={}){return new Promise(a=>{let o=document.createElement(`div`);o.className=`fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4`,o.innerHTML=`
                <div class="bg-patrimonio-card/95 backdrop-blur-xl border border-white/20 rounded-[2rem] max-w-sm w-full p-8 shadow-soft-xl shadow-patrimonio-lago/20 transform transition-all space-y-4">
                    <h3 class="font-serif text-lg font-bold text-stone-900">${t(n)}</h3>
                    <p class="text-stone-600 text-sm">${t(e)}</p>
                    <div class="flex justify-end gap-3 pt-2">
                        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
                        <button data-action="confirm" class="${i?`bg-rose-700 hover:bg-rose-800`:`bg-patrimonio-madera hover:bg-[#633414]`} text-white px-4 py-2 rounded-xl text-sm font-medium">${t(r)}</button>
                    </div>
                </div>
            `,document.body.appendChild(o);let s=!1,c=this._prepararModal(o,{alCerrar:()=>a(s)}),l=e=>{s=e,c()};o.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>l(!1)),o.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>l(!0)),o.addEventListener(`click`,e=>{e.target===o&&l(!1)})})},showPrompt(e,{title:n=`Ingresar dato`,placeholder:r=``,confirmText:i=`Aceptar`}={}){return new Promise(a=>{let o=document.createElement(`div`);o.className=`fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4`,o.innerHTML=`
                <div class="bg-patrimonio-card/95 backdrop-blur-xl border border-white/20 rounded-[2rem] max-w-sm w-full p-8 shadow-soft-xl shadow-patrimonio-lago/20 transform transition-all space-y-4">
                    <h3 class="font-serif text-lg font-bold text-stone-900">${t(n)}</h3>
                    <p class="text-stone-600 text-sm">${t(e)}</p>
                    <input id="modal-prompt-input" aria-label="Valor solicitado" type="text" placeholder="${t(r)}"
                        class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
                    <div class="flex justify-end gap-3 pt-2">
                        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
                        <button data-action="confirm" class="bg-patrimonio-madera hover:bg-[#633414] text-white px-4 py-2 rounded-xl text-sm font-medium">${t(i)}</button>
                    </div>
                </div>
            `,document.body.appendChild(o);let s=o.querySelector(`#modal-prompt-input`),c=null,l=this._prepararModal(o,{alCerrar:()=>a(c)}),u=e=>{c=e,l()};o.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>u(null)),o.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>u(s.value.trim()||null)),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&u(s.value.trim()||null)}),o.addEventListener(`click`,e=>{e.target===o&&u(null)}),setTimeout(()=>s.focus(),50)})},_prepararModal(e,{titulo:t,alCerrar:n}={}){let r=document.activeElement,i=e.firstElementChild;e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-modal`,`true`);let a=i?.querySelector(`h1, h2, h3`);a?(a.id||=`modal-titulo-${Math.random().toString(36).slice(2,9)}`,e.setAttribute(`aria-labelledby`,a.id)):t&&e.setAttribute(`aria-label`,t);let o=()=>[...e.querySelectorAll(`button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])`)].filter(e=>e.offsetParent!==null||e===document.activeElement),s=e=>{if(e.key===`Escape`){e.preventDefault(),c();return}if(e.key!==`Tab`)return;let t=o();if(t.length===0)return;let n=t[0],r=t[t.length-1];e.shiftKey&&document.activeElement===n?(e.preventDefault(),r.focus()):!e.shiftKey&&document.activeElement===r&&(e.preventDefault(),n.focus())},c=()=>{document.removeEventListener(`keydown`,s,!0),e.remove(),r&&document.body.contains(r)&&r.focus(),n?.()};return document.addEventListener(`keydown`,s,!0),c}},We={async obtenerEstadisticas(){return z.obtenerEstadisticas()},async obtenerReservasApartadas(){return z.obtenerReservasApartadas()}},Ge={async renderDashboard(){let e=this._container();if(!e)return;let t=await We.obtenerEstadisticas(),n=await We.obtenerReservasApartadas();if(this.currentView!==`dashboard`)return;let i=l.ROLE_LABELS[this.currentUserRole]||l.ROLE_LABELS.librero,a=this.currentUserRole===`admin`,o=new Date().getTime(),s=n.filter(e=>{if(!e.vence_apartado_en)return!1;let t=(new Date(e.vence_apartado_en).getTime()-o)/36e5;return t>=0&&t<=24}),c=[{label:`Préstamos activos`,value:t.prestamos,icon:`fa-right-left`,color:`text-patrimonio-lago`},{label:`Libros registrados`,value:t.libros,icon:`fa-book`,color:`text-patrimonio-madera`},{label:`Lectores registrados`,value:t.lectores,icon:`fa-users`,color:`text-patrimonio-bosque`},{label:`Préstamos vencidos`,value:t.noDevueltos,icon:`fa-triangle-exclamation`,color:`text-rose-700`}],u=a?[{view:`catalog`,label:`Agregar libro`,icon:`fa-book-medical`},{view:`users`,label:`Agregar lector`,icon:`fa-user-plus`},{view:`loans`,label:`Ver préstamos`,icon:`fa-right-left`}]:[{view:`scanner`,label:`Escanear libro`,icon:`fa-barcode`},{view:`loans`,label:`Ver préstamos`,icon:`fa-right-left`},{view:`catalog`,label:`Buscar en catálogo`,icon:`fa-magnifying-glass`}];e.innerHTML=r`
      ${this.desajusteDeRol?r`
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
          <pre class="mt-2 bg-white dark:bg-stone-800/70 border border-amber-200 rounded-lg p-2 text-[11px] font-mono overflow-x-auto text-stone-800 dark:text-stone-200">insert into public.usuarios (id, email, rol)
select id, email, 'admin' from auth.users where email = '${this.currentUserEmail}'
on conflict (id) do update set rol = 'admin';</pre>
        </div>`:``}

      <div class="mb-5">
        <h3 class="font-serif font-semibold text-xl text-stone-900 dark:text-stone-100">Hola, ${this._nombreParaSaludo()}</h3>
        <p class="text-xs text-stone-500 dark:text-stone-400">${i.welcome}</p>
      </div>

      ${s.length>0?r`
        <div class="mb-5 bg-sky-50 border border-sky-300 rounded-xl px-4 py-3" role="alert">
          <p class="text-sm font-bold text-sky-900 mb-1">
            <i aria-hidden="true" class="fas fa-clock mr-1.5"></i>Reservas a punto de vencer
          </p>
          <p class="text-xs text-sky-800 leading-relaxed">
            Hay <strong>${s.length}</strong> reserva(s) de libros apartados que expiran en menos de 24 horas si los lectores no los retiran. Considera enviarles un recordatorio.
          </p>
        </div>`:``}

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        ${c.map(e=>r`
          <div class="bg-white dark:bg-stone-800 rounded-[2rem] shadow-soft-xl border border-stone-200 dark:border-stone-700/60 p-6 transition-all hover:shadow-soft-2xl hover:border-patrimonio-lago/20">
            <i aria-hidden="true" class="fas ${e.icon} ${e.color} text-xl mb-2"></i>
            <p class="font-serif font-semibold text-4xl text-stone-900 dark:text-stone-100">${e.value}</p>
            <p class="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wide mt-1">${e.label}</p>
          </div>
        `)}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Anillo 1: dónde están físicamente las copias en este momento -->
        <div class="bg-white dark:bg-stone-800 rounded-[2rem] shadow-soft-xl border border-stone-200 dark:border-stone-700/60 p-6 transition-all hover:shadow-soft-2xl hover:border-patrimonio-lago/20">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Estado del fondo</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">Dónde están las copias ahora mismo.</p>
          <div class="relative h-44 mb-3">
            <canvas id="fondo-chart"></canvas>
            <div id="fondo-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
          </div>
          <div id="fondo-legend" class="divide-y divide-stone-100"></div>
        </div>

        <!-- Anillo 2: cómo se comportan los préstamos históricos -->
        <div class="bg-white dark:bg-stone-800 rounded-[2rem] shadow-soft-xl border border-stone-200 dark:border-stone-700/60 p-6 transition-all hover:shadow-soft-2xl hover:border-patrimonio-lago/20">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Préstamos</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">Devueltos, al día y atrasados.</p>
          <div class="relative h-44 mb-3">
            <canvas id="prestamos-chart"></canvas>
            <div id="prestamos-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
          </div>
          <div id="prestamos-legend" class="divide-y divide-stone-100"></div>
        </div>

        <div class="bg-white dark:bg-stone-800 rounded-[2rem] shadow-soft-xl border border-stone-200 dark:border-stone-700/60 p-6 transition-all hover:shadow-soft-2xl hover:border-patrimonio-lago/20">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-4">Accesos rápidos</h3>
          <div class="space-y-2">
            ${u.map(e=>r`
              <button data-quick-view="${e.view}" class="quick-action-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-700 hover:border-patrimonio-madera hover:text-patrimonio-madera transition">
                <i aria-hidden="true" class="fas ${e.icon} w-4 text-center"></i>
                <span>${e.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `,e.querySelectorAll(`.quick-action-btn`).forEach(e=>{e.addEventListener(`click`,()=>this.switchView(e.dataset.quickView))}),this._renderDonut(`fondo-chart`,`fondo-legend`,[{etiqueta:`En estante`,valor:t.enEstante,color:`#7A431D`},{etiqueta:`Prestados`,valor:t.prestamos,color:`#1B3B48`}]),this._renderDonut(`prestamos-chart`,`prestamos-legend`,[{etiqueta:`Devueltos`,valor:t.devueltos,color:`#2C4A3E`},{etiqueta:`Activos al día`,valor:Math.max(0,t.prestamos-t.noDevueltos),color:`#1B3B48`},{etiqueta:`Atrasados`,valor:t.noDevueltos,color:`#be123c`}])}},Ke={async obtenerReporte(e,t){return z.obtenerReporte(e,t)},async exportarTodo(){return z.exportarTodo()}},qe={_rangoPeriodo(e){let t=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=new Date;if(n.setHours(0,0,0,0),e===`dia`)return{desde:t(n),hasta:t(n),titulo:`Hoy`};if(e===`semana`){let e=(n.getDay()+6)%7,r=new Date(n);r.setDate(n.getDate()-e);let i=new Date(r);return i.setDate(r.getDate()+6),{desde:t(r),hasta:t(i),titulo:`Esta semana`}}if(e===`mes`){let e=new Date(n.getFullYear(),n.getMonth(),1),r=new Date(n.getFullYear(),n.getMonth()+1,0);return{desde:t(e),hasta:t(r),titulo:`Este mes`}}let r=new Date(n.getFullYear(),0,1),i=new Date(n.getFullYear(),11,31);return{desde:t(r),hasta:t(i),titulo:`Este año`}},async renderReports(){let e=this._container();if(!e)return;let t=this.reportPeriod||`mes`,n=this._rangoPeriodo(t),i;try{i=await Ke.obtenerReporte(n.desde,n.hasta)}catch(t){if(this.currentView!==`reports`)return;e.innerHTML=r`<div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl border border-stone-300 dark:border-stone-600 p-6 text-center">
        <p class="text-sm text-stone-600 dark:text-stone-300">No se pudo generar el reporte.</p>
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">${t.message||``}</p>
      </div>`;return}if(this.currentView!==`reports`)return;if(i.faltaMigracion){e.innerHTML=`
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl border border-stone-300 dark:border-stone-600 p-6 max-w-xl">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-2">Falta un paso en la base de datos</h3>
          <p class="text-sm text-stone-600 dark:text-stone-300 mb-3">
            Los reportes necesitan saber en qué fecha se hizo cada préstamo, y esa columna todavía no existe.
          </p>
          <p class="text-sm text-stone-600 dark:text-stone-300">
            Abre el editor SQL de tu proyecto en Supabase y ejecuta el archivo
            <code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-xs font-mono">supabase/migrations/004_reportes_portadas_zona_horaria.sql</code>.
            Luego vuelve a esta pantalla.
          </p>
        </div>`;return}let a=(e,n)=>r`
      <button data-period="${e}" class="report-period-btn px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${t===e?`bg-patrimonio-lago text-white border-patrimonio-lago`:`bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:border-patrimonio-lago`}">${n}</button>`,o=[{label:`Préstamos realizados`,valor:i.totalPrestamos,icono:`fa-right-left`,color:`text-patrimonio-lago`},{label:`Devoluciones`,valor:i.totalDevoluciones,icono:`fa-rotate-left`,color:`text-patrimonio-bosque`},{label:`Lectores nuevos`,valor:i.totalNuevosLectores,icono:`fa-user-plus`,color:`text-patrimonio-madera`},{label:`Devueltos con atraso`,valor:i.devolucionesAtrasadas,icono:`fa-triangle-exclamation`,color:`text-rose-700`}],s=(e,t,n)=>r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
        <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">${e}</h3>
        ${t.length?r`<ol class="space-y-2">${t.map((e,t)=>r`
          <li class="flex items-center gap-3 text-sm">
            <span class="w-5 h-5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 text-[10px] font-black flex items-center justify-center shrink-0">${t+1}</span>
            <span class="flex-1 truncate text-stone-700">${e.etiqueta}</span>
            <span class="font-bold text-stone-900 dark:text-stone-100 tabular-nums">${e.total}</span>
          </li>`)}</ol>`:r`<p class="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">${n}</p>`}
      </div>`;e.innerHTML=r`
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 no-print">
        <div class="flex flex-wrap gap-2">
          ${a(`dia`,`Diario`)}
          ${a(`semana`,`Semanal`)}
          ${a(`mes`,`Mensual`)}
          ${a(`anio`,`Anual`)}
        </div>
        <div class="flex flex-wrap gap-2">
          <button id="backup-btn" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:bg-stone-800/50 text-stone-700 font-medium rounded-xl px-4 py-2 text-sm" title="Descarga una copia completa de libros, lectores y préstamos">
            <i aria-hidden="true" class="fas fa-database mr-1.5"></i> Respaldo completo
          </button>
          <button id="export-csv-btn" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:bg-stone-800/50 text-stone-700 font-medium rounded-xl px-4 py-2 text-sm">
            <i aria-hidden="true" class="fas fa-file-csv mr-1.5"></i> Exportar CSV
          </button>
          <button id="print-report-btn" class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2 text-sm">
            <i aria-hidden="true" class="fas fa-print mr-1.5"></i> Imprimir / PDF
          </button>
        </div>
      </div>

      <div id="report-sheet">
        <!-- Encabezado: se ve principalmente al imprimir -->
        <div class="mb-5 pb-4 border-b border-stone-300 dark:border-stone-600">
          <h2 class="font-serif font-semibold text-xl text-stone-900 dark:text-stone-100">Reporte de actividad — ${n.titulo}</h2>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
            ${this._fechaLegible(n.desde)} al ${this._fechaLegible(n.hasta)}
            · ${l.BIBLIOTECA.nombreLargo}
          </p>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Generado el ${this._fechaLegible(this._rangoPeriodo(`dia`).desde)}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          ${o.map(e=>r`
            <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
              <i aria-hidden="true" class="fas ${e.icono} ${e.color} text-xl mb-2"></i>
              <p class="font-serif font-semibold text-4xl text-stone-900 dark:text-stone-100">${e.valor}</p>
              <p class="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wide mt-1">${e.label}</p>
            </div>`)}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Movimiento del período</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">Proporción entre lo prestado y lo devuelto.</p>
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
    `,e.querySelectorAll(`.report-period-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.reportPeriod=e.dataset.period,this.renderReports()})}),document.getElementById(`print-report-btn`).addEventListener(`click`,()=>window.print()),document.getElementById(`export-csv-btn`).addEventListener(`click`,()=>this._exportarReporteCsv(i,n)),document.getElementById(`backup-btn`).addEventListener(`click`,async e=>{let t=e.currentTarget,n=t.innerHTML;t.disabled=!0,t.innerHTML=`<i aria-hidden="true" class="fas fa-spinner fa-spin mr-1.5"></i> Preparando…`;try{let e=await Ke.exportarTodo(),t=Object.values(e.tablas).reduce((e,t)=>e+t.length,0);this._descargar(JSON.stringify(e,null,2),`respaldo-biblionexo-${this._rangoPeriodo(`dia`).desde}.json`,`application/json`),this.showToast(`Respaldo descargado: ${t} registros.`,`success`)}catch(e){this.showToast(e.message||`No se pudo generar el respaldo.`,`error`)}finally{t.disabled=!1,t.innerHTML=n}}),this._renderDonut(`reporte-chart`,`reporte-legend`,[{etiqueta:`Préstamos`,valor:i.totalPrestamos,color:`#1B3B48`},{etiqueta:`Devoluciones`,valor:i.totalDevoluciones,color:`#2C4A3E`},{etiqueta:`Lectores nuevos`,valor:i.totalNuevosLectores,color:`#7A431D`}])},_exportarReporteCsv(e,t){let n=e=>{let t=(e??``).toString();return/^[=+\-@\t\r]/.test(t)&&(t=`'`+t),`"${t.replace(/"/g,`""`)}"`},r=[];r.push([n(`Reporte de actividad`),n(t.titulo)]),r.push([n(`Desde`),n(t.desde),n(`Hasta`),n(t.hasta)]),r.push([n(l.BIBLIOTECA.nombreLargo)]),r.push([]),r.push([n(`RESUMEN`)]),r.push([n(`Préstamos realizados`),n(e.totalPrestamos)]),r.push([n(`Devoluciones`),n(e.totalDevoluciones)]),r.push([n(`Lectores nuevos`),n(e.totalNuevosLectores)]),r.push([n(`Devueltos con atraso`),n(e.devolucionesAtrasadas)]),r.push([]),r.push([n(`DETALLE DE PRÉSTAMOS`)]),r.push([n(`Fecha préstamo`),n(`Libro`),n(`Autor`),n(`Lector`),n(`RUT`),n(`Devolución esperada`),n(`Estado`)]),e.prestamos.forEach(e=>r.push([n(e.fecha_prestamo),n(e.libros?.titulo),n(e.libros?.autor),n(e.lectores?.nombre),n(e.lectores?.rut),n(e.fecha_devolucion_esperada),n(e.estado)])),r.push([]),r.push([n(`LECTORES NUEVOS`)]),r.push([n(`Nombre`),n(`RUT`),n(`Fecha de registro`)]),e.nuevosLectores.forEach(e=>r.push([n(e.nombre),n(e.rut),n((e.created_at||``).split(`T`)[0])]));let i=r.map(e=>e.join(`;`)).join(`\r
`);this._descargar(`﻿`+i,`reporte-biblionexo-${t.desde}-a-${t.hasta}.csv`,`text/csv;charset=utf-8;`),this.showToast(`Reporte exportado.`,`success`)}},G=[{valor:`1`,etiqueta:`Normal`},{valor:`1.15`,etiqueta:`Grande`},{valor:`1.3`,etiqueta:`Muy grande`}];function Je(){let e=`1`;try{e=localStorage.getItem(`biblionexo-escala-fuente`)||`1`}catch{}let t=G.findIndex(t=>t.valor===e);return t===-1?0:t}function Ye(e){let t=G[e];document.documentElement.style.setProperty(`--escala-fuente`,t.valor);try{localStorage.setItem(Be,t.valor)}catch{}}var Xe={async renderProfile(){let e=this._container();if(!e)return;let t=null;try{t=await B.miPerfil()}catch(e){console.warn(`Perfil no disponible:`,e.message)}if(this.currentView!==`profile`)return;if(!t){e.innerHTML=this._avisoMigracion(`008`,`008_perfiles_y_permisos_librero.sql`);return}this._perfil=t;let n=l.ROLE_LABELS[t.rol]||l.ROLE_LABELS.librero,i=(t.nombre||t.email||`?`).trim().charAt(0).toUpperCase(),a=e=>e?new Date(e).toLocaleString(`es-CL`,{day:`numeric`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`Nunca`,o=(e,t,n,i=``,a=``)=>r`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">${t}</label>
        <input id="${e}" value="${n??``}" ${s(i)}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
        ${a?r`<p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">${a}</p>`:``}
      </div>`;e.innerHTML=r`
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">

        <!-- Tarjeta de identificación -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-6 text-center h-fit">
          <div class="w-20 h-20 rounded-full bg-patrimonio-madera text-white font-serif font-bold text-3xl flex items-center justify-center mx-auto mb-3">${i}</div>
          <p class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 leading-tight">${t.nombre||`Sin nombre registrado`}</p>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 break-all">${t.email||``}</p>
          <div class="mt-3">
            <span class="stamp ${t.rol===`admin`?`stamp-info`:`stamp-success`} !rotate-0">
              <i aria-hidden="true" class="fas ${t.rol===`admin`?`fa-user-shield`:`fa-user`}"></i> ${n.title}
            </span>
          </div>
          ${t.cargo?r`<p class="text-xs text-stone-600 dark:text-stone-300 mt-2">${t.cargo}</p>`:``}

          <div class="border-t border-stone-200 dark:border-stone-700 mt-5 pt-4 space-y-2.5 text-left">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Último acceso</p>
              <p class="text-xs text-stone-700">${a(t.ultimo_acceso)}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Cuenta creada</p>
              <p class="text-xs text-stone-700">${a(t.creado_en)}</p>
            </div>
            ${t.actualizado_en?r`
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Perfil actualizado</p>
                <p class="text-xs text-stone-700">${a(t.actualizado_en)}</p>
              </div>`:``}
          </div>
        </div>

        <!-- Datos editables y contraseña -->
        <div class="lg:col-span-2 space-y-4">

          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600">
            <div class="catalog-card-header">
              <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Mis datos</h3>
            </div>
            <form id="perfil-form" class="p-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${o(`perfil-nombre`,`Nombre completo`,t.nombre,`required placeholder="María Antileo Huenchumán"`)}
                ${o(`perfil-cargo`,`Cargo`,t.cargo,`placeholder="Encargada de biblioteca"`,`Aparece junto a tu nombre en el menú.`)}
                ${o(`perfil-telefono`,`Teléfono de contacto`,t.telefono,`type="tel" placeholder="9 1234 5678"`,`Uso interno. No se muestra a los lectores.`)}
                <div>
                  <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Correo</label>
                  <input value="${t.email||``}" readonly
                    class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-800/50 text-sm text-stone-500 dark:text-stone-400" />
                  <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Es la identidad de tu cuenta. Solo puede cambiarla un administrador desde Supabase.</p>
                </div>
              </div>
              <div>
                <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Rol</label>
                <input value="${n.title}" readonly
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-800/50 text-sm text-stone-500 dark:text-stone-400" />
                <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Solo un administrador puede cambiar roles, desde Administración → Personal.
                  Tampoco puede hacerlo desde aquí quien tenga el rol: sería concederse permisos a sí mismo.
                </p>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-madera text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow">Guardar cambios</button>
              </div>
            </form>
          </div>

          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600">
            <div class="catalog-card-header">
              <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Cambiar contraseña</h3>
            </div>
            <form id="password-form" class="p-5 space-y-4">
              <p class="text-xs text-stone-500 dark:text-stone-400">
                Se pide la contraseña actual a propósito: el computador del mesón queda desatendido, y sin ese
                paso cualquiera podría apropiarse de la cuenta abierta.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                ${o(`pass-actual`,`Contraseña actual`,``,`type="password" autocomplete="current-password" required`)}
                ${o(`pass-nueva`,`Contraseña nueva`,``,`type="password" autocomplete="new-password" required minlength="12"`)}
                ${o(`pass-repetir`,`Repetir la nueva`,``,`type="password" autocomplete="new-password" required minlength="12"`)}
              </div>
              <p class="text-[11px] text-stone-500 dark:text-stone-400">
                Mínimo 12 caracteres. Es un sistema del Estado que trata datos personales de vecinos.
              </p>
              <div class="flex justify-end">
                <button type="submit" class="bg-patrimonio-lago hover:bg-[#14303c] text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow transition-colors">Cambiar contraseña</button>
              </div>
            </form>
          </div>

          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Tamaño de letra</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">
              Agranda el texto de toda la aplicación. Queda guardado en este equipo.
            </p>
            <div class="flex items-center gap-3 max-w-xs">
              <button id="fuente-menos-btn" type="button" aria-label="Reducir tamaño de letra"
                class="w-11 h-11 shrink-0 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-patrimonio-lago text-stone-700 font-serif font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">A-</button>
              <span id="fuente-nivel-texto" class="text-sm text-stone-600 dark:text-stone-300 font-bold flex-1 text-center"></span>
              <button id="fuente-mas-btn" type="button" aria-label="Aumentar tamaño de letra"
                class="w-11 h-11 shrink-0 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-patrimonio-lago text-stone-700 font-serif font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed">A+</button>
            </div>
          </div>

          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Sesión</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">
              La sesión se cierra sola tras 20 minutos sin actividad. También puedes cerrarla ahora.
            </p>
            <button id="perfil-logout-btn" class="border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold transition">
              <i aria-hidden="true" class="fas fa-right-from-bracket mr-1.5"></i> Cerrar sesión
            </button>
          </div>

        </div>
      </div>
    `,document.getElementById(`perfil-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target.querySelector(`button[type="submit"]`),r=document.getElementById(`perfil-nombre`).value.trim(),i=document.getElementById(`perfil-telefono`).value.trim();if(!r){this.showToast(`Escribe tu nombre completo.`,`error`);return}if(r.split(/\s+/).length<2){this.showToast(`Escribe tu nombre y al menos un apellido.`,`error`);return}if(i&&this.formatPhone(i).length<11){this.showToast(`El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.`,`error`);return}n.disabled=!0;try{await B.actualizarMiPerfil({nombre:r,telefono:i?this.formatPhone(i):null,cargo:document.getElementById(`perfil-cargo`).value.trim()||null}),this.showToast(`Perfil actualizado.`,`success`),await this.updateUserInfo({id:t.usuario_id,email:t.email}),this.renderProfile()}catch(e){this.showToast(e.message||`No se pudo guardar el perfil.`,`error`),n.disabled=!1}}),document.getElementById(`password-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target.querySelector(`button[type="submit"]`),n=document.getElementById(`pass-actual`).value,r=document.getElementById(`pass-nueva`).value,i=document.getElementById(`pass-repetir`).value,a=this.validarPassword(r);if(a){this.showToast(a,`error`);return}if(r!==i){this.showToast(`Las dos contraseñas nuevas no coinciden.`,`error`);return}if(r===n){this.showToast(`La contraseña nueva debe ser distinta de la actual.`,`error`);return}t.disabled=!0;try{await ie(n,r),e.target.reset(),this.showToast(`Contraseña cambiada correctamente.`,`success`)}catch(e){this.showToast(e.message||`No se pudo cambiar la contraseña.`,`error`)}finally{t.disabled=!1}}),document.getElementById(`perfil-logout-btn`).addEventListener(`click`,async()=>{await this.showConfirm(`¿Cerrar la sesión en este equipo?`,{title:`Cerrar sesión`,confirmText:`Cerrar sesión`})&&g()});let c=Je(),u=document.getElementById(`fuente-nivel-texto`),d=()=>{u&&(u.textContent=G[c].etiqueta),document.getElementById(`fuente-menos-btn`).disabled=c===0,document.getElementById(`fuente-mas-btn`).disabled=c===G.length-1};d(),document.getElementById(`fuente-menos-btn`).addEventListener(`click`,()=>{c=Math.max(0,c-1),Ye(c),d()}),document.getElementById(`fuente-mas-btn`).addEventListener(`click`,()=>{c=Math.min(G.length-1,c+1),Ye(c),d()})}},K={async obtenerAuditoria(e){return z.obtenerAuditoria(e)},async verificarRls(){return z.verificarRls()},async verificarCirculacion(){return z.verificarCirculacion()},async obtenerRespaldos(e){return z.obtenerRespaldos(e)},async purgarDatosAntiguos(){return z.purgarDatosAntiguos()},async evidenciaIncidente(e,t){return z.evidenciaIncidente(e,t)},async resumenErrores(){return z.resumenErrores()},async listarErrores(e,t){return z.listarErrores(e,t)},async verificarDefiniciones(){return z.verificarDefiniciones()},async marcarErrorVisto(e){return z.marcarErrorVisto(e)},async purgarErrores(e){return z.purgarErrores(e)},async listarEnlacesEscaneo(){return z.listarEnlacesEscaneo()},async revocarEnlaceEscaneo(e){return z.revocarEnlaceEscaneo(e)}},q={async obtenerLibros(e=``,t=0,n=25){return z.obtenerLibros(e,t,n)},async consultarLibro(e){return z.consultarLibro(e)},async agregarLibro(e){return z.agregarLibro(e)},async actualizarLibro(e,t){return z.actualizarLibro(e,t)},async eliminarLibro(e){return z.eliminarLibro(e)},async listarLibrosEliminados(){return z.listarLibrosEliminados()},async restaurarLibro(e){return z.restaurarLibro(e)},async ajustarCopias(e,t){return z.ajustarCopias(e,t)},async revisarInventario(){return z.revisarInventario()},async corregirInventario(e){return z.corregirInventario(e)}},J={async reservarLibro(e,t){return z.reservarLibro(e,t)},async retirarReserva(e){return z.retirarReserva(e)},async cancelarReserva(e){return z.cancelarReserva(e)},async listarReservas(e){return z.listarReservas(e)},async obtenerReservasApartadas(){return z.obtenerReservasApartadas()}},Y={async obtenerLectores(e=``,t=0,n=25){return z.obtenerLectores(e,t,n)},async estadoLector(e){return z.estadoLector(e)},async agregarLector(e){return z.agregarLector(e)},async actualizarLector(e,t){return z.actualizarLector(e,t)},async eliminarLector(e,t){return z.eliminarLector(e,t)},async actualizarContactoLector(e,t){return z.actualizarContactoLector(e,t)},async obtenerBloqueados(){return z.obtenerBloqueados()},async bloquearLector(e,t,n){return z.bloquearLector(e,t,n)},async exportarDatosLector(e){return z.exportarDatosLector(e)},async anonimizarLector(e,t){return z.anonimizarLector(e,t)}},Ze={async renderAdmin(){let e=this._container();if(!e)return;if(this.currentUserRole!==`admin`){e.innerHTML=`<div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl border border-stone-300 dark:border-stone-600 p-6 max-w-md">
        <p class="text-sm text-stone-600 dark:text-stone-300"><i aria-hidden="true" class="fas fa-lock mr-1.5"></i>Esta sección es solo para administradores.</p>
      </div>`;return}let t=this.adminTab||`inventario`,n=(e,n,i)=>r`
      <button data-admin-tab="${e}" class="admin-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${t===e?`bg-patrimonio-lago text-white border-patrimonio-lago`:`bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:border-patrimonio-lago`}"><i aria-hidden="true" class="fas ${i} mr-1"></i>${n}</button>`;e.innerHTML=r`
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
    `,e.querySelectorAll(`.admin-tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.adminTab=e.dataset.adminTab,this.renderAdmin()})});let i=document.getElementById(`admin-panel`),a={inventario:()=>this._adminInventario(i),reservas:()=>this._adminReservas(i),bloqueados:()=>this._adminBloqueados(i),personal:()=>this._adminPersonal(i),enlaces:()=>this._adminEnlacesEscaneo(i),eliminados:()=>this._adminEliminados(i),auditoria:()=>this._adminAuditoria(i),cumplimiento:()=>this._adminCumplimiento(i),diagnostico:()=>this._adminDiagnostico(i)};try{await(a[t]||a.inventario)()}catch(e){i.innerHTML=r`<div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl border border-stone-300 dark:border-stone-600 p-6">
        <p class="text-sm text-stone-600 dark:text-stone-300">${e.message||`No se pudo cargar la sección.`}</p></div>`}},async _adminInventario(e){let t=await q.revisarInventario();if(t===null){e.innerHTML=this._avisoMigracion(`006`,`006_bloqueo_inventario_admin.sql`);return}if(t.length===0){e.innerHTML=`
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-6 text-center">
          <i aria-hidden="true" class="fas fa-circle-check text-3xl text-patrimonio-bosque mb-3"></i>
          <p class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">El inventario cuadra</p>
          <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">En todos los libros, los ejemplares disponibles más los prestados coinciden con el total registrado.</p>
        </div>`;return}e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">${t.length} libro${t.length===1?``:`s`} con inventario descuadrado</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Los ejemplares disponibles más los prestados no coinciden con el total. Corregir recalcula las disponibles a partir de los préstamos reales.</p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
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
            ${t.map(e=>r`
              <tr class="border-t border-stone-200 dark:border-stone-700">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800 dark:text-stone-200">${e.titulo}</div>
                  <div class="text-[11px] font-mono text-stone-500 dark:text-stone-400">${e.isbn||`sin ISBN`}</div>
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
      </div>`,e.querySelectorAll(`.fix-inv-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await q.corregirInventario(e.dataset.id);this.showToast(`Corregido: ${t.copias_totales} ejemplares, ${t.stock} disponibles.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo corregir.`,`error`),e.disabled=!1}})})},async _adminReservas(e){let t=await J.listarReservas();if(t===null){e.innerHTML=this._avisoMigracion(`022`,`022_reservas.sql`);return}if(t.length===0){e.innerHTML=r`
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-6 text-center">
          <i aria-hidden="true" class="fas fa-circle-check text-3xl text-patrimonio-bosque mb-3"></i>
          <p class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">No hay reservas pendientes</p>
          <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">Nadie está esperando un libro en este momento.</p>
        </div>`;return}e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">${t.length} reserva${t.length===1?``:`s`} vigente${t.length===1?``:`s`}</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            "Apartado" significa que el ejemplar ya está separado, físicamente en la biblioteca, esperando que lo
            retiren antes del plazo. "En fila" todavía no tiene un ejemplar propio: espera a que se devuelva uno.
          </p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-left px-4 py-3">Lector</th>
              <th class="text-center px-4 py-3">Situación</th>
              <th class="text-right px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>r`
              <tr class="border-t border-stone-200 dark:border-stone-700">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800 dark:text-stone-200">${e.libro_titulo||`Sin título`}</div>
                  <div class="text-[11px] font-mono text-stone-500 dark:text-stone-400">${e.libro_isbn||`sin ISBN`}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-stone-800 dark:text-stone-200">${e.lector_nombre}</div>
                  <div class="text-[11px] font-mono text-stone-500 dark:text-stone-400">${e.lector_rut}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  ${e.estado===`apartada`?r`
                    <span class="stamp stamp-success !rotate-0">Apartado</span>
                    <div class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Retirar antes del ${this._fechaHoraLegible(e.vence_apartado_en)}</div>`:r`
                    <span class="stamp stamp-info !rotate-0">En fila</span>
                    <div class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Posición ${e.posicion_en_fila}</div>`}
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
                  ${e.estado===`apartada`?r`
                    <button class="retirar-reserva-btn btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.reserva_id}">Retirar</button>`:``}
                  <button class="cancelar-reserva-btn text-rose-700 font-bold" data-id="${e.reserva_id}">Cancelar</button>
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.retirar-reserva-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Confirmar que la persona retiró el ejemplar apartado? Esto registra un préstamo a su nombre.`,{title:`Retirar reserva`,confirmText:`Confirmar retiro`,danger:!1})){e.disabled=!0;try{await J.retirarReserva(e.dataset.id),this.showToast(`Retiro registrado: el préstamo ya quedó a nombre del lector.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo registrar el retiro.`,`error`),e.disabled=!1}}})}),e.querySelectorAll(`.cancelar-reserva-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Cancelar esta reserva? Si ya tenía un ejemplar apartado, pasa a quien sigue en la fila o vuelve a estar disponible para cualquiera.`,{title:`Cancelar reserva`,confirmText:`Cancelar reserva`})){e.disabled=!0;try{await J.cancelarReserva(e.dataset.id),this.showToast(`Reserva cancelada.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo cancelar la reserva.`,`error`),e.disabled=!1}}})})},async _adminBloqueados(e){let t=await Y.obtenerBloqueados();if(t===null){e.innerHTML=this._avisoMigracion(`006`,`006_bloqueo_inventario_admin.sql`);return}e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Lectores bloqueados</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Solo bloqueos administrativos. Los lectores con libros atrasados quedan suspendidos automáticamente y se liberan al devolver, sin aparecer en esta lista.</p>
        </div>
        ${t.length===0?r`<p class="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">Ningún lector tiene bloqueo administrativo.</p>`:r`<table class="w-full text-sm">
              <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Lector</th>
                  <th class="text-left px-4 py-3">Motivo</th>
                  <th class="text-left px-4 py-3">Desde</th>
                  <th class="text-right px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(e=>r`
                  <tr class="border-t border-stone-200 dark:border-stone-700">
                    <td class="px-4 py-3">
                      <div class="font-bold text-stone-800 dark:text-stone-200">${e.nombre}</div>
                      <div class="text-[11px] font-mono text-stone-500 dark:text-stone-400">${e.rut}</div>
                    </td>
                    <td class="px-4 py-3 text-stone-600 dark:text-stone-300">${e.motivo_bloqueo||`—`}</td>
                    <td class="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs">${e.bloqueado_en?this._fechaLegible(e.bloqueado_en.split(`T`)[0]):`—`}</td>
                    <td class="px-4 py-3 text-right">
                      <button class="unblock-btn btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.id}">Desbloquear</button>
                    </td>
                  </tr>`)}
              </tbody>
            </table>`}
      </div>

      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 mt-4 p-5 max-w-lg">
        <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">Bloquear un lector</h3>
        <div class="space-y-3">
          <div>
            <label for="block-rut" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">RUT</label>
            <input id="block-rut" placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="block-reason" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Motivo</label>
            <input id="block-reason" placeholder="Pérdida de ejemplar sin reposición" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <button id="block-btn" class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm w-full">Bloquear lector</button>
        </div>
      </div>`,e.querySelectorAll(`.unblock-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Levantar el bloqueo de este lector?`,{title:`Desbloquear`,confirmText:`Desbloquear`,danger:!1}))try{await Y.bloquearLector(e.dataset.id,!1),this.showToast(`Lector desbloqueado.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo desbloquear.`,`error`)}})}),document.getElementById(`block-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`block-rut`).value.trim(),n=document.getElementById(`block-reason`).value.trim();if(!this.isValidRut(t)){this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`);return}if(!n){this.showToast(`Escribe el motivo del bloqueo.`,`error`);return}let r=e.currentTarget;r.disabled=!0;try{let e=await Y.estadoLector(this.formatRut(t));if(!e.existe){this.showToast(`Ese RUT no está registrado.`,`error`),r.disabled=!1;return}await Y.bloquearLector(e.lector_id,!0,n),this.showToast(`${e.nombre} quedó bloqueado.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo bloquear.`,`error`),r.disabled=!1}})},async _adminPersonal(e){let t=await B.listarPersonal();if(t===null){e.innerHTML=this._avisoMigracion(`006`,`006_bloqueo_inventario_admin.sql`);return}e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Personal con acceso</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Invita cuentas nuevas más abajo y asigna el rol de cada una aquí. El nombre y el cargo los completa cada persona en su propio perfil.</p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Persona</th>
              <th class="text-left px-4 py-3">Rol</th>
              <th class="text-left px-4 py-3">Último acceso</th>
              <th class="text-right px-4 py-3">Cambiar a</th>
              <th class="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>r`
              <tr class="border-t border-stone-200 dark:border-stone-700">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800 dark:text-stone-200">${e.nombre||`Sin nombre en su perfil`}</div>
                  <div class="text-xs text-stone-500 dark:text-stone-400">${e.email}</div>
                  ${e.cargo?r`<div class="text-[11px] text-stone-500 dark:text-stone-400 italic">${e.cargo}</div>`:``}
                </td>
                <td class="px-4 py-3">
                  <span class="stamp ${e.rol===`admin`?`stamp-danger`:`stamp-info`} !rotate-0">
                    <i aria-hidden="true" class="fas ${e.rol===`admin`?`fa-user-shield`:`fa-user`}"></i> ${e.rol}
                  </span>
                </td>
                <td class="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs">${e.ultimo_acceso?this._fechaLegible(e.ultimo_acceso.split(`T`)[0]):`Nunca`}</td>
                <td class="px-4 py-3 text-right">
                  <button class="role-btn btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold"
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

      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 mt-4 p-5 max-w-lg">
        <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Invitar personal nuevo</h3>
        <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Manda una invitación por correo con el rol ya asignado. La persona la acepta, crea su contraseña y
          queda con acceso de inmediato — sin pasar por el panel de Supabase.
        </p>
        <div class="space-y-3">
          <div>
            <label for="invite-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Correo</label>
            <input id="invite-email" type="email" placeholder="nombre@ejemplo.cl" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="invite-rol" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Rol</label>
            <select id="invite-rol" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">
              <option value="librero">Librero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button id="invite-btn" class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm w-full">
            <i aria-hidden="true" class="fas fa-paper-plane mr-1.5"></i> Enviar invitación
          </button>
        </div>
      </div>`,document.getElementById(`invite-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`invite-email`).value.trim(),n=document.getElementById(`invite-rol`).value;if(!t||!this.isValidEmail(t)){this.showToast(`Escribe un correo válido.`,`error`);return}let r=e.currentTarget;r.disabled=!0;try{await B.invitarPersonal(t,n),this.showToast(`Invitación enviada a ${t}.`,`success`),document.getElementById(`invite-email`).value=``,this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo enviar la invitación.`,`error`),r.disabled=!1}}),e.querySelectorAll(`.role-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.rol;if(await this.showConfirm(`¿Cambiar el rol de esta cuenta a ${t}?`,{title:`Cambiar rol`,confirmText:`Cambiar`,danger:t===`admin`}))try{await B.asignarRol(e.dataset.id,t),this.showToast(`Rol actualizado.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo cambiar el rol.`,`error`)}})}),e.querySelectorAll(`.delete-personal-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Eliminar por completo la cuenta de ${e.dataset.email}? Pierde acceso al sistema de inmediato y no puede deshacerse.`,{title:`Eliminar cuenta`,confirmText:`Eliminar`})){e.disabled=!0;try{await B.eliminarPersonal(e.dataset.id),this.showToast(`Cuenta eliminada.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo eliminar la cuenta.`,`error`),e.disabled=!1}}})})},async _adminEnlacesEscaneo(e){let t=await K.listarEnlacesEscaneo();if(t===null){e.innerHTML=this._avisoMigracion(`014`,`014_enlaces_escaneo_remoto.sql`);return}if(t.length===0){e.innerHTML=r`
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-6 max-w-lg">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Enlaces de escaneo remoto</h3>
          <p class="text-sm text-stone-600 dark:text-stone-300">Nadie ha generado un enlace todavía. Se crean desde Mesón, con el botón
            «Escanear desde el celular».</p>
        </div>`;return}e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Enlaces de escaneo remoto</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Cada uno permite agregar o reponer libros sin iniciar sesión, hasta que vence o se revoca. Se generan
            desde Mesón, con el botón «Escanear desde el celular». Los últimos 200, del más nuevo al más antiguo.
          </p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Generado por</th>
              <th class="text-left px-4 py-3">Vence</th>
              <th class="text-left px-4 py-3">Estado</th>
              <th class="text-left px-4 py-3">Usos</th>
              <th class="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>r`
              <tr class="border-t border-stone-200 dark:border-stone-700">
                <td class="px-4 py-3">
                  <div class="text-xs text-stone-500 dark:text-stone-400">${e.creado_por_email||`Cuenta eliminada`}</div>
                  <div class="text-[11px] text-stone-500 dark:text-stone-400">${this._fechaHoraLegible(e.creado_en)}</div>
                </td>
                <td class="px-4 py-3 text-stone-600 dark:text-stone-300 text-xs">${this._fechaHoraLegible(e.expira_en)}</td>
                <td class="px-4 py-3">
                  ${e.vigente?`<span class="stamp stamp-success !rotate-0"><i aria-hidden="true" class="fas fa-check"></i> Vigente</span>`:e.revocado?`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-ban"></i> Revocado</span>`:`<span class="stamp !rotate-0 bg-stone-200 text-stone-600 dark:text-stone-300"><i aria-hidden="true" class="fas fa-clock"></i> Vencido</span>`}
                </td>
                <td class="px-4 py-3 text-stone-600 dark:text-stone-300 text-xs">
                  ${e.usos}${e.ultimo_uso_en?r`<div class="text-[11px] text-stone-500 dark:text-stone-400">último: ${this._fechaHoraLegible(e.ultimo_uso_en)}</div>`:``}
                </td>
                <td class="px-4 py-3 text-right">
                  ${e.vigente?r`
                    <button class="revocar-enlace-btn text-rose-700 hover:text-rose-800 p-1.5" title="Revocar enlace"
                      data-id="${e.id}">
                      <i aria-hidden="true" class="fas fa-ban"></i>
                    </button>`:``}
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.revocar-enlace-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Revocar este enlace? Deja de servir de inmediato, aunque alguien lo tenga guardado.`,{title:`Revocar enlace`,confirmText:`Revocar`})){e.disabled=!0;try{await K.revocarEnlaceEscaneo(e.dataset.id),this.showToast(`Enlace revocado.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo revocar el enlace.`,`error`),e.disabled=!1}}})})},async _adminEliminados(e){let t=await q.listarLibrosEliminados();if(t===null){e.innerHTML=this._avisoMigracion(`021`,`021_papelera_libros.sql`);return}if(t.length===0){e.innerHTML=r`
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-6 max-w-lg">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Libros eliminados</h3>
          <p class="text-sm text-stone-600 dark:text-stone-300">Ningún libro eliminado del catálogo está pendiente de restaurar.</p>
        </div>`;return}e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Libros eliminados</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Se pueden restaurar tal como quedaron justo antes de eliminarse — título, autor, ejemplares y todo su
            historial de préstamos, reenganchado.
          </p>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-center px-4 py-3">Ejemplares</th>
              <th class="text-left px-4 py-3">Eliminado</th>
              <th class="text-right px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>r`
              <tr class="border-t border-stone-200 dark:border-stone-700">
                <td class="px-4 py-3">
                  <div class="font-bold text-stone-800 dark:text-stone-200">${e.titulo||`Sin título`}</div>
                  <div class="text-xs text-stone-500 dark:text-stone-400">${e.autor||``}</div>
                  <div class="text-[11px] font-mono text-stone-500 dark:text-stone-400">${e.isbn||`sin ISBN`}</div>
                </td>
                <td class="px-4 py-3 text-center tabular-nums">${e.copias_totales??`—`}</td>
                <td class="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs">
                  ${this._fechaHoraLegible(e.eliminado_en)}
                  ${e.eliminado_por?r`<div class="text-[11px] text-stone-500 dark:text-stone-400">${e.eliminado_por}</div>`:``}
                </td>
                <td class="px-4 py-3 text-right">
                  <button class="restore-book-btn btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold" data-id="${e.libro_id}">Restaurar</button>
                </td>
              </tr>`)}
          </tbody>
        </table>
      </div>`,e.querySelectorAll(`.restore-book-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Restaurar este libro? Vuelve al catálogo con sus ejemplares y su historial de préstamos.`,{title:`Restaurar libro`,confirmText:`Restaurar`,danger:!1})){e.disabled=!0;try{await q.restaurarLibro(e.dataset.id),this.showToast(`Libro restaurado.`,`success`),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo restaurar.`,`error`),e.disabled=!1}}})})},async _adminAuditoria(e){let t=await K.obtenerAuditoria(100);if(t===null){e.innerHTML=this._avisoMigracion(`005`,`005_renovaciones_auditoria_busqueda.sql`);return}let n=e=>s({INSERT:`<span class="stamp stamp-success !rotate-0"><i aria-hidden="true" class="fas fa-plus"></i> Creó</span>`,UPDATE:`<span class="stamp stamp-info !rotate-0"><i aria-hidden="true" class="fas fa-pen"></i> Modificó</span>`,DELETE:`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-trash"></i> Eliminó</span>`}[e]||String(e??``));e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Últimos movimientos</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Se registra automáticamente en la base de datos, incluso si alguien escribe directo en las tablas.</p>
        </div>
        ${t.length===0?r`<p class="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">Todavía no hay movimientos registrados.</p>`:r`<table class="w-full text-sm">
              <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Cuándo</th>
                  <th class="text-left px-4 py-3">Quién</th>
                  <th class="text-left px-4 py-3">Qué hizo</th>
                  <th class="text-left px-4 py-3">Dónde</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(e=>r`
                  <tr class="border-t border-stone-200 dark:border-stone-700">
                    <td class="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs whitespace-nowrap">
                      ${new Date(e.created_at).toLocaleString(`es-CL`,{timeZone:`America/Santiago`,dateStyle:`short`,timeStyle:`short`})}
                    </td>
                    <td class="px-4 py-3 text-stone-700 text-xs">${e.usuario_email||`sistema`}</td>
                    <td class="px-4 py-3">${n(e.accion)}</td>
                    <td class="px-4 py-3 text-stone-500 dark:text-stone-400 text-xs">${e.tabla} <span class="text-stone-300">#${e.registro_id||`?`}</span></td>
                  </tr>`)}
              </tbody>
            </table>`}
      </div>`},async _adminCumplimiento(e){let[t,n,i,a]=await Promise.all([K.verificarRls(),B.obtenerParametros(),K.verificarCirculacion(),K.obtenerRespaldos(5)]);if(t===null||n===null){e.innerHTML=this._avisoMigracion(`007`,`007_correcciones_y_cumplimiento_legal.sql`);return}let o=t.filter(e=>e.diagnostico!==`Correcto`),c=(i||[]).filter(e=>!e.es_definer),l=a[0]||null;e.innerHTML=r`
      <div class="space-y-4">

        <!-- Respaldo automático -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border ${l&&!l.ok?`border-rose-300`:`border-stone-300 dark:border-stone-600`} overflow-hidden">
          <div class="catalog-card-header">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Respaldo automático</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Una tarea programada (pg_cron) corre todos los días a las 03:00-04:00, hora de Chile, y sube una
              copia completa de los datos a un almacenamiento privado, sin que nadie tenga que apretar un botón.
            </p>
          </div>
          ${a.length===0?r`
            <p class="px-4 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              Todavía no hay ninguna corrida registrada. Si la migración
              <code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-xs font-mono">018_respaldo_automatico.sql</code>
              recién se aplicó, la primera corrida real llega en la próxima ventana programada.
            </p>`:r`
            <div class="px-4 py-3 border-b border-stone-200 dark:border-stone-700 ${l.ok?`bg-patrimonio-bosque/5`:`bg-rose-50`}">
              <p class="text-sm font-bold ${l.ok?`text-patrimonio-bosque`:`text-rose-800`}">
                <i aria-hidden="true" class="fas ${l.ok?`fa-circle-check`:`fa-triangle-exclamation`} mr-1.5"></i>
                Último respaldo: ${l.ok?`correcto`:`falló`}, ${this._fechaLegible(l.ejecutado_en.split(`T`)[0])}
              </p>
              ${!l.ok&&l.mensaje?r`<p class="text-xs text-rose-700 mt-1">${l.mensaje}</p>`:``}
            </div>
            <table class="w-full text-sm">
              <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Fecha</th>
                  <th class="text-center px-4 py-3">Estado</th>
                  <th class="text-right px-4 py-3">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                ${a.map(e=>r`
                  <tr class="border-t border-stone-200 dark:border-stone-700">
                    <td class="px-4 py-3 text-stone-600 dark:text-stone-300 text-xs">${new Date(e.ejecutado_en).toLocaleString(`es-CL`)}</td>
                    <td class="px-4 py-3 text-center">${e.ok?s(`<i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque"></i>`):s(`<i aria-hidden="true" class="fas fa-circle-xmark text-rose-700"></i>`)}</td>
                    <td class="px-4 py-3 text-right text-stone-500 dark:text-stone-400 text-xs tabular-nums">${e.bytes?`${(e.bytes/1024).toFixed(1)} KB`:`—`}</td>
                  </tr>`)}
              </tbody>
            </table>`}
        </div>

        <!-- Seguridad de acceso a los datos -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border ${o.length?`border-rose-300`:`border-stone-300 dark:border-stone-600`} shadow-sm overflow-hidden">
          <div class="catalog-card-header">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Protección de las tablas</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Sin RLS, cualquiera con la clave pública puede leer y escribir desde la consola del navegador. Ocultar botones no protege nada.</p>
          </div>
          ${o.length?r`
            <div class="bg-rose-50 border-b border-rose-200 px-4 py-3">
              <p class="text-sm font-bold text-rose-800"><i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>${o.length} tabla${o.length===1?``:`s`} sin protección adecuada</p>
            </div>`:``}
          <table class="w-full text-sm">
            <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
              <tr>
                <th class="text-left px-4 py-3">Tabla</th>
                <th class="text-center px-4 py-3">RLS</th>
                <th class="text-center px-4 py-3">Políticas</th>
                <th class="text-left px-4 py-3">Diagnóstico</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(e=>r`
                <tr class="border-t border-stone-200 dark:border-stone-700">
                  <td class="px-4 py-3 font-mono text-stone-700">${e.tabla}</td>
                  <td class="px-4 py-3 text-center">${e.rls_activo?s(`<i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque"></i>`):s(`<i aria-hidden="true" class="fas fa-circle-xmark text-rose-700"></i>`)}</td>
                  <td class="px-4 py-3 text-center tabular-nums">${e.politicas}</td>
                  <td class="px-4 py-3 text-xs ${e.diagnostico===`Correcto`?`text-stone-500 dark:text-stone-400`:`text-rose-700 font-bold`}">${e.diagnostico}</td>
                </tr>`)}
            </tbody>
          </table>
        </div>

        <!-- Circulación: comprueba que el personal pueda de verdad trabajar -->
        ${i===null?r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-amber-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Funciones de circulación</h3>
            <p class="text-sm text-stone-600 dark:text-stone-300">
              Falta ejecutar la migración <code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-xs font-mono">008_perfiles_y_permisos_librero.sql</code>.
              Hasta entonces no se puede comprobar si el personal con rol librero puede prestar y devolver libros.
            </p>
          </div>`:r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border ${c.length?`border-rose-300`:`border-stone-300 dark:border-stone-600`} overflow-hidden">
            <div class="catalog-card-header">
              <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Funciones de circulación</h3>
              <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Las funciones que escriben deben declararse SECURITY DEFINER. Si no, las mismas políticas RLS
                que protegen las tablas bloquean la escritura, y un préstamo o una devolución pueden fallar
                <span class="font-bold">sin mostrar ningún error</span>: la pantalla dice que se guardó y la base de datos no cambia.
              </p>
            </div>
            ${c.length?r`
              <div class="bg-rose-50 border-b border-rose-200 px-4 py-3">
                <p class="text-sm font-bold text-rose-800"><i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>${c.length} función${c.length===1?``:`es`} en riesgo: el rol librero no podrá operar</p>
              </div>`:``}
            <table class="w-full text-sm">
              <thead class="bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-black">
                <tr>
                  <th class="text-left px-4 py-3">Función</th>
                  <th class="text-center px-4 py-3">Definer</th>
                  <th class="text-left px-4 py-3">Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                ${i.map(e=>r`
                  <tr class="border-t border-stone-200 dark:border-stone-700">
                    <td class="px-4 py-3 font-mono text-stone-700">${e.funcion}</td>
                    <td class="px-4 py-3 text-center">${e.es_definer?s(`<i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque"></i>`):s(`<i aria-hidden="true" class="fas fa-circle-xmark text-rose-700"></i>`)}</td>
                    <td class="px-4 py-3 text-xs ${e.es_definer?`text-stone-500 dark:text-stone-400`:`text-rose-700 font-bold`}">${e.diagnostico}</td>
                  </tr>`)}
              </tbody>
            </table>
          </div>`}

        <!-- Derechos del titular -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Derechos del titular</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 mb-4">
            La Ley 21.719 rige desde el 1 de diciembre de 2026. Un lector puede pedir acceder a sus datos,
            recibirlos en formato reutilizable o solicitar su eliminación. Deja constancia de cada solicitud.
          </p>
          <div class="space-y-3 max-w-md">
            <div>
              <label for="arco-rut" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">RUT del solicitante</label>
              <input id="arco-rut" placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm font-mono focus:outline-none focus:border-patrimonio-lago" />
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="arco-export-btn" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">
                <i aria-hidden="true" class="fas fa-download mr-1.5"></i> Entregar sus datos
              </button>
              <button id="arco-delete-btn" class="btn-secundario bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-xl text-sm font-medium">
                <i aria-hidden="true" class="fas fa-user-slash mr-1.5"></i> Suprimir datos
              </button>
            </div>
            <p class="text-[11px] text-stone-500 dark:text-stone-400">
              La supresión borra nombre, RUT y contacto, y conserva el registro estadístico del préstamo sin
              vincularlo a una persona. Es la forma de cumplir el derecho de supresión sin perder la constancia
              de gestión que exige la Ley 20.285 de Transparencia.
            </p>
          </div>
        </div>

        <!-- Conservación -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Plazo de conservación</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 mb-4">
            No se pueden conservar datos identificables más tiempo del necesario para la finalidad declarada.
            Esta acción anonimiza a los lectores sin actividad en el plazo configurado.
          </p>
          <button id="purge-btn" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-broom mr-1.5"></i> Ejecutar purga por antigüedad
          </button>
        </div>

        <!-- Evidencia de incidentes -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Evidencia para reporte de incidente</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 mb-4">
            La Ley 21.663 obliga a las municipalidades a dar alerta temprana en 3 horas e informe inicial en 72.
            Esto extrae la actividad del período para adjuntar al reporte al CSIRT Nacional.
          </p>
          <div class="flex flex-wrap gap-2 items-end">
            <div>
              <label for="ev-desde" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Desde</label>
              <input id="ev-desde" type="date" class="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm" />
            </div>
            <div>
              <label for="ev-hasta" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Hasta</label>
              <input id="ev-hasta" type="date" class="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm" />
            </div>
            <button id="ev-btn" class="btn-madera text-white px-4 py-2 rounded-xl text-sm font-medium">
              <i aria-hidden="true" class="fas fa-file-shield mr-1.5"></i> Extraer evidencia
            </button>
          </div>
        </div>

        <!-- Parámetros -->
        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-hidden">
          <div class="catalog-card-header">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Parámetros del sistema</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Definidos en la base de datos. La interfaz los lee de aquí, así que no pueden quedar desincronizados.</p>
          </div>
          <table class="w-full text-sm">
            <tbody>
              ${n.map(e=>r`
                <tr class="border-t border-stone-200 dark:border-stone-700">
                  <td class="px-4 py-3">
                    <div class="font-mono text-xs text-stone-700">${e.clave}</div>
                    <div class="text-[11px] text-stone-500 dark:text-stone-400">${e.descripcion||``}</div>
                  </td>
                  <td class="px-4 py-3 w-32">
                    <input class="param-input w-full px-2 py-1.5 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm tabular-nums"
                      data-clave="${e.clave}" value="${e.valor}" />
                  </td>
                </tr>`)}
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50/60 flex justify-end">
            <button id="save-params-btn" class="btn-madera text-white px-4 py-2 rounded-xl text-sm font-medium">Guardar parámetros</button>
          </div>
        </div>
      </div>`,document.getElementById(`arco-export-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`arco-rut`).value.trim();if(!this.isValidRut(t))return this.showToast(`El RUT no es válido.`,`error`);let n=e.currentTarget;n.disabled=!0;try{let e=await Y.exportarDatosLector(this.formatRut(t));this._descargar(JSON.stringify(e,null,2),`datos-personales-${this.formatRut(t)}.json`,`application/json`),this.showToast(`Datos entregados. Guarda constancia de la solicitud.`,`success`)}catch(e){this.showToast(e.message||`No se pudo exportar.`,`error`)}finally{n.disabled=!1}}),document.getElementById(`arco-delete-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`arco-rut`).value.trim();if(!this.isValidRut(e))return this.showToast(`El RUT no es válido.`,`error`);let t=await Y.estadoLector(this.formatRut(e));if(!t.existe)return this.showToast(`Ese RUT no está registrado.`,`error`);if(!await this.showConfirm(`Se borrarán el nombre, RUT y contacto de ${t.nombre}. El historial se conservará sin vincularlo a ninguna persona. Esta acción no se puede deshacer.`,{title:`Suprimir datos personales`,confirmText:`Suprimir`}))return;let n=await this.showPrompt(`Deja constancia del motivo (queda en la auditoría):`,{title:`Motivo de la supresión`,placeholder:`Solicitud del titular del 26/07/2026`,confirmText:`Confirmar`});if(n){if(n.trim().length<10)return this.showToast(`El motivo debe tener al menos 10 caracteres para la auditoría.`,`error`);try{await Y.anonimizarLector(t.lector_id,n),this.showToast(`Datos personales suprimidos.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo suprimir.`,`error`)}}}),document.getElementById(`purge-btn`).addEventListener(`click`,async e=>{if(!await this.showConfirm(`Se anonimizarán todos los lectores sin actividad en el plazo configurado. No se puede deshacer.`,{title:`Purga por antigüedad`,confirmText:`Ejecutar`}))return;let t=e.currentTarget;t.disabled=!0;try{let e=await K.purgarDatosAntiguos();this.showToast(e===0?`No había titulares que superaran el plazo.`:`${e} titular(es) anonimizado(s).`,`success`)}catch(e){this.showToast(e.message||`No se pudo ejecutar la purga.`,`error`)}finally{t.disabled=!1}});let u=this._rangoPeriodo(`dia`).desde;document.getElementById(`ev-hasta`).value=u,document.getElementById(`ev-desde`).value=u,document.getElementById(`ev-btn`).addEventListener(`click`,async e=>{let t=document.getElementById(`ev-desde`).value,n=document.getElementById(`ev-hasta`).value;if(!t||!n)return this.showToast(`Elige el rango de fechas.`,`error`);let r=e.currentTarget;r.disabled=!0;try{let e=await K.evidenciaIncidente(`${t}T00:00:00`,`${n}T23:59:59`);this._descargar(JSON.stringify(e,null,2),`evidencia-incidente-${t}-a-${n}.json`,`application/json`),this.showToast(`Evidencia extraída.`,`success`)}catch(e){this.showToast(e.message||`No se pudo extraer la evidencia.`,`error`)}finally{r.disabled=!1}}),document.getElementById(`save-params-btn`).addEventListener(`click`,async t=>{let n=t.currentTarget;n.disabled=!0;try{for(let t of e.querySelectorAll(`.param-input`))await B.actualizarParametro(t.dataset.clave,t.value.trim());await this.cargarParametros(),this.showToast(`Parámetros guardados.`,`success`)}catch(e){this.showToast(e.message||`No se pudieron guardar.`,`error`)}finally{n.disabled=!1}})},async _adminDiagnostico(e){let[t,n,i]=await Promise.all([K.resumenErrores(),K.listarErrores(100,!1),K.verificarDefiniciones()]);if(t===null||n===null){e.innerHTML=this._avisoMigracion(`009`,`009_registro_de_errores.sql`);return}let a=e=>e?new Date(e).toLocaleString(`es-CL`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}):`—`,o=(e,t,n=`text-stone-900 dark:text-stone-100`)=>r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
        <p class="font-serif font-semibold text-4xl ${n}">${t}</p>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wide mt-1">${e}</p>
      </div>`,s=(i||[]).filter(e=>e.estado!==`Correcto`);e.innerHTML=r`
      <div class="space-y-4">

        ${i===null?r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-amber-300 p-5">
            <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Definiciones de funciones</h3>
            <p class="text-sm text-stone-600 dark:text-stone-300">
              Falta ejecutar la migración <code class="bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-xs font-mono">010_consolidacion.sql</code>.
              Sin ella no se puede comprobar si alguna función quedó fuera de norma.
            </p>
          </div>`:s.length?r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-rose-300 overflow-hidden">
            <div class="bg-rose-50 border-b border-rose-200 px-4 py-3">
              <p class="text-sm font-bold text-rose-800">
                <i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>${s.length} función${s.length===1?``:`es`} fuera de norma
              </p>
              <p class="text-xs text-rose-700 mt-1">
                Alguien redefinió una función fuera de la migración 010. Vuelve a ejecutarla para repararlo.
              </p>
            </div>
            <div class="divide-y divide-stone-200">
              ${s.map(e=>r`
                <div class="px-4 py-3">
                  <p class="text-sm font-bold text-stone-800 dark:text-stone-200 font-mono">${e.nombre}
                    <span class="stamp stamp-danger !rotate-0 !text-[9px] !py-0.5 !px-1.5 ml-1">${e.estado}</span>
                  </p>
                  <p class="text-xs text-stone-600 dark:text-stone-300 mt-1">${e.diagnostico}</p>
                </div>`)}
            </div>
          </div>`:r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 px-4 py-3 flex items-center gap-3">
            <i aria-hidden="true" class="fas fa-circle-check text-patrimonio-bosque text-lg"></i>
            <div>
              <p class="text-sm font-bold text-stone-800 dark:text-stone-200">Las ${i.length} funciones coinciden con la migración 010</p>
              <p class="text-xs text-stone-500 dark:text-stone-400">Ninguna perdió su nivel de acceso ni quedó duplicada.</p>
            </div>
          </div>`}

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${o(`Sin revisar`,t.sin_revisar??0,(t.sin_revisar??0)>0?`text-rose-700`:`text-stone-900 dark:text-stone-100`)}
          ${o(`Últimas 24 horas`,t.ultimas_24h??0,(t.ultimas_24h??0)>0?`text-amber-700`:`text-stone-900 dark:text-stone-100`)}
          ${o(`Total registrado`,t.total??0)}
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
            <p class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 leading-tight">${a(t.mas_reciente)}</p>
            <p class="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wide mt-1">Más reciente</p>
          </div>
        </div>

        ${(t.total??0)===0?r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-8 text-center">
            <i aria-hidden="true" class="fas fa-circle-check text-3xl text-patrimonio-bosque mb-3"></i>
            <p class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Sin fallos registrados</p>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              Desde que se activó el registro no se ha capturado ningún error. Si acabas de ejecutar la
              migración 009, esto es lo esperable: la bitácora empieza vacía.
            </p>
          </div>`:r`
          <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-hidden">
            <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Últimos fallos</h3>
                <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Nada de esto sale del proyecto: se guarda en tu propia base de datos. Los RUT, correos y
                  teléfonos se reemplazan antes de registrar.
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button id="marcar-todos-btn" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <i aria-hidden="true" class="fas fa-check-double mr-1"></i> Marcar revisados
                </button>
                <button id="purgar-errores-btn" class="btn-secundario border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <i aria-hidden="true" class="fas fa-broom mr-1"></i> Purgar antiguos
                </button>
              </div>
            </div>
            <div class="divide-y divide-stone-200 max-h-[32rem] overflow-y-auto">
              ${n.map(e=>r`
                <div class="px-4 py-3 ${e.visto?`opacity-60`:``}">
                  <div class="flex items-start justify-between gap-3 flex-wrap">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-stone-800 dark:text-stone-200 break-words">${e.mensaje}</p>
                      <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span class="stamp ${e.origen===`js`?`stamp-danger`:`stamp-info`} !rotate-0 !text-[9px] !py-0.5 !px-1.5">
                          ${e.origen===`js`?`fallo del navegador`:`operación`}
                        </span>
                        ${e.vista?r`<span class="stamp stamp-success !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-window-maximize"></i> ${e.vista}</span>`:``}
                        ${e.repeticiones>1?r`<span class="stamp stamp-danger !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-repeat"></i> ${e.repeticiones} veces</span>`:``}
                      </div>
                      <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                        ${a(e.ocurrido_en)}
                        ${e.usuario_email?` · `+e.usuario_email:``}
                        ${e.navegador?` · `+e.navegador:``}
                      </p>
                      ${e.detalle?r`
                        <details class="mt-1.5">
                          <summary class="text-[11px] text-patrimonio-lago cursor-pointer font-bold">Ver detalle técnico</summary>
                          <pre class="mt-1 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap text-stone-600 dark:text-stone-300">${e.detalle}</pre>
                        </details>`:``}
                    </div>
                    ${e.visto?``:r`
                      <button data-visto="${e.id}" class="btn-secundario shrink-0 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-lg text-[11px] font-bold" title="Marcar como revisado">
                        <i aria-hidden="true" class="fas fa-check"></i>
                      </button>`}
                  </div>
                </div>`)}
            </div>
          </div>`}

        <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">Qué se registra y qué no</h3>
          <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Se guarda el mensaje del fallo, la vista donde ocurrió, el correo de quien tenía la sesión y el
            navegador. <span class="font-bold">No</span> se guarda el contenido de la pantalla ni ningún dato de
            un lector: los RUT, correos y teléfonos que pudieran aparecer en un mensaje se reemplazan antes de
            enviarlo. Nada se transmite a un servicio externo, para no abrir una transferencia de datos
            personales que habría que declarar bajo la Ley 21.719.
          </p>
        </div>

      </div>`,e.querySelectorAll(`[data-visto]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{await K.marcarErrorVisto(Number(e.dataset.visto)),this.renderAdmin()}catch(t){this.showToast(t.message||`No se pudo marcar.`,`error`),e.disabled=!1}})}),document.getElementById(`marcar-todos-btn`)?.addEventListener(`click`,async()=>{try{await K.marcarErrorVisto(null),this.showToast(`Todos marcados como revisados.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo marcar.`,`error`)}}),document.getElementById(`purgar-errores-btn`)?.addEventListener(`click`,async()=>{if(await this.showConfirm(`Se borrarán los fallos de más de 90 días. El registro técnico no tiene por qué conservarse indefinidamente.`,{title:`Purgar registro`,confirmText:`Purgar`}))try{let e=await K.purgarErrores(90);this.showToast(`${e} registro${e===1?``:`s`} eliminado${e===1?``:`s`}.`,`success`),this.renderAdmin()}catch(e){this.showToast(e.message||`No se pudo purgar.`,`error`)}})}},Qe={async renderCatalog(){let e=this._container();if(!e)return;let t=this.param(`filas_por_pagina`),{libros:n,total:i}=await q.obtenerLibros(this.catalogSearch||``,this.bookPage,t);if(this.currentView!==`catalog`)return;if(n.length===0&&this.bookPage>0)return this.bookPage=Math.max(0,Math.ceil(i/t)-1),this.renderCatalog();e.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 mb-6">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Agregar libro</h3>
        </div>
        <form id="add-book-form" class="grid grid-cols-2 md:grid-cols-6 gap-3 p-5 items-end">
          <div class="col-span-2 md:col-span-1">
            <label for="new-book-isbn" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">ISBN</label>
            <input id="new-book-isbn" aria-label="ISBN del libro" placeholder="978..." class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          </div>
          <div class="col-span-2">
            <label for="new-book-title" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Título</label>
            <input id="new-book-title" aria-label="Título del libro" placeholder="Cien años de soledad" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          </div>
          <div class="col-span-2">
            <label for="new-book-author" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Autor</label>
            <input id="new-book-author" aria-label="Autor del libro" placeholder="Gabriel García Márquez" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          </div>
          <div>
            <label for="new-book-genre" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Género</label>
            <input id="new-book-genre" aria-label="Género del libro" placeholder="Opcional" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          </div>
          <div>
            <label for="new-book-location" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Ubicación</label>
            <input id="new-book-location" aria-label="Ubicación en la biblioteca" placeholder="Estante 3" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          </div>
          <div>
            <label for="new-book-qty" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Ejemplares</label>
            <input id="new-book-qty" aria-label="Cantidad de ejemplares" type="number" min="1" value="1" placeholder="1" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          </div>
          <button id="add-book-submit-btn" type="submit" class="btn-madera col-span-2 md:col-span-1 text-white font-sans font-medium rounded-xl shadow py-2 text-sm w-full h-[38px] flex items-center justify-center">Agregar</button>
        </form>
      </div>
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Catálogo de libros</h3>
          <div class="relative sm:w-64">
            <i aria-hidden="true" class="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400 text-xs"></i>
            <input id="catalog-search-input" aria-label="Buscar en el catálogo por título, autor o ISBN" type="text" placeholder="Buscar por título, autor o ISBN..." value="${this.catalogSearch||``}"
              class="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-1">
          <button class="catalog-filter-btn px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all ${!this.catalogFilter||this.catalogFilter===`todos`?`bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-md`:`bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700`}" data-filter="todos">Todos</button>
          <button class="catalog-filter-btn px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all ${this.catalogFilter===`disponibles`?`bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-900 shadow-md`:`bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700`}" data-filter="disponibles">En estante</button>
          <button class="catalog-filter-btn px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all ${this.catalogFilter===`prestados`?`bg-amber-600 text-white dark:bg-amber-500 dark:text-stone-900 shadow-md`:`bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700`}" data-filter="prestados">Agotados</button>
        </div>
      </div>
        <div id="catalog-tbody" class="flex flex-col gap-4 p-4">${this._renderBookRows(this._filtrarLibros(n))}</div>
        <div id="catalog-pagination">${s(this._paginacionHtml(this.bookPage,i,t,`catalog-page-btn`))}</div>
      </div>
    `,this._booksCache=n,document.getElementById(`add-book-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),!this.validateBookForm(!1))return;let t=document.getElementById(`add-book-submit-btn`),n=t.innerHTML;t.disabled=!0,t.innerHTML=`<i aria-hidden="true" class="fas fa-spinner fa-spin mr-1"></i> Guardando...`;try{let e=await q.agregarLibro({isbn:document.getElementById(`new-book-isbn`).value.trim(),titulo:document.getElementById(`new-book-title`).value.trim(),autor:document.getElementById(`new-book-author`).value.trim(),genero:document.getElementById(`new-book-genre`).value.trim(),ubicacion:document.getElementById(`new-book-location`).value.trim(),stock:Number(document.getElementById(`new-book-qty`).value||1)});this.showToast(e?.encolado?e.mensaje:`Libro agregado.`,e?.encolado?`info`:`success`),this.renderCatalog()}catch(e){this.showToast(e.message||`No se pudo agregar el libro.`,`error`)}finally{t&&(t.disabled=!1,t.innerHTML=n)}}),this._bindCatalogRowEvents(e),this._bindPaginacion(e,`.catalog-page-btn`,e=>{this.bookPage=e,this.renderCatalog()});let a=document.getElementById(`catalog-search-input`);a.addEventListener(`input`,()=>{clearTimeout(this._catalogSearchTimer),this._catalogSearchTimer=setTimeout(async()=>{this.catalogSearch=a.value.trim(),this.bookPage=0;let{libros:n,total:r}=await q.obtenerLibros(this.catalogSearch,0,t),i=document.getElementById(`catalog-tbody`);if(this.currentView!==`catalog`||!i)return;this._booksCache=n,i.innerHTML=this._renderBookRows(this._filtrarLibros(n)).toString();let o=document.getElementById(`catalog-pagination`);o&&(o.innerHTML=this._paginacionHtml(0,r,t,`catalog-page-btn`),this._bindPaginacion(e,`.catalog-page-btn`,e=>{this.bookPage=e,this.renderCatalog()})),this._bindCatalogRowEvents(e)},350)})},_filtrarLibros(e){let t=this.catalogFilter||`todos`;return t===`disponibles`?e.filter(e=>e.stock>0):t===`prestados`?e.filter(e=>e.stock===0):e},_renderBookRows(e){return e.length?r`${e.map((e,t)=>r`
      <div class="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-sm border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row gap-4 items-start md:items-center animate-fade-up" style="animation-delay: ${t*.05}s">
        
        <div class="flex items-start gap-4 flex-1 min-w-0">
          ${s(this._portadaHtml(e))}
          <div class="min-w-0">
            <h3 class="font-bold text-stone-900 dark:text-stone-100 text-lg truncate">${e.titulo}</h3>
            <p class="text-sm text-stone-500 dark:text-stone-400 truncate">${e.autor}</p>
            <div class="text-xs text-stone-400 dark:text-stone-500 mt-1 mb-2 font-mono">${e.isbn}</div>
            ${e.genero||e.ubicacion?r`
              <div class="flex flex-wrap gap-2">
                ${e.genero?r`<span class="stamp stamp-info !rotate-0 !text-[10px] !py-0.5 !px-2"><i aria-hidden="true" class="fas fa-tag mr-1"></i> ${e.genero}</span>`:``}
                ${e.ubicacion?r`<span class="stamp stamp-success !rotate-0 !text-[10px] !py-0.5 !px-2"><i aria-hidden="true" class="fas fa-location-dot mr-1"></i> ${e.ubicacion}</span>`:``}
              </div>`:``}
          </div>
        </div>

        <div class="flex flex-col md:items-end gap-3 shrink-0">
          <div class="text-center md:text-right">
            <span class="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-0.5">Disponibles</span>
            <span class="${e.stock===0?`text-rose-600`:e.stock<=1?`text-amber-600`:`text-emerald-600`} font-black text-xl">${e.stock}</span>
            <span class="text-stone-400 dark:text-stone-500 text-sm">/ ${e.copias_totales??e.stock}</span>
          </div>
          
          <div class="flex flex-wrap gap-2 justify-end">
            ${e.stock>0?r`<button class="loan-book-btn btn-secundario px-4 py-2 rounded-xl text-xs font-bold text-patrimonio-lago border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition" data-id="${e.id}"><i aria-hidden="true" class="fas fa-hand-holding-hand mr-1"></i> Prestar</button>`:r`<button class="reserve-book-btn btn-secundario px-4 py-2 rounded-xl text-xs font-bold text-patrimonio-lago border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition" data-id="${e.id}"><i aria-hidden="true" class="fas fa-bookmark mr-1"></i> Reservar</button>`}
            
            ${this.currentUserRole===`admin`?r`
              <button class="edit-book-btn px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-patrimonio-madera hover:bg-stone-100 dark:hover:bg-stone-700 transition" data-id="${e.id}"><i aria-hidden="true" class="fas fa-pen"></i></button>
              <button class="delete-book-btn px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition" data-id="${e.id}"><i aria-hidden="true" class="fas fa-trash"></i></button>`:``}
          </div>
        </div>

      </div>
    `)}`:r`<div class="px-4 py-6 text-center text-stone-500 dark:text-stone-400">Sin libros que coincidan con la búsqueda.</div>`},_bindCatalogRowEvents(e){e.querySelectorAll(`.delete-book-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Eliminar este libro? Esta acción no se puede deshacer.`,{title:`Eliminar libro`,confirmText:`Eliminar`}))try{await q.eliminarLibro(e.dataset.id),this.showToast(`Libro eliminado.`,`success`),this.renderCatalog()}catch(e){this.showToast(e.message||`No se pudo eliminar.`,`error`)}})}),e.querySelectorAll(`.loan-book-btn`).forEach(e=>{e.addEventListener(`click`,()=>this.promptCreateLoan(e.dataset.id))}),e.querySelectorAll(`.reserve-book-btn`).forEach(e=>{e.addEventListener(`click`,()=>this.promptCreateReserva(e.dataset.id))}),e.querySelectorAll(`.edit-book-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=(this._booksCache||[]).find(t=>String(t.id)===String(e.dataset.id));t&&this.showEditBookModal(t)})})},showEditBookModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let n=(e,t,n,i=``)=>r`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">${t}</label>
        <input id="${e}" value="${n??``}" ${s(i)}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;t.innerHTML=r`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Editar libro</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${n(`edit-book-title`,`Título`,e.titulo)}
          ${n(`edit-book-author`,`Autor`,e.autor)}
          ${n(`edit-book-isbn`,`ISBN`,e.isbn)}
          ${n(`edit-book-qty`,`Ejemplares en total`,e.copias_totales??e.stock,`type="number" min="0"`)}
          ${n(`edit-book-genre`,`Género`,e.genero)}
          ${n(`edit-book-location`,`Ubicación`,e.ubicacion)}
        </div>
        <p class="text-[11px] text-stone-500 dark:text-stone-400 -mt-1">
          Escribe cuántos ejemplares tiene la biblioteca en total. El sistema calcula solo cuántos están
          disponibles según los préstamos activos${(e.copias_totales??e.stock)-(e.stock??0)>0?r` (ahora hay ${(e.copias_totales??e.stock)-(e.stock??0)} prestado(s))`:``}.
        </p>
        <div>
          ${n(`edit-book-plazo`,`Plazo de préstamo propio (días, opcional)`,e.dias_prestamo_override,`type="number" min="0" placeholder="Usa el plazo general"`)}
          <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Déjalo vacío para usar el plazo general del sistema. Escribe <span class="font-mono">0</span> para
            material de referencia que no circula (no se puede prestar). Cualquier otro número reemplaza el
            plazo general solo para este libro.
          </p>
        </div>
        ${n(`edit-book-cover`,`URL de portada (opcional)`,e.portada_url,`placeholder="https://..."`)}
        <p class="text-[11px] text-stone-500 dark:text-stone-400">Usa este campo para las obras locales y patrimoniales, que no aparecen en catálogos internacionales.</p>
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Guardar cambios</button>
        </div>
      </div>`.toString(),document.body.appendChild(t);let i=this._prepararModal(t);t.querySelector(`[data-action="cancel"]`).addEventListener(`click`,i),t.addEventListener(`click`,e=>{e.target===t&&i()}),t.querySelector(`[data-action="save"]`).addEventListener(`click`,async t=>{if(!this.validateBookForm(!0))return;let n=t.currentTarget;n.disabled=!0;try{let t=document.getElementById(`edit-book-plazo`).value.trim();await q.actualizarLibro(e.id,{titulo:document.getElementById(`edit-book-title`).value.trim(),autor:document.getElementById(`edit-book-author`).value.trim(),isbn:document.getElementById(`edit-book-isbn`).value.trim(),genero:document.getElementById(`edit-book-genre`).value.trim(),ubicacion:document.getElementById(`edit-book-location`).value.trim(),portada_url:document.getElementById(`edit-book-cover`).value.trim(),diasPrestamoOverride:t===``?null:Number(t)});let n=Number(document.getElementById(`edit-book-qty`).value||0);n!==(e.copias_totales??e.stock)&&await q.ajustarCopias(e.id,n),i(),this.showToast(`Libro actualizado.`,`success`),this.renderCatalog()}catch(e){this.showToast(e.message||`No se pudo guardar.`,`error`),n.disabled=!1}})},async promptCreateLoan(e){await this.flujoPrestamo(e,()=>{this.currentView===`catalog`&&this.renderCatalog()})},async promptCreateReserva(e){await this.flujoReserva(e,()=>{this.currentView===`catalog`&&this.renderCatalog()})}},$e={_renderUserRows(e){return e.length?r`${e.map(e=>r`
      <tr class="border-t border-stone-200 dark:border-stone-700">
        <td class="px-4 py-3 font-bold text-stone-800 dark:text-stone-200">${e.nombre}</td>
        <td class="px-4 py-3 text-stone-600 dark:text-stone-300 font-mono">${e.rut}</td>
        <td class="px-4 py-3 text-stone-600 dark:text-stone-300">
          <div>${e.email||`—`}</div>
          <div class="text-xs text-stone-500 dark:text-stone-400">${e.telefono||`—`}</div>
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
          <button class="edit-user-btn text-stone-500 dark:text-stone-400 hover:text-patrimonio-madera font-bold" data-id="${e.id}">Editar</button>
          ${this.currentUserRole===`admin`?r`<button class="delete-user-btn text-rose-700 font-bold" data-id="${e.id}">Eliminar</button>`:``}
        </td>
      </tr>
    `)}`:r`<tr><td colspan="4" class="px-4 py-6 text-center text-stone-500 dark:text-stone-400">${this.userSearch?`Ningún lector coincide con la búsqueda.`:`Sin lectores registrados. Agrega el primero con el formulario de arriba.`}</td></tr>`},_bindUserRowEvents(e){e.querySelectorAll(`.delete-user-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(await this.showConfirm(`¿Eliminar este usuario? Esta acción no se puede deshacer.`,{title:`Eliminar lector`,confirmText:`Eliminar`}))try{await Y.eliminarLector(e.dataset.id),this.showToast(`Usuario eliminado.`,`success`),this.renderUsers()}catch(e){this.showToast(e.message||`No se pudo eliminar.`,`error`)}})}),e.querySelectorAll(`.edit-user-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=(this._usersCache||[]).find(t=>String(t.id)===String(e.dataset.id));t&&this.showEditUserModal(t)})})},async renderUsers(e=!1){let t=this._container();if(!t)return;let n=this.param(`filas_por_pagina`),{lectores:i,total:a}=await Y.obtenerLectores(this.userSearch||``,this.userPage,n);if(this.currentView!==`users`)return;if(i.length===0&&this.userPage>0)return this.userPage=Math.max(0,Math.ceil(a/n)-1),this.renderUsers(e);if(this._usersCache=i,e){let e=t.querySelector(`#users-tbody`);if(e){e.innerHTML=this._renderUserRows(i).toString();let r=t.querySelector(`#users-pagination`);r&&(r.innerHTML=this._paginacionHtml(this.userPage,a,n,`user-page-btn`)),this._bindUserRowEvents(t),this._bindPaginacion(t,`.user-page-btn`,e=>{this.userPage=e,this.renderUsers(!0)})}return}t.innerHTML=r`
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 mb-6">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Agregar lector</h3>
        </div>
        <form id="add-user-form" class="p-5">
          <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">Todos los datos son obligatorios. El correo y el teléfono se usan para avisar cuando un préstamo está por vencer.</p>          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="new-user-name" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Nombre completo</label>
              <input id="new-user-name" required placeholder="María Antileo Huenchumán" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
            <div>
              <label for="new-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">RUT</label>
              <input id="new-user-id" required placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm font-mono" />
            </div>
            <div>
              <label for="new-user-phone" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Teléfono</label>
              <input id="new-user-phone" required type="tel" placeholder="9 1234 5678" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
            <div>
              <label for="new-user-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Correo</label>
              <input id="new-user-email" required type="email" placeholder="nombre@correo.cl" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
          </div>
          <div class="mt-4">${s(this._bloqueConsentimiento(`new`))}</div>
          <button id="add-user-submit-btn" type="submit" class="btn-madera mt-4 w-full md:w-auto md:px-8 text-white font-sans font-medium rounded-xl shadow py-2.5 text-sm h-[40px] flex items-center justify-center">Agregar lector</button>
        </form>
      </div>
      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Lectores registrados</h3>
          <div class="relative sm:w-64">
            <i aria-hidden="true" class="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400 text-xs"></i>
            <input id="user-search-input" aria-label="Buscar lector por nombre, RUT o correo" type="text" placeholder="Buscar por nombre, RUT o correo..." value="${this.userSearch||``}"
              class="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        <div id="users-tbody" class="flex flex-col gap-4 p-4">${this._renderUserRows(i)}</div>
        <div id="users-pagination">${s(this._paginacionHtml(this.userPage,a,n,`user-page-btn`))}</div>
      </div>
    `;let o=document.getElementById(`new-user-id`);o&&o.addEventListener(`input`,()=>{let e=o.value;if(/^[0-9kK\-\.]+$/.test(e)){let t=e.replace(/[.\-\s]/g,``).toUpperCase();t.length>1&&(o.value=`${t.slice(0,-1)}-${t.slice(-1)}`)}}),document.getElementById(`add-user-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),!this.validateUserForm(!1))return;let t=document.getElementById(`add-user-submit-btn`),n=t.innerHTML;t.disabled=!0,t.innerHTML=`<i aria-hidden="true" class="fas fa-spinner fa-spin mr-1"></i> Guardando...`;try{let e=this._datosConsentimiento(`new`);if(!e)return;let t=await Y.agregarLector({rut:this.formatRut(document.getElementById(`new-user-id`).value),nombre:document.getElementById(`new-user-name`).value.trim(),email:document.getElementById(`new-user-email`).value.trim().toLowerCase(),telefono:this.formatPhone(document.getElementById(`new-user-phone`).value),...e});this.showToast(t?.encolado?t.mensaje:`Lector agregado.`,t?.encolado?`info`:`success`),this.renderUsers()}catch(e){this.showToast(e.message||`No se pudo agregar el lector.`,`error`)}finally{t&&(t.disabled=!1,t.innerHTML=n)}}),this._bindUserRowEvents(t),this._bindConsentimiento(`new`),this._bindPaginacion(t,`.user-page-btn`,e=>{this.userPage=e,this.renderUsers(!0)});let c=document.getElementById(`user-search-input`);c.addEventListener(`input`,()=>{clearTimeout(this._userSearchTimer),this._userSearchTimer=setTimeout(()=>{this.userSearch=c.value.trim(),this.userPage=0,this.renderUsers(!0)},350)})},showEditUserModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let n=(e,t,n,i=``)=>r`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">${t}</label>
        <input id="${e}" value="${n??``}" ${s(i)}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`,i=this.currentUserRole===`admin`;t.innerHTML=r`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Editar lector</h3>
        <div class="space-y-3">
          ${n(`edit-user-name`,`Nombre completo`,e.nombre)}
          ${i?n(`edit-user-id`,`RUT`,e.rut):r`<div>
                 <label for="edit-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">RUT</label>
                 <input id="edit-user-id" value="${e.rut??``}" readonly
                   class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-800/50 text-sm font-mono text-stone-500 dark:text-stone-400" />
                 <p class="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Solo un administrador puede corregir un RUT. Si detectas un error, contacta al encargado de la biblioteca.</p>
               </div>`}
          ${n(`edit-user-phone`,`Teléfono`,e.telefono,`type="tel"`)}
          ${n(`edit-user-email`,`Correo`,e.email,`type="email"`)}
        </div>
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Guardar cambios</button>
        </div>
      </div>`.toString(),document.body.appendChild(t);let a=this._prepararModal(t);if(t.querySelector(`[data-action="cancel"]`).addEventListener(`click`,a),t.addEventListener(`click`,e=>{e.target===t&&a()}),i){let e=t.querySelector(`#edit-user-id`);e&&e.addEventListener(`input`,()=>{let t=e.value;if(/^[0-9kK\-\.]+$/.test(t)){let n=t.replace(/[.\-\s]/g,``).toUpperCase();n.length>1&&(e.value=`${n.slice(0,-1)}-${n.slice(-1)}`)}})}t.querySelector(`[data-action="save"]`).addEventListener(`click`,async t=>{if(!this.validateUserForm(!0))return;let n=t.currentTarget;n.disabled=!0;try{let t={nombre:document.getElementById(`edit-user-name`).value.trim(),email:document.getElementById(`edit-user-email`).value.trim().toLowerCase(),telefono:this.formatPhone(document.getElementById(`edit-user-phone`).value)};i?await Y.actualizarLector(e.id,{...t,rut:this.formatRut(document.getElementById(`edit-user-id`).value)}):await Y.actualizarContactoLector(e.id,t),a(),this.showToast(`Lector actualizado.`,`success`),this.renderUsers()}catch(e){this.showToast(e.message||`No se pudo guardar.`,`error`),n.disabled=!1}})}},et={async renderLoans(){let e=this._container();if(!e)return;let t=this.loanFilter||`todos`,n=this.param(`filas_por_pagina`),i=this.param(`dias_aviso_previo`),{prestamos:a,total:o,conteos:c}=await H.obtenerPrestamos(t,this.loanPage,n,i);if(this.currentView!==`loans`)return;if(a.length===0&&this.loanPage>0)return this.loanPage=Math.max(0,Math.ceil(o/n)-1),this.renderLoans();this._loansCache=a,this._actualizarBadgeAtrasados&&this._actualizarBadgeAtrasados();let l=c.vencidos+c.porVencer,u=(e,n,i,a)=>r`
      <button data-filter="${e}" class="loan-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold border transition ${t===e?`bg-patrimonio-lago text-white border-patrimonio-lago`:`bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:border-patrimonio-lago`}">
        ${n} <span class="${t===e?`text-white/70`:a}">${i}</span>
      </button>`;e.innerHTML=r`
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-2">
          ${u(`todos`,`Todos`,c.todos,`text-stone-500 dark:text-stone-400`)}
          ${u(`vencidos`,`Atrasados`,c.vencidos,`text-rose-700`)}
          ${u(`porVencer`,`Por vencer`,c.porVencer,`text-amber-700`)}
        </div>
        <button id="notify-all-btn" ${l===0?`disabled`:``}
          class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <i aria-hidden="true" class="fas fa-bell mr-1.5"></i> Avisar a los pendientes (${l})
        </button>
      </div>

      <div class="catalog-card bg-patrimonio-card dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-300 dark:border-stone-600 overflow-x-auto">
        <div class="catalog-card-header flex items-center justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Préstamos activos</h3>
          <span class="text-[11px] text-stone-500 dark:text-stone-400"><i aria-hidden="true" class="fas fa-circle-info mr-1"></i>Máx. ${this.param(`max_prestamos_por_lector`)} por lector</span>
        </div>
        <div class="flex flex-col gap-4 p-4">
            <div id="prestamos-tbody" class="flex flex-col gap-4">
            ${a.length?a.map((e,t)=>{let n=this._estadoPrestamo(e.fecha_devolucion_esperada),i=!e.lectores?.email&&this.formatPhone(e.lectores?.telefono).length<11,a=n.clave===`vencido`?`text-rose-700 font-bold`:n.clave===`porVencer`?`text-amber-700 font-bold`:`text-stone-600 dark:text-stone-300`;return r`
              <div class="bg-white dark:bg-stone-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition gap-4 animate-fade-up" style="animation-delay: ${t*.05}s">
                  <div class="flex flex-col sm:flex-row gap-4 sm:items-center flex-1">
                    <div class="flex-1">
                      <div class="font-bold text-lg text-stone-800 dark:text-stone-200 leading-tight mb-1">${e.libros?.titulo}</div>
                      <div class="text-sm text-stone-500 dark:text-stone-400 font-medium"><i aria-hidden="true" class="fas fa-user mr-1.5 text-stone-400"></i>${e.lectores?.nombre} <span class="text-xs font-mono ml-1 text-stone-400">(${e.lectores?.rut||`Sin RUT`})</span></div>
                    </div>
                    <div class="flex flex-col sm:items-end gap-1 shrink-0">
                      <div class="text-sm font-bold ${a}">${this._fechaLegible(e.fecha_devolucion_esperada)}</div>
                      <div class="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 ${a}">${n.etiqueta}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-stone-100 dark:border-stone-800 pt-3 sm:pt-0 sm:pl-4 shrink-0">
                    ${i?r`<button class="btn-secundario w-8 h-8 flex items-center justify-center rounded bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed" disabled title="Lector sin correo ni teléfono"><i aria-hidden="true" class="fas fa-bell-slash"></i></button>`:r`<button class="notify-loan-btn btn-secundario w-8 h-8 flex items-center justify-center rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition" data-id="${e.id}" title="Avisar al lector"><i aria-hidden="true" class="fas fa-bell"></i></button>`}
                    ${n.renovable?r`<button class="renew-loan-btn btn-secundario w-8 h-8 flex items-center justify-center rounded bg-patrimonio-lago/10 text-patrimonio-lago dark:text-patrimonio-lago hover:bg-patrimonio-lago/20 transition" data-id="${e.id}" title="Renovar préstamo"><i aria-hidden="true" class="fas fa-rotate-right"></i></button>`:``}
                    <button class="return-loan-btn text-xs bg-patrimonio-madera text-white px-4 py-1.5 rounded-lg hover:bg-[#a67c52] transition font-bold" data-id="${e.id}">Devuelto</button>
                  </div>
                </div>
            `}):r`<tr><td colspan="4" class="px-4 py-8 text-center text-stone-500 dark:text-stone-400">${t===`vencidos`?`No hay préstamos atrasados.`:t===`porVencer`?`No hay préstamos por vencer.`:`No hay préstamos activos.`}</td></tr>`}
          </tbody>
        </table>
        <div id="loans-pagination">${s(this._paginacionHtml(this.loanPage,o,n,`loan-page-btn`))}</div>
      </div>
    `.toString(),this._bindPaginacion(e,`.loan-page-btn`,e=>{this.loanPage=e,this.renderLoans()}),e.querySelectorAll(`.loan-filter-btn`).forEach(e=>{e.addEventListener(`click`,()=>{this.loanFilter=e.dataset.filter,this.loanPage=0,this.renderLoans()})}),e.querySelectorAll(`.notify-loan-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=this._loansCache.find(t=>String(t.id)===String(e.dataset.id));t&&this.showNotifyModal(t)})}),document.getElementById(`notify-all-btn`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0;try{let e=await H.obtenerPendientesDeAviso(i);this.showBulkNotifyModal(e)}catch(e){this.showToast(e.message||`No se pudo cargar la lista de avisos.`,`error`)}finally{t.disabled=!1}}),e.querySelectorAll(`.renew-loan-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await H.renovarPrestamo(e.dataset.id);if(t?.encolado)this.showToast(t.mensaje,`info`);else{let e=t?.nueva_fecha?this._fechaLegible(t.nueva_fecha):`la nueva fecha`;this.showToast(`Préstamo renovado hasta el ${e}.`,`success`)}this.renderLoans()}catch(t){this.showToast(t.message||`No se pudo renovar.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`.return-loan-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{try{let t=await H.devolverPrestamo(e.dataset.id);t?.encolado?this.showToast(t.mensaje,`info`):this.showToast(`Préstamo devuelto.`,`success`),this.renderLoans()}catch(e){this.showToast(e.message||`No se pudo registrar la devolución.`,`error`)}})})},showGeneralNotifyModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,t.innerHTML=r`
        <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
          <div class="p-6 pb-4">
            <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Aviso Cierre General</h3>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">${e.length} ${e.length===1?`lector`:`lectores`} con libros en su poder. Solicita devoluci�n masiva por cierre o vacaciones.</p>
          </div>
          <div class="overflow-y-auto px-6 divide-y divide-stone-200 border-t border-stone-200 dark:border-stone-700">
            ${e.map(e=>{let t=e.lectores?.telefono,n=e.lectores?.nombre||`Lector`,i=e.libros?.titulo||`un libro`,a=`Estimado/a ${n}, le recordamos que por cierre de semestre o vacaciones debe devolver el libro "${i}" a la biblioteca lo antes posible. �Gracias!`,o=encodeURIComponent(a),s=t?`https://wa.me/${this.formatPhone(t)}?text=${o}`:``;return r`
                <div class="py-3 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-stone-800 dark:text-stone-200 truncate">${n}</p>
                    <p class="text-xs text-stone-500 dark:text-stone-400 truncate" title="${i}">${i}</p>
                  </div>
                  ${t?r`<a href="${s}" target="_blank" rel="noopener noreferrer" class="btn-secundario shrink-0 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"><i aria-hidden="true" class="fab fa-whatsapp text-emerald-600 mr-1"></i> WhatsApp</a>`:r`<span class="text-[10px] text-stone-400 font-bold uppercase tracking-widest shrink-0">Sin tel.</span>`}
                </div>
              `}).join(``)}
          </div>
          <div class="p-4 border-t border-stone-200 dark:border-stone-700 text-right bg-stone-50 dark:bg-stone-800/50 rounded-b-2xl shrink-0">
            <button data-action="cerrar" class="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200">Cerrar</button>
          </div>
        </div>
      `.toString(),document.body.appendChild(t);let n=()=>t.remove();t.querySelector(`[data-action="cerrar"]`).addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()})},showBulkNotifyModal(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,t.innerHTML=r`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
        <div class="p-6 pb-4">
          <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Avisos pendientes</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">${e.length} ${e.length===1?`lector`:`lectores`} con devoluciones atrasadas o próximas. Envía los avisos uno por uno.</p>
        </div>
        <div class="overflow-y-auto px-6 divide-y divide-stone-200 border-t border-stone-200 dark:border-stone-700">
          ${e.map(e=>{let t=this._estadoPrestamo(e.fecha_devolucion_esperada);return r`
            <div class="py-3 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-stone-800 dark:text-stone-200 text-sm truncate">${e.lectores?.nombre}</p>
                <p class="text-xs text-stone-500 dark:text-stone-400 truncate">${e.libros?.titulo}</p>
                <p class="text-[11px] font-bold ${t.clave===`vencido`?`text-rose-700`:`text-amber-700`}">${t.etiqueta}</p>
              </div>
              <button data-notify-id="${e.id}" class="btn-secundario shrink-0 bg-patrimonio-madera text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-bell mr-1"></i> Avisar
              </button>
            </div>`})}
        </div>
        <div class="p-6 pt-4 flex justify-end border-t border-stone-200 dark:border-stone-700">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cerrar</button>
        </div>
      </div>
    `.toString(),document.body.appendChild(t);let n=this._prepararModal(t);t.querySelector(`[data-action="close"]`).addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()}),t.querySelectorAll(`[data-notify-id]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=e.find(e=>String(e.id)===String(t.dataset.notifyId));n&&this.showNotifyModal(n)})})},async _seleccionarLectorModal(e){return new Promise(t=>{let n=document.createElement(`div`);n.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,n.innerHTML=`
        <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">${escapeHtml(e)}</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400">Busca al lector por nombre o RUT. O escribe un RUT nuevo para registrarlo.</p>
          <div class="relative">
            <i aria-hidden="true" class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400"></i>
            <input id="lector-search-input" autocomplete="off" class="w-full pl-9 pr-3 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-1 focus:ring-patrimonio-lago focus:border-patrimonio-lago text-sm" placeholder="Ej: María Pérez o 12345678-5">
          </div>
          <div id="lector-search-results" class="max-h-48 overflow-y-auto space-y-1 mt-2"></div>
          <div class="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-700 mt-4">
            <button id="lector-search-cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
            <button id="lector-search-confirm" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium" disabled>Continuar</button>
          </div>
        </div>
      `,document.body.appendChild(n);let r=n.querySelector(`#lector-search-input`),i=n.querySelector(`#lector-search-results`),a=n.querySelector(`#lector-search-confirm`),o,s=null,c=()=>{n.remove(),t(null)},l=(e,t)=>{s=e,r.value=e,i.innerHTML=`
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-sm">
            <i aria-hidden="true" class="fas fa-check-circle mr-1.5"></i> ${escapeHtml(t)}
          </div>`,a.disabled=!1,a.focus()};n.querySelector(`#lector-search-cancel`).addEventListener(`click`,c),n.addEventListener(`click`,e=>{e.target===n&&c()}),a.addEventListener(`click`,()=>{let e=s||r.value.trim();n.remove(),t(e)}),r.addEventListener(`input`,()=>{let e=r.value;if(/^[0-9kK\-\.]+$/.test(e)){let t=e.replace(/[.\-\s]/g,``).toUpperCase();t.length>1&&(r.value=`${t.slice(0,-1)}-${t.slice(-1)}`)}a.disabled=!r.value.trim(),s=null,clearTimeout(o);let t=r.value.trim();if(t.length<2){i.innerHTML=``;return}o=setTimeout(async()=>{i.innerHTML=`<p class="text-xs text-stone-500 dark:text-stone-400 p-2"><i aria-hidden="true" class="fas fa-spinner fa-spin mr-1"></i> Buscando...</p>`;try{let e=await Y.obtenerLectores(t,0,5);e.lectores.length===0?i.innerHTML=`<p class="text-xs text-stone-500 dark:text-stone-400 p-2">Ningún lector coincide. Escriba el RUT completo para registrarlo como nuevo.</p>`:(i.innerHTML=e.lectores.map(e=>`
                <button type="button" data-rut="${e.rut}" data-nombre="${escapeHtml(e.nombre)}" class="w-full text-left px-3 py-2 rounded-lg border border-transparent hover:bg-stone-50 dark:bg-stone-800/50 hover:border-stone-200 dark:border-stone-700 focus:bg-stone-50 dark:bg-stone-800/50 focus:border-stone-200 dark:border-stone-700 focus:outline-none transition-colors">
                  <p class="text-sm font-medium text-stone-800 dark:text-stone-200">${escapeHtml(e.nombre)}</p>
                  <p class="text-[11px] font-mono text-stone-500 dark:text-stone-400">${e.rut}</p>
                </button>
              `).join(``),i.querySelectorAll(`button`).forEach(e=>{e.addEventListener(`click`,()=>l(e.dataset.rut,e.dataset.nombre))}))}catch{i.innerHTML=`<p class="text-xs text-rose-500 p-2">Error al buscar.</p>`}},350)}),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&!a.disabled&&a.click()}),setTimeout(()=>r.focus(),100)})},async flujoPrestamo(e,t){let n=await this._seleccionarLectorModal(`Prestar libro`);if(!n)return;if(!this.isValidRut(n)){this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`);return}let r;try{r=await Y.estadoLector(this.formatRut(n))}catch(e){this.showToast(e.message||`No se pudo consultar el lector.`,`error`);return}this.showConfirmarPrestamoModal(e,this.formatRut(n),r,t)},showConfirmarPrestamoModal(e,t,n,i){let a=document.createElement(`div`);a.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let o,s;n.existe?n.puede_prestar?(o=r`
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>${n.nombre}</p>
          <p class="text-sm text-emerald-700 mt-0.5">Puede llevar este libro.</p>
        </div>
        ${this._resumenLector(n)}`,s=r`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
        <button data-action="prestar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Confirmar préstamo</button>`):(o=r`
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p class="font-bold text-rose-800 mb-1"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>No se puede prestar</p>
          <p class="text-sm text-rose-700">${n.motivo_rechazo||`El lector está impedido de pedir libros.`}</p>
        </div>
        ${this._resumenLector(n)}`,s=r`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cerrar</button>
        <button data-action="ver-prestamos" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">Ver sus préstamos</button>`):(o=r`
        <div class="bg-patrimonio-lago/5 border border-patrimonio-lago/20 rounded-xl p-4 text-center">
          <i aria-hidden="true" class="fas fa-user-plus text-2xl text-patrimonio-lago mb-2"></i>
          <p class="font-bold text-stone-800 dark:text-stone-200">Lector nuevo</p>
          <p class="text-sm text-stone-600 dark:text-stone-300 mt-1">El RUT <span class="font-mono font-bold">${t}</span> no está registrado.</p>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-2">Regístralo para poder prestarle libros.</p>
        </div>`,s=r`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
        <button data-action="registrar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar lector</button>`),a.innerHTML=r`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Situación del lector</h3>
        ${o}
        <div class="flex justify-end gap-3 pt-1 flex-wrap">${s}</div>
      </div>`.toString(),document.body.appendChild(a);let c=this._prepararModal(a);a.querySelector(`[data-action="cancel"]`).addEventListener(`click`,c),a.addEventListener(`click`,e=>{e.target===a&&c()}),a.querySelector(`[data-action="prestar"]`)?.addEventListener(`click`,async n=>{let r=n.currentTarget;r.disabled=!0;try{let n=await H.registrarPrestamo(e,t);c(),n?.encolado?this.showToast(n.mensaje,`info`):this.showToast(`Préstamo registrado.`,`success`),i?.()}catch(e){this.showToast(e.message||`No se pudo registrar el préstamo.`,`error`),r.disabled=!1}}),a.querySelector(`[data-action="registrar"]`)?.addEventListener(`click`,()=>{c(),this.showNuevoLectorModal(t,async()=>{let n=await Y.estadoLector(t);this.showConfirmarPrestamoModal(e,t,n,i)})}),a.querySelector(`[data-action="ver-prestamos"]`)?.addEventListener(`click`,()=>{c(),this.loanFilter=`vencidos`,this.switchView(`loans`)})},_resumenLector(e){let t=(e,t,n=`text-stone-900 dark:text-stone-100`)=>r`
      <div class="text-center">
        <p class="font-serif font-bold text-2xl ${n}">${t}</p>
        <p class="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-0.5">${e}</p>
      </div>`;return r`
      <div class="grid grid-cols-3 gap-2 border border-stone-200 dark:border-stone-700 rounded-xl py-3">
        ${t(`Activos`,e.prestamos_activos??0)}
        ${t(`Atrasados`,e.prestamos_atrasados??0,(e.prestamos_atrasados??0)>0?`text-rose-700`:`text-stone-900 dark:text-stone-100`)}
        ${t(`Máximo`,this.param(`max_prestamos_por_lector`))}
      </div>
      ${e.email||e.telefono?r`
        <p class="text-[11px] text-stone-500 dark:text-stone-400 text-center">
          ${e.email?e.email:``}${e.email&&e.telefono?` · `:``}${e.telefono?e.telefono:``}
        </p>`:``}`},showNuevoLectorModal(e,t){let n=document.createElement(`div`);n.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,n.innerHTML=r`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Registrar lector nuevo</h3>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Todos los datos son obligatorios.</p>
        </div>
        <div class="space-y-3">
          <div>
            <label for="new-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">RUT</label>
            <input id="new-user-id" value="${e}" readonly
              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-800/50 text-sm font-mono text-stone-600 dark:text-stone-300" />
          </div>
          <div>
            <label for="new-user-name" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Nombre completo</label>
            <input id="new-user-name" placeholder="María Antileo Huenchumán"
              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="new-user-phone" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Teléfono</label>
            <input id="new-user-phone" type="tel" placeholder="9 1234 5678"
              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="new-user-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">Correo</label>
            <input id="new-user-email" type="email" placeholder="nombre@correo.cl"
              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        ${s(this._bloqueConsentimiento(`new`))}
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar y continuar</button>
        </div>
      </div>`.toString(),document.body.appendChild(n);let i=this._prepararModal(n);n.querySelector(`[data-action="cancel"]`).addEventListener(`click`,i),this._bindConsentimiento(`new`),setTimeout(()=>document.getElementById(`new-user-name`)?.focus(),20),n.querySelector(`[data-action="save"]`).addEventListener(`click`,async e=>{if(!this.validateUserForm(!1))return;let n=e.currentTarget;n.disabled=!0;try{let e=this._datosConsentimiento(`new`);if(!e){n.disabled=!1;return}let r=await Y.agregarLector({rut:this.formatRut(document.getElementById(`new-user-id`).value),nombre:document.getElementById(`new-user-name`).value.trim(),email:document.getElementById(`new-user-email`).value.trim().toLowerCase(),telefono:this.formatPhone(document.getElementById(`new-user-phone`).value),...e});i(),this.showToast(r?.encolado?r.mensaje:`Lector registrado.`,r?.encolado?`info`:`success`),await t?.()}catch(e){this.showToast(e.message||`No se pudo registrar el lector.`,`error`),n.disabled=!1}})},async flujoReserva(e,t){let n=await this._seleccionarLectorModal(`Reservar libro`);if(!n)return;if(!this.isValidRut(n)){this.showToast(`El RUT no es válido. Revisa el dígito verificador.`,`error`);return}let r;try{r=await Y.estadoLector(this.formatRut(n))}catch(e){this.showToast(e.message||`No se pudo consultar el lector.`,`error`);return}this.showConfirmarReservaModal(e,this.formatRut(n),r,t)},showConfirmarReservaModal(e,t,n,i){let a=document.createElement(`div`);a.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`;let o,s;n.existe?n.puede_prestar?(o=r`
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>${n.nombre}</p>
          <p class="text-sm text-emerald-700 mt-0.5">Se puede poner en la fila de espera de este libro.</p>
        </div>
        ${this._resumenLector(n)}`,s=r`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
        <button data-action="reservar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Confirmar reserva</button>`):(o=r`
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p class="font-bold text-rose-800 mb-1"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>No se puede reservar</p>
          <p class="text-sm text-rose-700">${n.motivo_rechazo||`El lector está impedido de pedir libros.`}</p>
        </div>
        ${this._resumenLector(n)}`,s=r`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cerrar</button>
        <button data-action="ver-prestamos" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">Ver sus préstamos</button>`):(o=r`
        <div class="bg-patrimonio-lago/5 border border-patrimonio-lago/20 rounded-xl p-4 text-center">
          <i aria-hidden="true" class="fas fa-user-plus text-2xl text-patrimonio-lago mb-2"></i>
          <p class="font-bold text-stone-800 dark:text-stone-200">Lector nuevo</p>
          <p class="text-sm text-stone-600 dark:text-stone-300 mt-1">El RUT <span class="font-mono font-bold">${t}</span> no está registrado.</p>
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-2">Regístralo para poder reservarle un libro.</p>
        </div>`,s=r`
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cancelar</button>
        <button data-action="registrar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar lector</button>`),a.innerHTML=r`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Situación del lector</h3>
        ${o}
        <div class="flex justify-end gap-3 pt-1 flex-wrap">${s}</div>
      </div>`.toString(),document.body.appendChild(a);let c=this._prepararModal(a);a.querySelector(`[data-action="cancel"]`).addEventListener(`click`,c),a.addEventListener(`click`,e=>{e.target===a&&c()}),a.querySelector(`[data-action="reservar"]`)?.addEventListener(`click`,async n=>{let r=n.currentTarget;r.disabled=!0;try{let n=await J.reservarLibro(e,t);if(c(),n?.encolado)this.showToast(n.mensaje,`info`);else{let e=n?.posicion_en_fila;this.showToast(e?`Reserva registrada: posición ${e} en la fila de espera.`:`Reserva registrada.`,`success`)}i?.()}catch(e){this.showToast(e.message||`No se pudo registrar la reserva.`,`error`),r.disabled=!1}}),a.querySelector(`[data-action="registrar"]`)?.addEventListener(`click`,()=>{c(),this.showNuevoLectorModal(t,async()=>{let n=await Y.estadoLector(t);this.showConfirmarReservaModal(e,t,n,i)})}),a.querySelector(`[data-action="ver-prestamos"]`)?.addEventListener(`click`,()=>{c(),this.loanFilter=`vencidos`,this.switchView(`loans`)})},async showLectorModal(e){try{let t=await Y.estadoLector(e),n=document.createElement(`div`);n.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,n.innerHTML=r`
        <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">${t.nombre||`Lector`}</h3>
            <p class="text-xs font-mono text-stone-500 dark:text-stone-400">${t.rut||e}</p>
          </div>
          ${t.puede_prestar?r`
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p class="text-sm text-emerald-700"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Puede pedir libros prestados.</p>
            </div>`:r`
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <p class="text-sm text-rose-700"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>${t.motivo_rechazo||``}</p>
            </div>`}
          ${this._resumenLector(t)}
          <div class="flex justify-end pt-1">
            <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:bg-stone-700">Cerrar</button>
          </div>
        </div>`.toString(),document.body.appendChild(n);let i=this._prepararModal(n);n.querySelector(`[data-action="close"]`).addEventListener(`click`,i),n.addEventListener(`click`,e=>{e.target===n&&i()})}catch(e){this.showToast(e.message||`No se pudo consultar el lector.`,`error`)}}},tt=`modulepreload`,nt=function(e){return`/`+e},rt={},X=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=nt(t,n),t=s(t),t in rt)return;rt[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:tt,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Z={async crearEnlaceEscaneo(e){return z.crearEnlaceEscaneo(e)},async revocarEnlaceEscaneo(e){return z.revocarEnlaceEscaneo(e)},async escucharEscaneos(e,t){let{supabase:n}=await X(async()=>{let{supabase:e}=await Promise.resolve().then(()=>f);return{supabase:e}},void 0);return n?n.channel(e).on(`broadcast`,{event:`libro-escaneado`},t).subscribe():null},async detenerEscucha(e){let{supabase:t}=await X(async()=>{let{supabase:e}=await Promise.resolve().then(()=>f);return{supabase:e}},void 0);if(e&&t)try{t.removeChannel(e)}catch{}}},Q=null;function it(){if(!Q){let e=typeof process<`u`&&process.versions&&process.versions.node?`../../../public/vendor/js/qrcode.min.js`:`/vendor/js/qrcode.min.js`;Q=X(()=>import(e).then(e=>e.default),[])}return Q}async function at(e){let t=(await it())(0,`M`);return t.addData(e),t.make(),t.createSvgTag(5,2)}Object.assign(He.prototype,Ue,Ge,qe,Xe,Ze,Qe,$e,et,{renderScannerView(){let e=this._container();if(!e)return;e.innerHTML=`
      <div class="flex flex-col md:flex-row gap-6 w-full h-full max-w-7xl mx-auto items-start">
        <!-- Panel Izquierdo: El Esc�ner y B�squeda -->
        <div class="flex-1 w-full flex flex-col gap-6 sticky top-0">
           <div class="bg-patrimonio-card dark:bg-stone-900 rounded-3xl shadow-soft-xl border border-stone-200 dark:border-stone-700 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div class="absolute -top-24 -right-24 w-64 h-64 bg-patrimonio-lago/5 rounded-full blur-3xl pointer-events-none"></div>

               <h3 class="font-serif font-bold text-3xl text-stone-900 dark:text-stone-100 mb-2">Mesón de Circulación</h3>
               <p class="text-sm text-stone-500 dark:text-stone-400 mb-8 max-w-sm">Escanee un libro o ingrese el código manualmente para registrar préstamos y devoluciones.</p>
               
               <div class="w-full max-w-md flex flex-col gap-4">
                  <div class="relative">
                    <i aria-hidden="true" class="fas fa-barcode absolute left-5 top-1/2 -translate-y-1/2 text-xl text-stone-400"></i>
                    <input id="manual-scan-input" aria-label="Escribir el código del libro" placeholder="Ingrese el ISBN..." class="w-full pl-12 pr-4 py-4 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl text-lg font-bold text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:border-patrimonio-lago focus:ring-4 focus:ring-patrimonio-lago/10 transition-all shadow-sm outline-none" autocomplete="off" />
                  </div>
                  
                  <button id="manual-scan-btn" class="w-full bg-patrimonio-lago hover:bg-[#14303c] text-white font-bold rounded-2xl shadow-lg shadow-patrimonio-lago/20 px-6 py-4 text-base transition-all active:scale-95 flex items-center justify-center gap-2">
                    <i aria-hidden="true" class="fas fa-search"></i> Buscar Libro
                  </button>
               </div>

               <div class="mt-8 pt-6 border-t border-stone-100 w-full flex flex-wrap items-center justify-between gap-4">
                  <label class="flex items-center gap-3 cursor-pointer group" title="Si está activo, al escanear un libro prestado se devuelve inmediatamente.">
                    <div class="relative">
                      <input type="checkbox" id="fast-return-toggle" class="sr-only toggle-switch-input">
                      <div class="block bg-stone-200 w-12 h-7 rounded-full transition-colors duration-300 ease-in-out toggle-switch-bg group-hover:bg-stone-300">
                         <div class="absolute left-1 top-1 bg-white dark:bg-stone-800 w-5 h-5 rounded-full transition-transform duration-300 ease-in-out shadow-sm toggle-switch-knob flex items-center justify-center">
                         </div>
                      </div>
                    </div>
                    <div class="flex flex-col text-left">
                       <span class="text-sm font-bold text-stone-800 dark:text-stone-200 leading-none">Devolución rápida</span>
                       <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-bold mt-1">Escaneo continuo</span>
                    </div>
                  </label>

                  <button id="qr-remoto-btn" type="button" class="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 text-stone-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-50 dark:bg-stone-800/50 transition-all active:scale-95 shadow-sm">
                     <i aria-hidden="true" class="fas fa-mobile-screen-button text-patrimonio-lago"></i>
                     <span class="hidden sm:inline">Usar celular</span>
                  </button>
               </div>
           </div>
        </div>

        <!-- Panel Derecho: Resultados (scan-result) -->
        <div class="flex-[1.5] w-full bg-patrimonio-card dark:bg-stone-900 rounded-3xl shadow-soft-xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col relative min-h-[500px]">
           <div id="scan-result" class="flex-1 flex flex-col p-6 overflow-y-auto">
              <div class="m-auto text-center py-12 text-stone-400">
                <div class="w-24 h-24 mx-auto bg-stone-50 dark:bg-stone-800/50 rounded-full flex items-center justify-center mb-4 border border-stone-100 shadow-inner">
                  <i aria-hidden="true" class="fas fa-book-open text-4xl text-stone-300"></i>
                </div>
                <p class="text-base font-bold text-stone-500 dark:text-stone-400">Esperando escaneo...</p>
                <p class="text-sm mt-1">El resultado aparecerá aquí.</p>
              </div>
           </div>
        </div>
      </div>
    `;let n=async e=>{let n=document.getElementById(`scan-result`);if(n){this._ultimoCodigoEscaneado=e,n.innerHTML=`<div class="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400"><i aria-hidden="true" class="fas fa-spinner fa-spin text-patrimonio-lago"></i> Consultando…</div>`;try{let t=await q.consultarLibro(e);if(!t){await this._formularioAltaRapida(n,e);return}let r=document.getElementById(`fast-return-toggle`);if(r&&r.checked){let e=t.prestamos.find(e=>!e.fecha_devolucion_real);if(e)try{await H.devolverPrestamo(e.id),this.showToast(`Devolución rápida exitosa.`,`success`),n.innerHTML=`<div class="m-auto text-center py-12 text-stone-500 dark:text-stone-400">
                          <div class="w-24 h-24 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
                             <i aria-hidden="true" class="fas fa-check text-4xl text-emerald-500"></i>
                          </div>
                          <p class="text-xl font-bold text-emerald-700">�Libro devuelto!</p>
                          <p class="text-sm mt-1">Puede escanear el siguiente.</p>
                      </div>`;return}catch(e){this.showToast(e.message||`Error en devolución rápida`,`error`)}else this.showToast(`Este libro no tiene préstamos activos.`,`warning`)}let i=await J.listarReservas(t.libro?.id).catch(()=>null);n.innerHTML=this._fichaCirculacion(t,i),this._bindFichaCirculacion(n,t,e)}catch(e){n.innerHTML=`<p class="text-rose-700 font-bold text-sm">${t(e.message||`Error al consultar la base de datos.`)}</p>`}}};this._mostrarResultadoEscaneo=n,document.getElementById(`qr-remoto-btn`).addEventListener(`click`,()=>this.showQrRemotoModal());let r=()=>{let e=document.getElementById(`manual-scan-input`),t=e.value.trim();t&&(n(t),e.value=``,e.focus())};document.getElementById(`manual-scan-btn`).addEventListener(`click`,r),document.getElementById(`manual-scan-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&r()}),setTimeout(()=>{document.getElementById(`manual-scan-input`)?.focus()},100)},async _formularioAltaRapida(e,n){let r=(e,n,r,i=``)=>`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 mb-1 block">${n}</label>
        <input id="${e}" value="${t(r??``)}" ${i}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;e.innerHTML=`
      <div class="border border-stone-300 dark:border-stone-600 rounded-xl p-4">
        <p class="text-sm text-stone-600 dark:text-stone-300 mb-1">
          Ningún libro registrado con el código <span class="font-mono font-bold">${t(n)}</span>.
        </p>
        <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">Complete los datos y agréguelo al catálogo.</p>
        <p id="scan-new-book-buscando" class="text-xs text-stone-500 dark:text-stone-400 mb-3">
          <i aria-hidden="true" class="fas fa-spinner fa-spin"></i> Buscando título y autor en Open Library…
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${r(`scan-new-book-isbn`,`ISBN`,n,`readonly`)}
          ${r(`scan-new-book-qty`,`Ejemplares`,1,`type="number" min="1"`)}
          ${r(`scan-new-book-title`,`Título`,``)}
          ${r(`scan-new-book-author`,`Autor`,``)}
          ${r(`scan-new-book-genre`,`Género (opcional)`,``)}
          ${r(`scan-new-book-location`,`Ubicación (opcional)`,``)}
        </div>
        <div class="flex justify-end gap-3 pt-3">
          <button id="scan-new-book-btn" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-plus mr-1"></i> Agregar al catálogo
          </button>
        </div>
      </div>`,document.getElementById(`scan-new-book-btn`).addEventListener(`click`,async t=>{if(!this.validateBookForm(`scan-new-book`))return;let n=t.currentTarget;n.disabled=!0;try{let t=await q.agregarLibro({isbn:document.getElementById(`scan-new-book-isbn`).value.trim(),titulo:document.getElementById(`scan-new-book-title`).value.trim(),autor:document.getElementById(`scan-new-book-author`).value.trim(),genero:document.getElementById(`scan-new-book-genre`).value.trim(),ubicacion:document.getElementById(`scan-new-book-location`).value.trim(),stock:Number(document.getElementById(`scan-new-book-qty`).value||1)});this.showToast(t?.encolado?t.mensaje:`Libro agregado al catálogo.`,t?.encolado?`info`:`success`),e.innerHTML=``}catch(e){this.showToast(e.message||`No se pudo agregar el libro.`,`error`),n.disabled=!1}});let i=await c(n),a=document.getElementById(`scan-new-book-buscando`);if(i){a&&a.remove();let e=document.getElementById(`scan-new-book-title`),t=document.getElementById(`scan-new-book-author`);e&&!e.value.trim()&&i.titulo&&(e.value=i.titulo),t&&!t.value.trim()&&i.autor&&(t.value=i.autor)}else a&&(a.innerHTML=`<i aria-hidden="true" class="fas fa-info-circle mr-1 text-stone-500 dark:text-stone-400"></i> No se encontraron datos automáticos. Llene los campos manualmente.`)},async showQrRemotoModal(){let n=document.createElement(`div`);n.className=`fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4`,n.innerHTML=`
      <div class="bg-patrimonio-card dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
        <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Escanear desde el celular</h3>
        <p class="text-xs text-stone-600 dark:text-stone-300">
          Quien escanee este código NO necesita iniciar sesión. Si el libro es nuevo lo agrega al
          catálogo; si ya existe, solo muestra quién lo tiene — nada más — y el enlace deja de
          servir cuando vence o lo revoca. Cada escaneo remoto se avisa aquí, en vivo.
        </p>
        <label for="qr-remoto-horas" class="text-[11px] font-black uppercase tracking-wide text-stone-600 dark:text-stone-300 block">Vigente por</label>
        <select id="qr-remoto-horas" class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-sm">
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
        <button data-action="cerrar" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold w-full">Cerrar</button>
      </div>`,document.body.appendChild(n);let r=null,i=null,a=!1,o=async()=>{i&&await Z.detenerEscucha(i),i=null},s=this._prepararModal(n,{alCerrar:()=>{a=!0,o()}});n.querySelector(`[data-action="cerrar"]`).addEventListener(`click`,s),n.addEventListener(`click`,e=>{e.target===n&&s()});let c=async t=>{if(o(),!a)try{let n=await e(t);if(a)return;i=await Z.escucharEscaneos(n,({payload:e})=>{this.showToast(`Escaneo remoto: ${e?.titulo||e?.isbn||`libro`}`,`info`),e?.isbn&&e.isbn===this._ultimoCodigoEscaneado&&document.getElementById(`scan-result`)&&this._mostrarResultadoEscaneo?.(e.isbn)})}catch{}},l=async()=>{let e=document.getElementById(`qr-remoto-cuerpo`);if(!e)return;if(e.innerHTML=`<div class="flex items-center justify-center py-2 min-h-[180px]">
        <i aria-hidden="true" class="fas fa-spinner fa-spin text-2xl text-patrimonio-lago"></i>
        <span class="sr-only">Generando el enlace…</span></div>`,o(),r){try{await Z.revocarEnlaceEscaneo(r.id)}catch{}r=null}let n=Number(document.getElementById(`qr-remoto-horas`)?.value||4);try{if(r=await Z.crearEnlaceEscaneo(n),!r)throw Error(`El sistema no devolvió el enlace.`)}catch(n){e.innerHTML=`<p class="text-xs text-rose-700 py-6">${t(n.message||`No se pudo generar el enlace.`)}</p>`;return}c(r.token);let i=`${window.location.origin}${window.location.pathname.replace(/index\.html$/,``)}escaneo-remoto.html?token=${encodeURIComponent(r.token)}`;e.innerHTML=`
        <div id="qr-remoto-imagen" class="flex items-center justify-center py-2 min-h-[180px]">
          <i aria-hidden="true" class="fas fa-spinner fa-spin text-2xl text-patrimonio-lago"></i>
          <span class="sr-only">Dibujando el código QR…</span>
        </div>
        <p class="text-[11px] font-mono text-stone-500 dark:text-stone-400 break-all">${t(i)}</p>
        <p class="text-[11px] text-stone-500 dark:text-stone-400">Vence el ${t(this._fechaHoraLegible(r.expira_en))}.</p>
        <button data-action="revocar" class="text-rose-700 hover:text-rose-800 text-xs font-bold underline mt-1">
          <i aria-hidden="true" class="fas fa-ban mr-1"></i>Revocar este enlace ahora
        </button>`;try{let e=await at(i),t=document.getElementById(`qr-remoto-imagen`);t&&(t.innerHTML=e)}catch{let e=document.getElementById(`qr-remoto-imagen`);e&&(e.innerHTML=`<p class="text-xs text-rose-700">No se pudo generar el código QR. Puede copiar la dirección de más abajo.</p>`)}e.querySelector(`[data-action="revocar"]`)?.addEventListener(`click`,async t=>{let n=t.currentTarget;n.disabled=!0;try{await Z.revocarEnlaceEscaneo(r.id),r=null,o(),this.showToast(`Enlace revocado. Ya no sirve para agregar libros.`,`success`),e.innerHTML=`<p class="text-xs text-stone-500 dark:text-stone-400 py-6">Este enlace fue revocado. Genere uno nuevo si lo necesita.</p>`}catch(e){this.showToast(e.message||`No se pudo revocar el enlace.`,`error`),n.disabled=!1}})};document.getElementById(`qr-remoto-horas`).addEventListener(`change`,l),l()},_fichaCirculacion({libro:e,prestamos:n},r){let i=e.stock??0,a=i>0,o=(r||[]).filter(e=>e.estado===`activa`||e.estado===`apartada`);return`
      <div class="border border-stone-300 dark:border-stone-600 rounded-xl overflow-hidden">
        <div class="p-4 bg-stone-50 dark:bg-stone-800/50/70 flex items-start gap-3">
          ${this._portadaHtml(e)}
          <div class="min-w-0 flex-1">
            <p class="font-serif font-semibold text-stone-900 dark:text-stone-100 leading-tight">${t(e.titulo)}</p>
            <p class="text-sm text-stone-500 dark:text-stone-400">${t(e.autor)}</p>
            <p class="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">${t(e.isbn||`sin ISBN`)}</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span class="stamp ${a?`stamp-success`:`stamp-danger`} !rotate-0">
                <i aria-hidden="true" class="fas ${a?`fa-check`:`fa-xmark`}"></i>
                ${Number(i)} de ${Number(e.copias_totales??i)} disponible${i===1?``:`s`}
              </span>
              ${e.ubicacion?`<span class="stamp stamp-info !rotate-0"><i aria-hidden="true" class="fas fa-location-dot"></i> ${t(e.ubicacion)}</span>`:``}
            </div>
          </div>
        </div>

        <div class="p-4">
          ${n.length===0?`<p class="text-xs text-stone-500 dark:text-stone-400"><i aria-hidden="true" class="fas fa-circle-info mr-1"></i>Sin préstamos activos. Todos los ejemplares están en la biblioteca.</p>`:`<p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">${n.length} préstamo${n.length===1?``:`s`} activo${n.length===1?``:`s`}</p>
               ${n.map(e=>{let n=this._estadoPrestamo(e.fecha_devolucion_esperada),r=e.lector||{},i=r.bloqueado_manual||(r.atrasados??0)>0,a=Number(r.atrasados??0),o=r.bloqueado_manual?`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-ban"></i> Bloqueado</span>`:a>0?`<span class="stamp stamp-danger !rotate-0"><i aria-hidden="true" class="fas fa-triangle-exclamation"></i> Debe ${a} libro${a===1?``:`s`}</span>`:`<span class="stamp stamp-success !rotate-0"><i aria-hidden="true" class="fas fa-check"></i> Al día</span>`;return`
        <div class="border-t border-stone-200 dark:border-stone-700 pt-3 mt-3">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-0.5">En poder de</p>
              <p class="font-bold text-stone-800 dark:text-stone-200">${t(r.nombre||`Lector desconocido`)}</p>
              <p class="text-xs font-mono text-stone-500 dark:text-stone-400">${t(r.rut||`—`)}</p>
              <div class="mt-1.5">${o}</div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-0.5">Devolución</p>
              <p class="text-sm ${n.clave===`vencido`?`text-rose-700 font-bold`:n.clave===`porVencer`?`text-amber-700 font-bold`:`text-stone-700`}">
                ${this._fechaLegible(e.fecha_devolucion_esperada)}
              </p>
              <p class="text-[11px] ${n.clave===`vencido`?`text-rose-700`:n.clave===`porVencer`?`text-amber-700`:`text-stone-500 dark:text-stone-400`}">${t(n.etiqueta)}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <button data-devolver="${t(String(e.id))}" class="btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              <i aria-hidden="true" class="fas fa-rotate-left mr-1"></i> Registrar devolución
            </button>
            ${n.clave===`alDia`?``:`
              <button data-avisar="${t(String(e.id))}" class="btn-secundario bg-patrimonio-madera text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-bell mr-1"></i> Avisar
              </button>`}
            ${n.clave!==`vencido`&&(e.renovaciones??0)<this.param(`max_renovaciones`)?`
              <button data-renovar="${t(String(e.id))}" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-clock-rotate-left mr-1"></i> Renovar
              </button>`:``}
            ${i?`
              <button data-ver-lector="${t(r.rut||``)}" class="btn-secundario border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-user-large mr-1"></i> Ver situación
              </button>`:``}
          </div>
        </div>`}).join(``)}`}

          ${o.length>0?`
            <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mt-4">${o.length} reserva${o.length===1?``:`s`} vigente${o.length===1?``:`s`}</p>
            ${o.map(e=>`
      <div class="border-t border-stone-200 dark:border-stone-700 pt-3 mt-3">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-0.5">
              ${e.estado===`apartada`?`Apartado para`:`En fila (posición ${t(String(e.posicion_en_fila??`?`))})`}
            </p>
            <p class="font-bold text-stone-800 dark:text-stone-200">${t(e.lector_nombre||`Lector desconocido`)}</p>
            <p class="text-xs font-mono text-stone-500 dark:text-stone-400">${t(e.lector_rut||`—`)}</p>
          </div>
          ${e.estado===`apartada`?`<span class="stamp stamp-info !rotate-0 shrink-0"><i aria-hidden="true" class="fas fa-box-archive"></i> Apartado</span>`:`<span class="stamp !rotate-0 shrink-0"><i aria-hidden="true" class="fas fa-user-clock"></i> En fila</span>`}
        </div>
      
        ${e.estado===`apartada`?`
          <div class="flex flex-wrap gap-2 mt-3">
            <button data-entregar-reserva="${t(String(e.id))}" class="btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              <i aria-hidden="true" class="fas fa-hand-holding-hand mr-1"></i> Entregar libro
            </button>
            <button data-avisar-reserva="${t(String(e.id))}" data-rut="${t(e.lector_rut)}" data-vence="${t(e.vence_apartado_en)}" class="btn-secundario border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold">
              <i aria-hidden="true" class="fab fa-whatsapp mr-1 text-green-600"></i> Avisar lector
            </button>
          </div>
        `:``}
      </div>`).join(``)}`:``}

          <div class="border-t border-stone-200 dark:border-stone-700 pt-4 mt-4">
            ${a?`<button data-prestar-libro="${t(String(e.id))}" class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm">
                  <i aria-hidden="true" class="fas fa-right-left mr-1.5"></i> Prestar este libro
                 </button>`:`<button data-reservar-libro="${t(String(e.id))}" class="btn-secundario bg-patrimonio-madera text-white font-medium rounded-xl shadow py-2.5 text-sm w-full">
                  <i aria-hidden="true" class="fas fa-clock mr-1.5"></i> Reservar este libro
                 </button>`}
          </div>
        </div>
      </div>`},_bindFichaCirculacion(e,t,n){let r=()=>this._mostrarResultadoEscaneo?.(n);e.querySelectorAll(`[data-entregar-reserva]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{await J.retirarReserva(e.dataset.entregarReserva),this.showToast(`Reserva entregada. Se ha registrado el préstamo.`,`success`),r()}catch(t){this.showToast(t.message||`Error al entregar la reserva.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`[data-avisar-reserva]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let n=await Y.estadoLector(e.dataset.rut),r={nombre:n.nombre,email:n.email,telefono:n.telefono};typeof this.showNotifyReservaModal==`function`?this.showNotifyReservaModal({vence_apartado_en:e.dataset.vence},t.libro,r):this.showToast(`El módulo de notificaciones no está disponible.`,`error`)}catch(e){this.showToast(e.message||`Error al obtener datos del lector.`,`error`)}finally{e.disabled=!1}})}),e.querySelectorAll(`[data-reservar-libro]`).forEach(e=>{e.addEventListener(`click`,()=>this.flujoReserva(e.dataset.reservarLibro,r))}),e.querySelectorAll(`[data-devolver]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await H.devolverPrestamo(e.dataset.devolver);t?.encolado?this.showToast(t.mensaje,`info`):this.showToast(`Devolución registrada.`,`success`),r()}catch(t){this.showToast(t.message||`No se pudo registrar la devolución.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`[data-renovar]`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{let t=await H.renovarPrestamo(e.dataset.renovar);t?.encolado?this.showToast(t.mensaje,`info`):this.showToast(`Renovado hasta el ${this._fechaLegible(t?.nueva_fecha)}.`,`success`),r()}catch(t){this.showToast(t.message||`No se pudo renovar.`,`error`),e.disabled=!1}})}),e.querySelectorAll(`[data-avisar]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=t.prestamos.find(t=>String(t.id)===String(e.dataset.avisar));n&&this.showNotifyModal({id:n.id,fecha_devolucion_esperada:n.fecha_devolucion_esperada,libros:t.libro,lectores:n.lector})})}),e.querySelectorAll(`[data-ver-lector]`).forEach(e=>{e.addEventListener(`click`,()=>this.showLectorModal(e.dataset.verLector))}),e.querySelectorAll(`[data-prestar-libro]`).forEach(e=>{e.addEventListener(`click`,()=>this.flujoPrestamo(e.dataset.prestarLibro,r))})}});var $=new He,ot=`No se pudo iniciar la aplicación a tiempo. Recargue la página; si el problema sigue, cierre esta pestaña y ábrala de nuevo.`;function st(){try{Object.keys(localStorage).filter(e=>e.startsWith(`sb-`)&&e.endsWith(`-auth-token`)).forEach(e=>localStorage.removeItem(e))}catch{}}function ct(){return(window.location.hash||``).includes(`type=recovery`)}function lt(){return(window.location.hash||``).includes(`type=invite`)}function ut(){sincronizacionIniciada||(sincronizacionIniciada=!0,V.iniciar(),E.sincronizarTodo(),L.reintentarPendientes(),setInterval(()=>{E.sincronizarTodo(),L.reintentarPendientes()},INTERVALO_SINCRONIZACION_MS),window.addEventListener(`online`,()=>E.sincronizarTodo()))}document.addEventListener(`DOMContentLoaded`,async()=>{D.iniciar(()=>`arranque`);try{if(!h)throw Error(`No se pudo inicializar la conexión con Supabase (CDN no disponible).`);if(ct()){$.renderNuevaPassword(),window.__appBooted=!0;return}if(lt()){$.renderCompletarInvitacion(),window.__appBooted=!0;return}let e=null,t=async t=>{if(e){await e;return}e=$.renderShell(t),await e,ut()};ae(async(n,r)=>{if(n===`PASSWORD_RECOVERY`){$.renderNuevaPassword();return}n===`SIGNED_IN`&&r&&!$.sesionRenderizada&&($.sesionRenderizada=!0,await t(r.user)),n===`SIGNED_OUT`&&($.sesionRenderizada=!1,e=null,$.renderLogin())});let{data:{session:n},error:r}=await a(h.auth.getSession(),8e3,ot);if(r)throw r;n?($.sesionRenderizada=!0,await t(n.user)):$.renderLogin(),window.__appBooted=!0}catch(e){window.__appBooted=!0,D.registrarOperacion(`arranque`,e),e?.message===ot&&st(),window.__showCriticalError?window.__showCriticalError(e.message||`Fallo crítico en el inicio. Verifique su conexión a internet.`):document.body.innerHTML=`<div class="p-10 text-center text-red-600 font-bold">Fallo crítico en el inicio. Verifique la consola de red.</div>`}});