import{a as e,c as t,i as n,n as r,t as i,u as a}from"./libros-externos-DVLDPn1e.js";/* empty css               */var o=null;function s(){return typeof window.Html5Qrcode==`function`?Promise.resolve():o||(o=new Promise((e,t)=>{let n=document.createElement(`script`);n.src=`vendor/js/html5-qrcode.min.js`,n.onload=()=>e(),n.onerror=()=>{o=null,t(Error(`No se pudo cargar el módulo de escaneo.`))},document.head.appendChild(n)}),o)}var c={NotAllowedError:`El navegador no tiene permiso para usar la cámara. Revise el candado o los ajustes del sitio y permita el acceso a la cámara, luego intente de nuevo.`,PermissionDeniedError:`El navegador no tiene permiso para usar la cámara. Revise el candado o los ajustes del sitio y permita el acceso a la cámara, luego intente de nuevo.`,NotFoundError:`No se encontró ninguna cámara en este dispositivo.`,DevicesNotFoundError:`No se encontró ninguna cámara en este dispositivo.`,NotReadableError:`La cámara está siendo usada por otra aplicación. Ciérrela e intente de nuevo.`,TrackStartError:`La cámara está siendo usada por otra aplicación. Ciérrela e intente de nuevo.`,SecurityError:`El navegador bloqueó el acceso a la cámara en este sitio.`,AbortError:`No se pudo encender la cámara. Intente de nuevo.`};function l(e){let t=e?.name||``;if(c[t])return c[t];let n=String(e?.message||e||``);return/permission|constraint|overconstrained/i.test(n)?`No se pudo acceder a la cámara con la configuración pedida.`:`No se pudo encender la cámara. Si abrió este enlace desde WhatsApp u otra aplicación, intente abrirlo en su navegador (Chrome o Safari).`}function u(){let e=window.Html5QrcodeSupportedFormats;if(!e)return;let t=[`EAN_13`,`EAN_8`,`UPC_A`,`UPC_E`,`CODE_128`,`CODE_39`,`CODABAR`,`ITF`,`QR_CODE`],n=t.map(t=>e[t]).filter(e=>e!==void 0);return n.length===t.length?n:void 0}function d(e){e.innerHTML=`
    <div class="escaneo-marco">
      <div id="reader-video" class="escaneo-marco__video"></div>
      <div class="escaneo-overlay"></div>
      <div class="escaneo-marco__guia" aria-hidden="true">
        <span class="escaneo-marco__esquina escaneo-marco__esquina--tl"></span>
        <span class="escaneo-marco__esquina escaneo-marco__esquina--tr"></span>
        <span class="escaneo-marco__esquina escaneo-marco__esquina--bl"></span>
        <span class="escaneo-marco__esquina escaneo-marco__esquina--br"></span>
      </div>
      <div class="linea-escaneo" aria-hidden="true"></div>
      <div class="absolute bottom-4 inset-x-0 text-center z-20">
        <span class="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-lg">Apunta la cámara al código</span>
      </div>
    </div>`}var f=new class{constructor(){this.html5Qrcode=null,this.activo=!1,this._audioCtx=null}_pitido(){try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return;(!this._audioCtx||this._audioCtx.state===`closed`)&&(this._audioCtx=new e),this._audioCtx.state===`suspended`&&this._audioCtx.resume();let t=this._audioCtx.createOscillator(),n=this._audioCtx.createGain();t.type=`sine`,t.frequency.setValueAtTime(880,this._audioCtx.currentTime),t.frequency.exponentialRampToValueAtTime(1760,this._audioCtx.currentTime+.1),n.gain.setValueAtTime(0,this._audioCtx.currentTime),n.gain.linearRampToValueAtTime(.5,this._audioCtx.currentTime+.02),n.gain.exponentialRampToValueAtTime(.001,this._audioCtx.currentTime+.15),t.connect(n),n.connect(this._audioCtx.destination),t.start(),t.stop(this._audioCtx.currentTime+.2);let r=document.querySelectorAll(`.escaneo-marco__esquina`);r.forEach(e=>{e.style.borderColor=`#10b981`,e.style.boxShadow=`0 0 15px rgba(16, 185, 129, 0.8)`}),setTimeout(()=>{r.forEach(e=>{e.style.borderColor=``,e.style.boxShadow=``})},400)}catch(e){console.error(`No se pudo reproducir el sonido`,e)}}precargar(){s().catch(()=>{})}async start(e,t){let n=document.getElementById(`reader`);if(!n)return t?.(`El área de la cámara no está lista.`);if(this.activo)return;try{await s()}catch(e){return t?.(e.message)}if(!document.getElementById(`reader`))return;d(n);let r={fps:10,qrbox:(e,t)=>{let n=Math.floor(Math.min(e,t)*.75);return{width:n,height:Math.floor(n*.5)}},formatsToSupport:u()},i=t=>this.html5Qrcode.start(t,r,t=>{this._pitido(),e(t)},()=>{});try{this.html5Qrcode=new window.Html5Qrcode(`reader-video`,!1),this.activo=!0;try{await i({facingMode:`environment`})}catch(e){if(e?.name===`OverconstrainedError`)await i({facingMode:`user`});else throw e}}catch(e){this.activo=!1;let r=this.html5Qrcode;this.html5Qrcode=null;try{await r?.clear()}catch{}n.innerHTML=``,t?.(l(e))}}stop(){if(!this.html5Qrcode)return;let e=this.html5Qrcode;this.html5Qrcode=null,this.activo=!1;let t=()=>e.clear().catch(()=>{});try{let n=e.stop();n?.then?n.then(t,t):t()}catch{t()}let n=document.getElementById(`reader`);n&&(n.innerHTML=``)}},p=15e3,m=window.supabase?window.supabase.createClient(a.SUPABASE_URL,a.SUPABASE_ANON_KEY,{auth:{persistSession:!1,autoRefreshToken:!1}}):null,h=null;async function g(t){if(m)try{h||(h=m.channel(await e(v())),h.subscribe()),h.send({type:`broadcast`,event:`libro-escaneado`,payload:t})}catch{}}async function _(e,t={}){let n=new AbortController,r=setTimeout(()=>n.abort(),p),i;try{i=await fetch(`${a.SUPABASE_URL}/rest/v1/rpc/${e}`,{method:`POST`,headers:{"Content-Type":`application/json`,apikey:a.SUPABASE_ANON_KEY,Authorization:`Bearer ${a.SUPABASE_ANON_KEY}`},body:JSON.stringify(t),signal:n.signal})}catch(e){throw Error(e.name===`AbortError`?`La operación tardó demasiado en responder. Intente nuevamente.`:`No se pudo conectar. Revise su conexión a internet.`)}finally{clearTimeout(r)}let o=await i.json().catch(()=>null);if(!i.ok)throw Error(o&&(o.message||o.error_description||o.hint)||`No se pudo completar la operación.`);return o}function v(){return new URLSearchParams(window.location.search).get(`token`)||``}function y(){return document.getElementById(`escaneo-remoto-app`)}function b(e){y().innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl shadow-2xl p-6 text-center space-y-3">
        <i aria-hidden="true" class="fas fa-triangle-exclamation text-3xl text-rose-700"></i>
        <h1 class="font-serif text-lg font-bold text-stone-900">Este enlace no funciona</h1>
        <p class="text-sm text-stone-600">${t(e)}</p>
        <p class="text-xs text-stone-500">Pida un enlace nuevo en el mesón de la biblioteca.</p>
      </div>`}var x=null,S=0;function C(e){let t=Date.now();return e===x&&t-S<3e3||(x=e,S=t,!1)}function w(e,n=`success`){let r=document.getElementById(`er-toast`);r&&(r.innerHTML=`<div class="border rounded-xl px-3 py-2 text-xs font-medium ${n===`error`?`bg-rose-50 border-rose-200 text-rose-800`:`bg-emerald-50 border-emerald-200 text-emerald-800`}" role="status">${t(e)}</div>`,clearTimeout(w._t),w._t=setTimeout(()=>{r&&(r.innerHTML=``)},5e3))}var T=[],E=1;function D({libroId:e,isbn:t,titulo:n,autor:r,accion:i,cantidad:a}){T.unshift({id:E++,libroId:e,isbn:t,titulo:n,autor:r,accion:i,cantidad:a,deshaciendo:!1}),O()}function O(){let e=document.getElementById(`er-escaneados`);if(!e)return;if(T.length===0){e.innerHTML=``;return}let n=T.map(e=>`
      <li class="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-3" data-id="${e.id}">
        ${r({isbn:e.isbn,titulo:e.titulo})}
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-stone-800 truncate">${t(e.titulo||e.isbn)}</p>
          <p class="text-[11px] text-stone-500 truncate">${e.autor?t(e.autor)+` — `:``}${e.accion===`creado`?`Agregado`:`Repuesto ×${e.cantidad}`}</p>
        </div>
        <button data-deshacer="${e.id}" ${e.deshaciendo?`disabled`:``}
          class="shrink-0 text-[11px] font-bold text-rose-700 hover:underline disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1.5 rounded-lg">
          ${e.deshaciendo?`<i aria-hidden="true" class="fas fa-spinner fa-spin"></i>`:`<i aria-hidden="true" class="fas fa-rotate-left mr-1"></i>Deshacer`}
        </button>
      </li>`).join(``);e.innerHTML=`
      <p class="text-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-2">
        ${T.length===1?`1 libro agregado en esta sesión`:`${T.length} libros agregados en esta sesión`}
      </p>
      <ul class="space-y-2 mt-2">${n}</ul>`,e.querySelectorAll(`[data-deshacer]`).forEach(e=>{e.addEventListener(`click`,()=>k(Number(e.dataset.deshacer)))})}async function k(e){let t=T.find(t=>t.id===e);if(t&&!t.deshaciendo){t.deshaciendo=!0,O();try{let n=(await _(`deshacer_libro_remoto`,{p_token:v(),p_libro_id:t.libroId}))?.[0];if(!n?.deshecho){w(n?.motivo||`No se pudo deshacer.`,`error`),t.deshaciendo=!1,O();return}T=T.filter(t=>t.id!==e),O(),w(`Deshecho.`,`success`)}catch(e){w(e.message||`No se pudo deshacer.`,`error`),t.deshaciendo=!1,O()}}}function A(e){y().innerHTML=`
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="text-center">
          <i aria-hidden="true" class="fas fa-barcode text-3xl text-patrimonio-madera"></i>
          <h1 class="font-serif text-xl font-bold text-stone-900 mt-2">Escaneo remoto de libros</h1>
          <p class="text-xs text-stone-500 mt-1.5 leading-relaxed">
            Sin iniciar sesión. Si el libro es nuevo, lo agrega al catálogo; si ya existe,
            muestra quién lo tiene ahora mismo en vez de sumarle ejemplares.
            ${e?`Este enlace vence a las ${t(e)}.`:``}
          </p>
        </div>

        <ol class="grid grid-cols-3 gap-2 text-center">
          <li class="bg-stone-50 border border-stone-200 rounded-xl px-2 py-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-patrimonio-madera text-white text-xs font-bold mx-auto mb-1.5">1</span>
            <span class="text-[11px] text-stone-600 leading-tight block">Pulse «Iniciar cámara» y permita el acceso</span>
          </li>
          <li class="bg-stone-50 border border-stone-200 rounded-xl px-2 py-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-patrimonio-madera text-white text-xs font-bold mx-auto mb-1.5">2</span>
            <span class="text-[11px] text-stone-600 leading-tight block">Apunte al código de barras del libro</span>
          </li>
          <li class="bg-stone-50 border border-stone-200 rounded-xl px-2 py-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-patrimonio-madera text-white text-xs font-bold mx-auto mb-1.5">3</span>
            <span class="text-[11px] text-stone-600 leading-tight block">Suena un pitido y sigue con el próximo</span>
          </li>
        </ol>

        <div id="er-toast"></div>

        <button id="er-start" class="btn-madera w-full text-white font-sans font-bold rounded-xl shadow px-4 py-3.5 text-base">
          <i aria-hidden="true" class="fas fa-camera mr-2"></i>Iniciar cámara
        </button>
        <div id="er-camara-encendida" class="hidden space-y-3">
          <div id="reader" class="w-full"></div>
          <button id="er-stop" class="w-full bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-medium px-4 py-2.5 text-sm">
            <i aria-hidden="true" class="fas fa-stop mr-1.5"></i>Detener cámara
          </button>
        </div>

        <div id="er-escaneados"></div>

        <details class="text-center">
          <summary class="text-xs text-stone-500 cursor-pointer select-none py-1">¿Prefiere escribir el código a mano?</summary>
          <div class="flex gap-2 mt-2">
            <input id="er-manual" inputmode="numeric" aria-label="Escribir el ISBN manualmente"
              placeholder="Ingrese el ISBN"
              class="flex-1 px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
            <button id="er-buscar" class="bg-patrimonio-lago hover:bg-[#14303c] text-white font-sans font-medium rounded-xl shadow px-4 py-2 text-sm">Agregar</button>
          </div>
        </details>

        <div id="er-resultado"></div>
      </div>`,document.getElementById(`er-start`).addEventListener(`click`,async e=>{let t=e.currentTarget,n=t.innerHTML;t.disabled=!0,t.innerHTML=`<i aria-hidden="true" class="fas fa-spinner fa-spin mr-2"></i>Preparando cámara…`,document.getElementById(`er-camara-encendida`)?.classList.remove(`hidden`);try{await f.start(e=>{C(e)||M(e)},e=>{w(e,`error`),t.classList.remove(`hidden`),document.getElementById(`er-camara-encendida`)?.classList.add(`hidden`)}),f.activo&&t.classList.add(`hidden`)}finally{t.disabled=!1,t.innerHTML=n}}),document.getElementById(`er-stop`).addEventListener(`click`,()=>{f.stop(),document.getElementById(`er-camara-encendida`)?.classList.add(`hidden`),document.getElementById(`er-start`)?.classList.remove(`hidden`)});let n=()=>{let e=document.getElementById(`er-manual`),t=e.value.trim();t&&(e.value=``,M(t))};document.getElementById(`er-buscar`).addEventListener(`click`,n),document.getElementById(`er-manual`).addEventListener(`keydown`,e=>{e.key===`Enter`&&n()})}function j(e){let n=e[0],r=e.filter(e=>e.tipo);return`
      <div class="border border-stone-300 rounded-xl p-4 text-center">
        <p class="font-bold text-stone-800">${t(n.titulo)}</p>
        ${n.autor?`<p class="text-sm text-stone-500">${t(n.autor)}</p>`:``}
        <p class="text-xs text-stone-500 mt-1">${t(String(n.stock))} de ${t(String(n.copias_totales))} ejemplar(es) disponibles</p>
        <p class="text-[11px] text-stone-500 mt-2">Este libro ya está en el catálogo — no se sumó ningún ejemplar.</p>
        ${r.length===0?`<p class="text-xs text-emerald-700 mt-2"><i aria-hidden="true" class="fas fa-circle-check mr-1"></i>Nadie lo tiene ahora mismo.</p>`:r.map(e=>e.tipo===`prestamo`?`
        <div class="border-t border-stone-200 pt-2 mt-2 text-left">
          <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">En préstamo</p>
          <p class="text-sm font-bold text-stone-800">${t(e.persona_nombre||`Lector desconocido`)}</p>
          <p class="text-xs font-mono text-stone-500">${t(e.persona_rut||`—`)}</p>
          ${e.prestamo_fecha_devolucion_esperada?`<p class="text-xs text-stone-500 mt-0.5">Vuelve el ${t(e.prestamo_fecha_devolucion_esperada)}</p>`:``}
        </div>`:`
        <div class="border-t border-stone-200 pt-2 mt-2 text-left">
          <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">
            ${e.reserva_estado===`apartada`?`Apartado para`:`Reservado para (posición ${t(String(e.reserva_posicion_en_fila??`?`))} en la fila)`}
          </p>
          <p class="text-sm font-bold text-stone-800">${t(e.persona_nombre||`Lector desconocido`)}</p>
          <p class="text-xs font-mono text-stone-500">${t(e.persona_rut||`—`)}</p>
        </div>`).join(``)}
      </div>`}async function M(e){let n=document.getElementById(`er-resultado`);if(n){n.innerHTML=`<p class="text-xs text-stone-500"><i aria-hidden="true" class="fas fa-spinner fa-spin mr-1"></i>Consultando…</p>`;try{let t=await _(`consultar_libro_remoto`,{p_token:v(),p_codigo:e});if(t?.[0]?.encontrado){n.innerHTML=j(t),w(`Este libro ya está en el catálogo.`,`success`),g({isbn:t[0].isbn,titulo:t[0].titulo,autor:t[0].autor});return}}catch{}try{let r=(await _(`agregar_libro_remoto`,{p_token:v(),p_isbn:e}))?.[0];if(!r)throw Error(`El sistema no respondió con datos.`);if(r.estado===`falta_info`){await N(n,e);return}if(r.estado===`existe`){n.innerHTML=`
              <div class="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-sm text-center">
                <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Este libro ya está en el catálogo</p>
                <p class="text-emerald-700 mt-1">${t(r.titulo||r.isbn)}${r.autor?` — ${t(r.autor)}`:``}</p>
              </div>`,w(`Este libro ya está en el catálogo.`,`success`),g({isbn:r.isbn,titulo:r.titulo,autor:r.autor});return}n.innerHTML=`
          <div class="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-sm">
            <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Se agregó al catálogo</p>
            <p class="text-emerald-700 mt-1">${t(r.titulo||r.isbn)}${r.autor?` — ${t(r.autor)}`:``}</p>
            <p class="text-xs text-emerald-700 mt-1">Ahora hay ${t(String(r.stock))} de ${t(String(r.copias_totales))} ejemplar(es) disponibles.</p>
          </div>`,w(`Listo. Puede seguir escaneando.`,`success`),D({libroId:r.libro_id,isbn:r.isbn,titulo:r.titulo,autor:r.autor,accion:r.estado,cantidad:1}),g({isbn:r.isbn,titulo:r.titulo,autor:r.autor})}catch(e){let r=e.message||`No se pudo completar la operación.`;n.innerHTML=`<p class="text-rose-700 text-sm font-bold"><i aria-hidden="true" class="fas fa-circle-exclamation mr-1.5"></i>${t(r)}</p>`,/no es válido|expiró|revocado/i.test(r)&&f.stop()}}}async function N(e,n){let r=(e,t,n=``)=>`
      <div>
        <label for="${e}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${t}</label>
        <input id="${e}" ${n}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;e.innerHTML=`
      <div class="border border-stone-300 rounded-xl p-4">
        <p class="text-sm text-stone-600 mb-1">Ningún libro registrado con el código <span class="font-mono font-bold">${t(n)}</span>.</p>
        <p id="er-buscando" class="text-xs text-stone-500 mb-3"><i aria-hidden="true" class="fas fa-spinner fa-spin"></i> Buscando título y autor en Open Library…</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${r(`er-nuevo-titulo`,`Título`)}
          ${r(`er-nuevo-autor`,`Autor`)}
          ${r(`er-nuevo-cantidad`,`Ejemplares`,`type="number" min="1" value="1"`)}
        </div>
        <div class="flex justify-end gap-3 pt-3">
          <button id="er-nuevo-guardar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-plus mr-1"></i>Agregar al catálogo
          </button>
        </div>
      </div>`,document.getElementById(`er-nuevo-guardar`).addEventListener(`click`,async r=>{let i=document.getElementById(`er-nuevo-titulo`).value.trim(),a=document.getElementById(`er-nuevo-autor`).value.trim(),o=Number(document.getElementById(`er-nuevo-cantidad`).value||1);if(!i){w(`El título es obligatorio.`,`error`);return}let s=r.currentTarget;s.disabled=!0;try{let r=(await _(`agregar_libro_remoto`,{p_token:v(),p_isbn:n,p_titulo:i,p_autor:a||null,p_stock:o}))?.[0];e.innerHTML=`
              <div class="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-sm">
                <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Se agregó al catálogo</p>
                <p class="text-emerald-700 mt-1">${t(r?.titulo||i)}</p>
              </div>`,w(`Listo. Puede seguir escaneando.`,`success`),r&&(D({libroId:r.libro_id,isbn:r.isbn,titulo:r.titulo||i,autor:r.autor,accion:r.estado,cantidad:o}),g({isbn:r.isbn,titulo:r.titulo||i,autor:r.autor}))}catch(e){w(e.message||`No se pudo agregar el libro.`,`error`),s.disabled=!1}});let a=await i(n);if(document.getElementById(`er-buscando`)?.remove(),a){let e=document.getElementById(`er-nuevo-titulo`),t=document.getElementById(`er-nuevo-autor`);e&&!e.value.trim()&&a.titulo&&(e.value=a.titulo),t&&!t.value.trim()&&a.autor&&(t.value=a.autor)}}async function P(){let e=v();if(!e){b(`Falta el código del enlace en la dirección. Pida uno nuevo en el mesón.`);return}let t;try{t=(await _(`validar_enlace_escaneo`,{p_token:e}))?.[0]}catch(e){b(e.message||`No se pudo comprobar el enlace.`);return}if(!t||!t.valido){b(t?.motivo||`Este enlace ya no es válido.`);return}A(t.expira_en?new Date(t.expira_en).toLocaleString(`es-CL`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`}):``),n(),f.precargar(),document.addEventListener(`visibilitychange`,()=>{document.hidden&&f.stop()})}document.addEventListener(`DOMContentLoaded`,()=>{P().catch(()=>b(`No se pudo cargar la página. Revise su conexión e intente de nuevo.`))});