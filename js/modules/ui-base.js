import * as auth from './auth.js';
import { db, hoyEnChile } from './db.js';
import Scanner from './scanner.js';
import registroErrores from './errores.js';
import { CONFIG } from '../config.js';
import { escapeHtml, html } from './utilidades.js';
import estadoConexion from './estado-conexion.js';
import { portadaUrl, portadaHtml, vigilarPortadas } from './portadas.js';

// Instancias de Chart.js activas, indexadas por id de canvas. Se destruyen
// antes de volver a dibujar para no acumular gráficos huérfanos en memoria.
// Se exporta porque tanto el Dashboard como Reportes dibujan anillos.
export let chartInstances = {};

// Chart.js se carga solo cuando el usuario entra al Dashboard (lazy load),
// para no penalizar el arranque de la app en el resto de las vistas.
let chartJsPromise = null;
export function loadChartJs() {
  if (window.Chart) return Promise.resolve();
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Archivo local: la política de seguridad de contenido bloquea los CDN
    // externos, y así el gráfico también funciona sin depender de un tercero.
    // Se carga solo cuando se abre una vista con gráficos, no en el arranque.
    script.src = 'vendor/js/chart.umd.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Chart.js'));
    document.head.appendChild(script);
  });
  return chartJsPromise;
}

// Escala de fuente elegida en Mi perfil, para adultos mayores. Se aplica acá,
// antes de cualquier render, para que no haya parpadeo entre el tamaño por
// defecto y el guardado.
// Se exporta para que Mi perfil (js/vistas/perfil.js) escriba con la misma
// clave que se lee acá al arrancar.
export const CLAVE_ESCALA_FUENTE = 'biblionexo-escala-fuente';
function aplicarEscalaFuenteGuardada() {
  try {
    const guardada = localStorage.getItem(CLAVE_ESCALA_FUENTE);
    if (guardada) document.documentElement.style.setProperty('--escala-fuente', guardada);
  } catch (e) {
    // Si el navegador bloquea localStorage, se queda con el tamaño por defecto
  }
}

class UIManager {
  constructor() {
    this.currentView = null;
    this.currentUserRole = 'librero'; // Por defecto
    this._lastScannedCode = null;
    this._lastScanTimestamp = 0;
    this.bookPage = 0;
    this.userPage = 0;
    this.loanPage = 0;
    this.catalogSearch = '';
    this.userSearch = '';
    this.loanFilter = 'todos';
    this.reportPeriod = 'mes';
    this.adminTab = 'inventario';
    this._parametros = null;
    this._controlInactividadActivo = false;
    this._loansCache = [];
    this._booksCache = [];
    this._usersCache = [];
    this.sesionRenderizada = false;
    window.uiManager = this;

    aplicarEscalaFuenteGuardada();

    // Solo inicializamos el login si los elementos existen en tu HTML
    if (document.getElementById('login-form')) {
        this.initLoginForm();
    }
  }

  // ==========================================
  // VALIDACIONES ORIGINALES
  // ==========================================
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Normaliza un RUT a la forma "12345678-9" (sin puntos, DV en mayúscula)
  formatRut(rut) {
    const limpio = (rut || '').toString().replace(/[.\-\s]/g, '').toUpperCase();
    if (limpio.length < 2) return limpio;
    return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
  }

  // Valida el dígito verificador de un RUT chileno (algoritmo módulo 11)
  isValidRut(rut) {
    const limpio = (rut || '').toString().replace(/[.\-\s]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;

    const cuerpo = limpio.slice(0, -1);
    const dvIngresado = limpio.slice(-1);

    let suma = 0;
    let multiplicador = 2;
    // Se recorre el cuerpo de derecha a izquierda multiplicando por 2,3,4,5,6,7 (y vuelve a 2)
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dvIngresado === dvEsperado;
  }

  // Normaliza un teléfono chileno a formato internacional (569XXXXXXXX)
  formatPhone(phone) {
    let digitos = (phone || '').toString().replace(/\D/g, '');
    if (digitos.startsWith('56')) return digitos;
    if (digitos.startsWith('9') && digitos.length === 9) return `56${digitos}`;
    if (digitos.length === 8) return `569${digitos}`;
    return digitos;
  }

  validateUserForm(isEdit = false) {
    const rut = document.getElementById(isEdit ? 'edit-user-id' : 'new-user-id')?.value.trim() || '';
    const name = document.getElementById(isEdit ? 'edit-user-name' : 'new-user-name')?.value.trim() || '';
    const email = document.getElementById(isEdit ? 'edit-user-email' : 'new-user-email')?.value.trim() || '';
    const phone = document.getElementById(isEdit ? 'edit-user-phone' : 'new-user-phone')?.value.trim() || '';

    // Los cuatro datos son obligatorios: sin correo ni teléfono no se puede
    // avisar al lector cuando un préstamo vence.
    if (!name) {
      this.showToast('Escribe el nombre completo del lector.', 'error');
      return false;
    }
    if (name.split(/\s+/).length < 2) {
      this.showToast('Escribe el nombre y al menos un apellido.', 'error');
      return false;
    }
    if (!rut && !isEdit) {
      this.showToast('Escribe el RUT del lector.', 'error');
      return false;
    }
    if (rut && !this.isValidRut(rut)) {
      this.showToast('El RUT no es válido. Revisa el dígito verificador.', 'error');
      return false;
    }
    if (!phone) {
      this.showToast('Escribe el teléfono del lector.', 'error');
      return false;
    }
    if (this.formatPhone(phone).length < 11) {
      this.showToast('El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.', 'error');
      return false;
    }
    if (!email) {
      this.showToast('Escribe el correo del lector.', 'error');
      return false;
    }
    if (!this.isValidEmail(email)) {
      this.showToast('El correo no es válido.', 'error');
      return false;
    }
    return true;
  }

  /**
   * @param {boolean|string} modo  `true`/`'edit'` para el modal de edición
   *   (ids `edit-book-*`), `false`/`'new'` para el formulario del Catálogo
   *   (ids `new-book-*`), o cualquier otro texto para usarlo directo como
   *   prefijo de otro formulario con la misma forma (por ejemplo, el alta
   *   rápida desde el escáner usa `'scan-new-book'`).
   */
  validateBookForm(modo = false) {
    const isEdit = modo === true || modo === 'edit';
    const prefijo = isEdit ? 'edit-book' : (modo === false || modo === 'new') ? 'new-book' : modo;

    const isbn = document.getElementById(`${prefijo}-isbn`)?.value.trim() || '';
    const title = document.getElementById(`${prefijo}-title`)?.value.trim() || '';
    const author = document.getElementById(`${prefijo}-author`)?.value.trim() || '';
    const qtyStr = document.getElementById(`${prefijo}-qty`)?.value || '';
    const qty = parseInt(qtyStr, 10);

    if (!isbn && !isEdit) {
      this.showToast('El ISBN es obligatorio.', 'error');
      return false;
    }
    if (!title) {
      this.showToast('El título es obligatorio.', 'error');
      return false;
    }
    if (!author) {
      this.showToast('El autor es obligatorio.', 'error');
      return false;
    }
    // Al crear se exige al menos 1 copia. Al editar se permite 0, porque es
    // un estado válido: todas las copias pueden estar prestadas o darse de baja.
    if (isNaN(qty) || qty < (isEdit ? 0 : 1)) {
      this.showToast(isEdit ? 'La cantidad no puede ser negativa.' : 'La cantidad debe ser al menos 1.', 'error');
      return false;
    }
    return true;
  }

  // ==========================================
  // LÓGICA DE LOGIN ORIGINAL
  // ==========================================
  initLoginForm() {
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginForm = document.getElementById('login-form');
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const emailErrorSpan = this.createErrorSpan(emailInput);
    const passwordErrorSpan = this.createErrorSpan(passwordInput);

    emailInput.addEventListener('input', () => {
      if (!this.isValidEmail(emailInput.value.trim())) {
        this.showInlineError(emailInput, emailErrorSpan, 'Correo inválido.');
      } else {
        this.clearInlineError(emailInput, emailErrorSpan);
      }
    });

    passwordInput.addEventListener('input', () => {
      if (passwordInput.value.length === 0) {
        this.showInlineError(passwordInput, passwordErrorSpan, 'Contraseña requerida.');
      } else {
        this.clearInlineError(passwordInput, passwordErrorSpan);
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      let valid = true;

      if (!email) {
        this.showInlineError(emailInput, emailErrorSpan, 'El correo es obligatorio.');
        valid = false;
      }
      else if (!this.isValidEmail(email)) {
        this.showInlineError(emailInput, emailErrorSpan, 'Correo inválido.');
        valid = false;
      } else this.clearInlineError(emailInput, emailErrorSpan);

      if (!password) {
        this.showInlineError(passwordInput, passwordErrorSpan, 'La contraseña es obligatoria.');
        valid = false;
      } else this.clearInlineError(passwordInput, passwordErrorSpan);

      if (!valid) return;

      loginButton.disabled = true;
      const spinner = this.showSpinner(loginButton);

      try {
        // Conexión asíncrona con Supabase usando auth.js
        await auth.login(email, password);
        this.showToast('Sesión iniciada correctamente.', 'success');
        window.location.reload(); 
      } catch (err) {
        this.showToast(err.message || 'Error al iniciar sesión.', 'error');
      } finally {
        loginButton.disabled = false;
        this.hideSpinner(spinner);
      }
    });
  }

  createErrorSpan(input) {
    let span = input.parentNode.querySelector('.input-error');
    if (!span) {
      span = document.createElement('span');
      span.className = 'input-error text-xs text-rose-700 mt-1 block font-bold';
      input.parentNode.appendChild(span);
    }
    return span;
  }

  showInlineError(input, span, message) {
    span.textContent = message;
    input.classList.add('border-rose-700', 'ring-rose-700');
    input.setAttribute('aria-invalid', 'true');
  }

  clearInlineError(input, span) {
    span.textContent = '';
    input.classList.remove('border-rose-700', 'ring-rose-700');
    input.removeAttribute('aria-invalid');
  }

  showSpinner(button) {
    const spinner = document.createElement('span');
    spinner.className = 'spinner ml-2 inline-block border-[3px] border-t-white border-white/30 rounded-full w-4 h-4 animate-spin';
    button.appendChild(spinner);
    return spinner;
  }

  hideSpinner(spinner) {
    if (spinner && spinner.parentNode) spinner.parentNode.removeChild(spinner);
  }

  /**
   * Aviso en pantalla. Los de tipo 'error' se registran además en la bitácora:
   * son justo los que la persona del mesón ve, cierra y nadie más se entera.
   */
  showToast(message, type = 'success') {
    if (type === 'error') {
      registroErrores.registrar(message, { origen: 'operacion', accion: this.currentView || null });
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-patrimonio-bosque' : type === 'error' ? 'bg-rose-700' : 'bg-patrimonio-lago';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';

    toast.className = `${bgColor} text-white px-5 py-3.5 rounded-xl shadow-sm font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0 z-50 text-sm`;
    toast.innerHTML = `<i aria-hidden="true" class="fas ${icon} text-lg"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Modal de confirmación propio (reemplaza confirm() nativo)
  showConfirm(message, { title = 'Confirmar acción', confirmText = 'Confirmar', danger = true } = {}) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
      overlay.innerHTML = `
        <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
          <h3 class="font-serif text-lg font-bold text-stone-900">${escapeHtml(title)}</h3>
          <p class="text-stone-600 text-sm">${escapeHtml(message)}</p>
          <div class="flex justify-end gap-3 pt-2">
            <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
            <button data-action="confirm" class="${danger ? 'bg-rose-700 hover:bg-rose-800' : 'bg-patrimonio-madera hover:bg-[#633414]'} text-white px-4 py-2 rounded-xl text-sm font-medium">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      // El ayudante entrega el cierre accesible (foco, Escape, trampa de Tab)
      let resultado = false;
      const cerrarModal = this._prepararModal(overlay, { alCerrar: () => resolve(resultado) });
      const close = (r) => { resultado = r; cerrarModal(); };
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false));
      overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true));
      overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    });
  }

  // Modal de entrada de texto propio (reemplaza prompt() nativo)
  showPrompt(message, { title = 'Ingresar dato', placeholder = '', confirmText = 'Aceptar' } = {}) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
      overlay.innerHTML = `
        <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
          <h3 class="font-serif text-lg font-bold text-stone-900">${escapeHtml(title)}</h3>
          <p class="text-stone-600 text-sm">${escapeHtml(message)}</p>
          <input id="modal-prompt-input" aria-label="Valor solicitado" type="text" placeholder="${escapeHtml(placeholder)}"
            class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          <div class="flex justify-end gap-3 pt-2">
            <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
            <button data-action="confirm" class="bg-patrimonio-madera hover:bg-[#633414] text-white px-4 py-2 rounded-xl text-sm font-medium">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const input = overlay.querySelector('#modal-prompt-input');
      let resultado = null;
      const cerrarModal = this._prepararModal(overlay, { alCerrar: () => resolve(resultado) });
      const close = (r) => { resultado = r; cerrarModal(); };
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => close(null));
      overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(input.value.trim() || null));
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') close(input.value.trim() || null);
      });
      overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
    });
  }

  // ==========================================
  // AVISOS DE VENCIMIENTO
  // ==========================================

  // Días que faltan para la fecha de devolución.
  // Negativo = atrasado. 0 = vence hoy.
  _diasRestantes(fechaEsperada) {
    // Se usa la fecha de Chile, NO la del dispositivo. Las funciones SQL
    // deciden los atrasos con hoy_chile(), así que si aquí usáramos la hora
    // local del computador, la pantalla y el servidor discreparían: aparecería
    // el botón Renovar en préstamos que el servidor rechaza por atrasados, y
    // el conteo de atrasados no coincidiría con el del dashboard. Además, el
    // reloj mal configurado de un equipo dejaría de afectar el cálculo.
    const [ah, mh, dh] = hoyEnChile().split('-').map(Number);
    const hoy = new Date(ah, mh - 1, dh);

    // Se construye en horario local para evitar el corrimiento de un día que
    // produce new Date('YYYY-MM-DD'), que se interpreta como UTC.
    const [a, m, d] = (fechaEsperada || '').split('-').map(Number);
    const vence = new Date(a, (m || 1) - 1, d || 1);
    return Math.round((vence - hoy) / 86400000);
  }

  // Clasifica un préstamo activo según su fecha de devolución
  _estadoPrestamo(fechaEsperada) {
    const dias = this._diasRestantes(fechaEsperada);
    if (dias < 0) return { clave: 'vencido', dias, etiqueta: `Atrasado ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}` };
    if (dias === 0) return { clave: 'porVencer', dias, etiqueta: 'Vence hoy' };
    if (dias <= this.param('dias_aviso_previo')) return { clave: 'porVencer', dias, etiqueta: `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}` };
    return { clave: 'alDia', dias, etiqueta: `Vence en ${dias} días` };
  }

  // Redacta el aviso. Tono institucional y directo: qué libro, para cuándo,
  // qué hacer, y la consecuencia concreta de no devolverlo.
  _textoAviso(prestamo) {
    const estado = this._estadoPrestamo(prestamo.fecha_devolucion_esperada);
    const nombre = prestamo.lectores?.nombre || 'Estimado/a lector/a';
    const titulo = prestamo.libros?.titulo || 'el libro prestado';
    const fecha = this._fechaLegible(prestamo.fecha_devolucion_esperada);
    const b = CONFIG.BIBLIOTECA;
    const dias = Math.abs(estado.dias);
    const plural = dias === 1 ? 'día' : 'días';

    let cuerpo;
    if (estado.clave === 'vencido') {
      // Ya está atrasado: el bloqueo automático ya está aplicado
      cuerpo =
        `El plazo de devolución de “${titulo}” venció el ${fecha}, hace ${dias} ${plural}.\n\n` +
        `Mientras el libro no sea devuelto, tu inscripción queda suspendida y no podrás llevar otros libros. ` +
        `La suspensión se levanta automáticamente al momento de devolverlo.\n\n` +
        `Te pedimos acercarte a la biblioteca para regularizar tu situación.`;
    } else if (estado.dias === 0) {
      cuerpo =
        `“${titulo}” debe ser devuelto hoy.\n\n` +
        `Si no lo devuelves, tu inscripción quedará suspendida y no podrás llevar otros libros hasta regularizar. ` +
        `Si necesitas más tiempo, puedes acercarte a la biblioteca para renovar el préstamo.`;
    } else {
      cuerpo =
        `Te recordamos que “${titulo}” debe ser devuelto el ${fecha}, en ${dias} ${plural}.\n\n` +
        `Pasada esa fecha, tu inscripción queda suspendida y no podrás llevar otros libros hasta devolverlo. ` +
        `Si necesitas más tiempo, puedes renovar el préstamo acercándote a la biblioteca.`;
    }

    return `Hola ${nombre}:\n\n${cuerpo}\n\n${b.nombre}\n${b.direccion} · ${b.telefono}`;
  }

  _fechaLegible(fechaIso) {
    const [a, m, d] = (fechaIso || '').split('-').map(Number);
    if (!a) return fechaIso || '';
    return new Date(a, (m || 1) - 1, d || 1).toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /**
   * Fecha y hora legibles, para marcas de tiempo completas (timestamptz) como
   * la expiración de un enlace de escaneo remoto o cuándo se usó por última
   * vez — a diferencia de _fechaLegible(), que es solo para fechas (date).
   */
  _fechaHoraLegible(fechaIso) {
    if (!fechaIso) return '—';
    const fecha = new Date(fechaIso);
    if (isNaN(fecha)) return fechaIso;
    return fecha.toLocaleString('es-CL', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  // Modal con las dos vías de contacto disponibles sin servidor de correo:
  // WhatsApp (lo más usado en la comuna) y el cliente de correo del equipo.
  showNotifyModal(prestamo) {
    const mensaje = this._textoAviso(prestamo);
    const estado = this._estadoPrestamo(prestamo.fecha_devolucion_esperada);
    const lector = prestamo.lectores || {};
    const telefono = this.formatPhone(lector.telefono);
    const email = lector.email;
    const asunto = estado.clave === 'vencido'
      ? 'Devolución pendiente en la Biblioteca Municipal de Futrono'
      : 'Recordatorio de devolución — Biblioteca Municipal de Futrono';

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900">Avisar a ${escapeHtml(lector.nombre || 'el lector')}</h3>
          <p class="text-xs text-stone-500 mt-0.5">${escapeHtml(estado.etiqueta)} · ${escapeHtml(prestamo.libros?.titulo || '')}</p>
        </div>

        <div>
          <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Mensaje</label>
          <textarea id="notify-message" aria-label="Texto del aviso al lector" rows="7" class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white text-sm text-stone-800 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">${escapeHtml(mensaje)}</textarea>
          <p class="text-[11px] text-stone-500 mt-1">Puedes editarlo antes de enviarlo.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button data-action="whatsapp" ${telefono.length < 11 ? 'disabled' : ''}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-bosque hover:bg-[#22392F] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fa-brands fa-whatsapp"></i> WhatsApp
          </button>
          <button data-action="email" ${!email ? 'disabled' : ''}
            class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-lago hover:bg-[#14303c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-envelope"></i> Correo
          </button>
          <button data-action="copy"
            class="btn-secundario flex items-center justify-center gap-2 border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-2.5 rounded-xl text-sm font-medium">
            <i aria-hidden="true" class="fas fa-copy"></i> Copiar
          </button>
        </div>
        ${(telefono.length < 11 || !email) ? `<p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">Este lector no tiene ${!email ? 'correo' : ''}${(!email && telefono.length < 11) ? ' ni ' : ''}${telefono.length < 11 ? 'teléfono' : ''} registrado. Complétalo en la vista Lectores para poder avisarle.</p>` : ''}

        <div class="flex justify-end pt-1">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const textarea = overlay.querySelector('#notify-message');
    const cerrar = this._prepararModal(overlay);

    overlay.querySelector('[data-action="close"]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('[data-action="whatsapp"]').addEventListener('click', () => {
      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(textarea.value)}`, '_blank', 'noopener');
      cerrar();
    });

    overlay.querySelector('[data-action="email"]').addEventListener('click', () => {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(textarea.value)}`;
      cerrar();
    });

    overlay.querySelector('[data-action="copy"]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        this.showToast('Mensaje copiado.', 'success');
      } catch {
        textarea.select(); // respaldo si el navegador bloquea el portapapeles
        this.showToast('Selecciona y copia el mensaje manualmente.', 'error');
      }
    });
  }

  // Portada de un libro: lógica compartida con el escaneo remoto (ítem 11),
  // ver js/modules/portadas.js. Se mantienen estos métodos como envoltorios
  // finos para no tocar cada punto de la clase que ya los llama.
  _portadaUrl(libro) {
    return portadaUrl(libro);
  }

  _portadaHtml(libro) {
    return portadaHtml(libro);
  }

  _vigilarPortadas() {
    vigilarPortadas();
  }

  /**
   * Barra de paginación. Devuelve cadena vacía si todo cabe en una página,
   * para no ocupar espacio cuando no hace falta.
   */
  _paginacionHtml(pagina, total, porPagina, claseBoton) {
    const paginas = Math.ceil(total / porPagina);
    if (paginas <= 1) return '';

    const desde = pagina * porPagina + 1;
    const hasta = Math.min((pagina + 1) * porPagina, total);

    return `
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-stone-200 bg-stone-50/60">
        <p class="text-xs text-stone-500">Mostrando ${desde}–${hasta} de ${total}</p>
        <div class="flex items-center gap-1">
          <button data-page="${pagina - 1}" aria-label="Página anterior" ${pagina === 0 ? 'disabled' : ''}
            class="${claseBoton} px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 text-xs font-bold hover:border-patrimonio-lago disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-chevron-left"></i>
          </button>
          <span class="text-xs text-stone-600 px-2 tabular-nums">${pagina + 1} / ${paginas}</span>
          <button data-page="${pagina + 1}" aria-label="Página siguiente" ${pagina >= paginas - 1 ? 'disabled' : ''}
            class="${claseBoton} px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 text-xs font-bold hover:border-patrimonio-lago disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>`;
  }

  // Texto de consentimiento informado. La Ley 21.719 exige informar la
  // finalidad, el responsable y los derechos del titular ANTES de recoger
  // los datos, y poder acreditar cuándo se consintió y bajo qué versión.
  // Si se modifica el texto, hay que subir el número de versión.
  static get CONSENTIMIENTO() {
    return {
      version: '2026-07-v1',
      texto: 'Los datos que entregues se usan únicamente para administrar tus préstamos y avisarte cuando debas devolver un libro. ' +
             'El responsable es la Ilustre Municipalidad de Futrono. ' +
             'Puedes pedir acceder a tus datos, corregirlos o solicitar su eliminación en el mesón de la biblioteca. ' +
             'No se comparten con terceros ni se usan para otros fines.'
    };
  }

  _bloqueConsentimiento(prefijo = 'new') {
    const c = UIManager.CONSENTIMIENTO;
    return `
      <div class="border border-stone-300 rounded-xl p-3 bg-stone-50/60 space-y-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">Tratamiento de datos personales</p>
        <p class="text-[11px] text-stone-600 leading-relaxed">${escapeHtml(c.texto)}</p>
        <label class="flex items-start gap-2 cursor-pointer pt-1">
          <input type="checkbox" id="${prefijo}-user-consent" class="mt-0.5 accent-[#7A431D]" />
          <span class="text-[11px] text-stone-700">El lector fue informado y autoriza el uso de sus datos para este fin.</span>
        </label>
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" id="${prefijo}-user-minor" class="mt-0.5 accent-[#7A431D]" />
          <span class="text-[11px] text-stone-700">Es menor de 18 años (requiere autorización del apoderado).</span>
        </label>
        <div id="${prefijo}-guardian-fields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <input id="${prefijo}-guardian-name" aria-label="Nombre del apoderado" placeholder="Nombre del apoderado"
            class="px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago" />
          <input id="${prefijo}-guardian-rut" aria-label="RUT del apoderado" placeholder="RUT del apoderado"
            class="px-3 py-2 border border-stone-300 rounded-md bg-white text-sm font-mono focus:outline-none focus:border-patrimonio-lago" />
        </div>
      </div>`;
  }

  // Muestra los campos del apoderado solo si se marcó "es menor"
  _bindConsentimiento(prefijo = 'new') {
    const menor = document.getElementById(`${prefijo}-user-minor`);
    const campos = document.getElementById(`${prefijo}-guardian-fields`);
    menor?.addEventListener('change', () => campos?.classList.toggle('hidden', !menor.checked));
  }

  // Valida el consentimiento y devuelve los datos a guardar, o null si falta algo
  _datosConsentimiento(prefijo = 'new') {
    const consiente = document.getElementById(`${prefijo}-user-consent`)?.checked;
    if (!consiente) {
      this.showToast('Debes confirmar que el lector fue informado sobre el uso de sus datos.', 'error');
      return null;
    }
    const esMenor = document.getElementById(`${prefijo}-user-minor`)?.checked || false;
    const apoderadoNombre = document.getElementById(`${prefijo}-guardian-name`)?.value.trim() || '';
    const apoderadoRut = document.getElementById(`${prefijo}-guardian-rut`)?.value.trim() || '';

    if (esMenor) {
      if (!apoderadoNombre) {
        this.showToast('Escribe el nombre del apoderado.', 'error');
        return null;
      }
      if (!this.isValidRut(apoderadoRut)) {
        this.showToast('El RUT del apoderado no es válido.', 'error');
        return null;
      }
    }

    return {
      consentimiento_fecha: new Date().toISOString(),
      consentimiento_version: UIManager.CONSENTIMIENTO.version,
      es_menor: esMenor,
      apoderado_nombre: esMenor ? apoderadoNombre : null,
      apoderado_rut: esMenor ? this.formatRut(apoderadoRut) : null
    };
  }

  /**
   * Parámetros del sistema. La base de datos es la fuente de verdad: las
   * funciones SQL leen de la tabla `parametros`, así que la interfaz tiene que
   * leer de ahí también. Si no, un administrador cambia el límite en el panel
   * y la pantalla sigue mostrando el número viejo.
   *
   * Los valores de config.js quedan solo como respaldo, para el caso en que
   * la migración 007 aún no se haya ejecutado.
   */
  async cargarParametros() {
    try {
      const filas = await db.obtenerParametros();
      if (filas) {
        this._parametros = Object.fromEntries(filas.map(f => [f.clave, f.valor]));
      }
    } catch {
      // Si falla, se siguen usando los valores de respaldo sin interrumpir el arranque
      this._parametros = null;
    }
  }

  /**
   * Lee un parámetro numérico. Busca primero en lo cargado desde la base de
   * datos y cae al valor de config.js si no está disponible.
   */
  param(clave) {
    const respaldos = {
      max_prestamos_por_lector: CONFIG.MAX_PRESTAMOS_POR_LECTOR,
      max_renovaciones: CONFIG.MAX_RENOVACIONES,
      dias_aviso_previo: CONFIG.DIAS_AVISO_PREVIO,
      dias_prestamo: 7,
      filas_por_pagina: CONFIG.FILAS_POR_PAGINA
    };
    const valor = this._parametros?.[clave];
    const n = Number(valor);
    return Number.isFinite(n) && valor !== undefined && valor !== null && valor !== ''
      ? n
      : respaldos[clave];
  }

  /**
   * Prepara un modal para que sea accesible con teclado y lector de pantalla.
   * Exigido por el Decreto N° 1/2015, que obliga a los sitios del Estado a
   * seguir los estándares de accesibilidad de la W3C.
   *
   * Hace cuatro cosas que no se pueden lograr solo con CSS:
   *   - Lo anuncia como diálogo y lo asocia a su título.
   *   - Atrapa el foco dentro: con Tab no se puede salir por detrás.
   *   - Cierra con Escape.
   *   - Devuelve el foco al elemento que lo abrió, para no perder el lugar.
   *
   * Devuelve la función de cierre, que se debe usar en vez de overlay.remove().
   */
  _prepararModal(overlay, { titulo, alCerrar } = {}) {
    const focoAnterior = document.activeElement;
    const caja = overlay.firstElementChild;

    // Semántica de diálogo
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    // Se asocia el título para que el lector de pantalla lo anuncie al abrir
    const encabezado = caja?.querySelector('h1, h2, h3');
    if (encabezado) {
      if (!encabezado.id) {
        encabezado.id = `modal-titulo-${Math.random().toString(36).slice(2, 9)}`;
      }
      overlay.setAttribute('aria-labelledby', encabezado.id);
    } else if (titulo) {
      overlay.setAttribute('aria-label', titulo);
    }

    const enfocables = () => [...overlay.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter(el => el.offsetParent !== null || el === document.activeElement);

    const alTeclear = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrar();
        return;
      }
      if (e.key !== 'Tab') return;

      // Trampa de foco: al llegar al último elemento, Tab vuelve al primero
      const lista = enfocables();
      if (lista.length === 0) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    const cerrar = () => {
      document.removeEventListener('keydown', alTeclear, true);
      overlay.remove();
      // Se devuelve el foco a donde estaba, si ese elemento sigue en la página
      if (focoAnterior && document.body.contains(focoAnterior)) {
        focoAnterior.focus();
      }
      alCerrar?.();
    };

    document.addEventListener('keydown', alTeclear, true);

    // El foco entra al modal: primero a un campo de texto si hay, si no al primer botón
    setTimeout(() => {
      const campo = overlay.querySelector('input:not([readonly]):not([type="checkbox"]), textarea');
      (campo || enfocables()[0])?.focus();
    }, 20);

    return cerrar;
  }

  /**
   * Cierra la sesión tras un período sin actividad.
   *
   * En el mesón de una biblioteca el computador queda desatendido con nombres,
   * RUT y teléfonos de vecinos en pantalla. Es una medida de seguridad
   * razonable para un sistema municipal que trata datos personales.
   *
   * Avisa un minuto antes para que nadie pierda lo que está escribiendo.
   */
  iniciarControlDeInactividad(minutos = 20) {
    const msLimite = minutos * 60 * 1000;
    const msAviso = msLimite - 60 * 1000;
    let temporizadorAviso, temporizadorCierre, avisoVisible = false;

    const limpiarAviso = () => {
      document.getElementById('aviso-inactividad')?.remove();
      avisoVisible = false;
    };

    const mostrarAviso = () => {
      if (avisoVisible) return;
      avisoVisible = true;
      const aviso = document.createElement('div');
      aviso.id = 'aviso-inactividad';
      aviso.setAttribute('role', 'alert');
      aviso.className = 'fixed bottom-5 left-5 z-[10001] max-w-xs bg-patrimonio-card border-2 border-amber-400 rounded-xl shadow-2xl p-4';
      aviso.innerHTML = `
        <p class="text-sm font-bold text-stone-900 mb-1">
          <i aria-hidden="true" class="fas fa-clock text-amber-700 mr-1.5"></i>Sesión por cerrarse
        </p>
        <p class="text-xs text-stone-600">Por seguridad, la sesión se cerrará en un minuto por inactividad.</p>
        <button id="seguir-activo-btn" class="btn-madera mt-3 w-full text-white rounded-lg py-2 text-xs font-bold">
          Seguir trabajando
        </button>`;
      document.body.appendChild(aviso);
      document.getElementById('seguir-activo-btn').addEventListener('click', reiniciar);
    };

    const reiniciar = () => {
      clearTimeout(temporizadorAviso);
      clearTimeout(temporizadorCierre);
      limpiarAviso();
      temporizadorAviso = setTimeout(mostrarAviso, msAviso);
      temporizadorCierre = setTimeout(async () => {
        this.showToast('Sesión cerrada por inactividad.', 'error');
        await auth.logout();
      }, msLimite);
    };

    // Cualquier señal de que hay alguien usando el sistema reinicia la cuenta.
    // passive: true evita que estos escuchadores afecten el desplazamiento.
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evento => {
      document.addEventListener(evento, () => {
        // Si el aviso está visible, solo lo quita el botón: así nadie pierde la
        // sesión por un roce accidental sin haberse dado cuenta del aviso.
        if (!avisoVisible) reiniciar();
      }, { passive: true });
    });

    reiniciar();
    this._controlInactividadActivo = true;
  }

  _isDuplicateScan(code) {
    const now = Date.now();
    if (code === this._lastScannedCode && now - this._lastScanTimestamp < 3000) return true;
    this._lastScannedCode = code;
    this._lastScanTimestamp = now;
    return false;
  }

  // ==========================================
  // NAVEGACIÓN Y LAYOUT
  // ==========================================
  async updateUserInfo(user) {
    // Primero se intenta el perfil completo (migración 008): trae el rol y,
    // además, el nombre real de la persona. Si esa migración no está aplicada,
    // se cae al camino anterior, que solo consulta el rol.
    this._perfil = null;
    try {
      this._perfil = await db.miPerfil();
    } catch (e) {
      console.warn('No se pudo cargar el perfil:', e.message);
    }

    this.currentUserEmail = this._perfil?.email || user.email || '';
    this.currentUserName = this._perfil?.nombre || '';

    // La fila de `usuarios` es la fuente de verdad.
    this.currentUserRole = this._perfil?.rol || await auth.getUserRole(user);

    // Respaldo por correo. Hace falta porque mi_perfil() crea la fila que falte
    // con el rol de menor privilegio, y eso solo deja un punto muerto: para
    // asignar el rol admin hay que ser admin. Si el primero todavía no existe,
    // nadie puede crearlo desde dentro del sistema.
    //
    // Cuando el respaldo se activa, la pantalla y el servidor NO coinciden: se
    // ve el panel de administración, pero cada acción la rechaza Postgres. Por
    // eso además se avisa en pantalla, en vez de dejar que la persona choque
    // con una seguidilla de errores sin explicación.
    this.desajusteDeRol = false;
    if (this.currentUserRole !== 'admin' && auth.esAdminPorCorreo(this.currentUserEmail)) {
      this.currentUserRole = 'admin';
      this.desajusteDeRol = true;
      console.warn(
        `El correo ${this.currentUserEmail} figura en CONFIG.ADMIN_EMAILS, pero su fila ` +
        'en la tabla "usuarios" no dice admin. Se muestra la interfaz de administrador, ' +
        'pero el servidor rechazará las acciones hasta que el rol quede asignado en la base de datos.'
      );
    }

    const roleInfo = CONFIG.ROLE_LABELS[this.currentUserRole] || CONFIG.ROLE_LABELS.librero;

    const nameEl = document.getElementById('current-user-name');
    const subEl = document.getElementById('current-user-sub');
    const badgeEl = document.getElementById('current-user-badge');
    const inicialEl = document.getElementById('current-user-initial');

    // Se muestra el nombre si lo hay; el correo pasa a segunda línea.
    if (nameEl) nameEl.textContent = this.currentUserName || this.currentUserEmail;
    if (subEl) subEl.textContent = this.currentUserName ? this.currentUserEmail : '';
    if (badgeEl) badgeEl.textContent = this._perfil?.cargo || roleInfo.title;
    if (inicialEl) {
      const base = this.currentUserName || this.currentUserEmail || '?';
      inicialEl.textContent = base.trim().charAt(0).toUpperCase();
    }
  }

  /** Nombre con el que se saluda a la persona en el Dashboard. */
  _nombreParaSaludo() {
    if (this.currentUserName) return this.currentUserName.split(/\s+/)[0];
    const roleInfo = CONFIG.ROLE_LABELS[this.currentUserRole] || CONFIG.ROLE_LABELS.librero;
    return roleInfo.title;
  }

  // Menú lateral agrupado por secciones (Panel / Gestión / Operación) y
  // adaptado al rol real del usuario, para que cada perfil vea solo lo
  // que necesita en su trabajo diario.
  renderNavMenu() {
    const nav = document.getElementById('nav-menu');
    if (!nav) return;

    const views = CONFIG.VIEWS_BY_ROLE[this.currentUserRole] || CONFIG.VIEWS_BY_ROLE.librero;

    // Agrupamos manteniendo el orden de aparición de cada sección
    const sections = [];
    views.forEach(v => {
      const section = v.section || 'General';
      let group = sections.find(s => s.name === section);
      if (!group) {
        group = { name: section, items: [] };
        sections.push(group);
      }
      group.items.push(v);
    });

    nav.innerHTML = sections.map(group => `
      <div class="mb-5">
        <p class="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-stone-500">${escapeHtml(group.name)}</p>
        <div class="space-y-0.5">
          ${group.items.map(v => `
            <button
              data-view="${v.id}"
              class="nav-btn w-full px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition text-stone-300 hover:bg-white/10 hover:text-white"
            >
              <i aria-hidden="true" class="fas ${v.icon} w-4 text-center ${v.id === 'scanner' ? 'text-amber-400' : ''}"></i>
              <span>${escapeHtml(v.label)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    nav.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView(btn.dataset.view);
        // En móvil, cerramos el menú lateral tras elegir una vista
        document.getElementById('sidebar')?.classList.remove('active');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
      });
    });
  }

  _setActiveNavButton(viewName) {
    document.querySelectorAll('#nav-menu .nav-btn').forEach(btn => {
      const active = btn.dataset.view === viewName;
      btn.classList.toggle('bg-patrimonio-madera', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('text-stone-300', !active);
    });
  }

  async switchView(viewName) {
    // Si veníamos de la vista de escáner y nos vamos a otra, apagamos la cámara
    if (this.currentView === 'scanner' && viewName !== 'scanner') {
      Scanner.stop();
    }

    this.currentView = viewName;
    this._setActiveNavButton(viewName);
    
    // El título de la franja superior sale de la misma definición que el menú, para que nunca queden desincronizados
    const views = CONFIG.VIEWS_BY_ROLE[this.currentUserRole] || CONFIG.VIEWS_BY_ROLE.librero;
    const viewDef = views.find(v => v.id === viewName);

    const title = document.getElementById('page-title');
    if (title) title.textContent = viewDef?.label || 'Dashboard';

    // Loader mientras busca en BD
    const container = this._container();
    if(container) container.innerHTML = `<div class="flex justify-center py-20"><i aria-hidden="true" class="fas fa-circle-notch fa-spin text-4xl text-patrimonio-lago"></i></div>`;

    const renderers = {
      dashboard: () => this.renderDashboard(),
      reports: () => this.renderReports(),
      catalog: () => this.renderCatalog(),
      users: () => this.renderUsers(),
      loans: () => this.renderLoans(),
      scanner: () => this.renderScannerView(),
      admin: () => this.renderAdmin(),
      profile: () => this.renderProfile()
    };
    
    try {
        await (renderers[viewName] || renderers.dashboard)();
    } catch (e) {
        // Se muestra la causa real: "Error cargando vista" no le sirve a nadie
        // del mesón para saber si es la conexión, un permiso o una migración.
        console.error(`Fallo al cargar la vista "${viewName}":`, e);
        registroErrores.registrarOperacion(`cargar la vista ${viewName}`, e);
        if (container) container.innerHTML = `
          <div class="catalog-card bg-patrimonio-card rounded-2xl border border-rose-300 p-6 max-w-lg">
            <p class="font-serif font-semibold text-lg text-stone-900 mb-1">No se pudo cargar esta sección</p>
            <p class="text-sm text-stone-600">${escapeHtml(e?.message || 'Error desconocido.')}</p>
            <button id="retry-view-btn" class="btn-madera mt-4 text-white rounded-xl px-4 py-2 text-sm font-medium">
              <i aria-hidden="true" class="fas fa-rotate-right mr-1.5"></i> Reintentar
            </button>
          </div>`;
        document.getElementById('retry-view-btn')?.addEventListener('click', () => this.switchView(viewName));
    }
  }

  _container() {
    return document.getElementById('views-container');
  }

  // ==========================================
  // ARRANQUE DE LA APLICACIÓN (SHELL / LOGIN)
  // ==========================================
  // Determina el momento del día real del dispositivo, para pintar la
  // escena del Lago Ranco (amanecer / día / atardecer / noche).
  // ==========================================
  _momentoDelDia() {
    const h = new Date().getHours();
    if (h >= 5 && h < 9) return 'amanecer';
    if (h >= 9 && h < 18) return 'dia';
    if (h >= 18 && h < 20) return 'atardecer';
    return 'noche';
  }

  /**
   * Pantalla donde se fija la contraseña nueva.
   * Es el destino del enlace que llega por correo: sin ella, el usuario hacía
   * clic y volvía a la pantalla de ingreso sin poder cambiar nada.
   */
  renderNuevaPassword() {
    const momento = this._momentoDelDia();
    document.body.innerHTML = `
      <div class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div id="login-scene" class="momento-${momento}" aria-hidden="true">
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
    `;

    document.getElementById('new-password-form').addEventListener('submit', async e => {
      e.preventDefault();
      const p1 = document.getElementById('np-1').value;
      const p2 = document.getElementById('np-2').value;

      if (p1.length < 8) {
        this.showToast('La contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }
      if (p1 !== p2) {
        this.showToast('Las dos contraseñas no coinciden.', 'error');
        return;
      }

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await auth.actualizarPassword(p1);
        this.showToast('Contraseña guardada. Ya puedes entrar.', 'success');
        // Se limpia el token del enlace para que recargar no reabra esta pantalla
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        this.showToast(err.message || 'No se pudo guardar la contraseña.', 'error');
        btn.disabled = false;
      }
    });
  }

  /**
   * Pantalla que ve quien acepta una invitación desde
   * Administración → Personal (ver `esEnlaceDeInvitacion()` en `main.js`).
   *
   * La cuenta ya existe en Supabase Auth y ya tiene rol asignado en
   * `public.usuarios` — eso lo hizo el Edge Function `invitar-personal` al
   * momento de invitar, no ahora. Lo que falta es lo que nadie puso todavía:
   * una contraseña (la cuenta se creó sin una) y el nombre/cargo de la
   * persona. Sin esta pantalla, aceptar la invitación entraría directo al
   * panel con el perfil en blanco y sin contraseña para volver a entrar
   * después si cierra la sesión.
   *
   * Reutiliza `actualizar_mi_perfil()` (RPC de la migración 008, la misma que
   * usa "Mis datos" en Mi perfil) — nada de esquema nuevo.
   */
  renderCompletarInvitacion() {
    const momento = this._momentoDelDia();
    document.body.innerHTML = `
      <div class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        <div id="login-scene" class="momento-${momento}" aria-hidden="true">
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
    `;

    document.getElementById('completar-invitacion-form').addEventListener('submit', async e => {
      e.preventDefault();
      const nombre = document.getElementById('ci-nombre').value.trim();
      const cargo = document.getElementById('ci-cargo').value.trim();
      const p1 = document.getElementById('ci-pass-1').value;
      const p2 = document.getElementById('ci-pass-2').value;

      if (!nombre) {
        this.showToast('Escribe tu nombre completo.', 'error');
        return;
      }
      if (nombre.split(/\s+/).length < 2) {
        this.showToast('Escribe tu nombre y al menos un apellido.', 'error');
        return;
      }
      if (p1.length < 8) {
        this.showToast('La contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }
      if (!/[A-Z]/.test(p1)) {
        this.showToast('La contraseña debe tener al menos una letra mayúscula.', 'error');
        return;
      }
      if (!/[0-9]/.test(p1)) {
        this.showToast('La contraseña debe tener al menos un número.', 'error');
        return;
      }
      if (p1 !== p2) {
        this.showToast('Las dos contraseñas no coinciden.', 'error');
        return;
      }

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await auth.actualizarPassword(p1);

        try {
          await db.actualizarMiPerfil({ nombre, cargo: cargo || null, telefono: null });
        } catch (errPerfil) {
          // La contraseña ya quedó puesta — la cuenta funciona. No hay que
          // dejar a la persona sin poder entrar solo porque el nombre no se
          // guardó; lo completa después desde "Mi perfil".
          registroErrores.registrarOperacion('completar-invitacion', errPerfil);
        }

        this.showToast('Cuenta activada. Bienvenido/a a BiblioNexo.', 'success');
        // Se limpia el token del enlace para que recargar no reabra esta pantalla
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        this.showToast(err.message || 'No se pudo activar la cuenta.', 'error');
        btn.disabled = false;
      }
    });
  }

  renderLogin() {
    const momento = this._momentoDelDia();

    document.body.innerHTML = `
      <div id="login-screen" class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">

        <!-- Escena viva del Lago Ranco: cielo, sol/luna y cordillera cambian con la hora real -->
        <div id="login-scene" class="momento-${momento}" aria-hidden="true">
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
        </div>
      </div>
      <div id="toast-container" role="status" aria-live="polite" aria-atomic="false" class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"></div>
    `;
    this.initLoginForm();

    document.getElementById('google-login-btn').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        await auth.loginWithGoogle();
        // Supabase redirige a Google; si falla antes de redirigir, avisamos.
      } catch (err) {
        this.showToast(err.message || 'No se pudo iniciar sesión con Google.', 'error');
        btn.disabled = false;
      }
    });

    document.getElementById('forgot-password-btn').addEventListener('click', async () => {
      const email = await this.showPrompt('Ingresa el correo de tu cuenta institucional para recibir el enlace de recuperación.', {
        title: 'Recuperar contraseña', placeholder: 'nombre@futrono.cl', confirmText: 'Enviar enlace'
      });
      if (!email) return;
      if (!this.isValidEmail(email)) {
        this.showToast('Ingresa un correo válido.', 'error');
        return;
      }
      try {
        await auth.resetPassword(email);
        this.showToast('Si el correo existe, recibirás un enlace para recuperar tu contraseña.', 'success');
      } catch (err) {
        this.showToast(err.message || 'No se pudo enviar el correo.', 'error');
      }
    });
  }

  async renderShell(user) {
    document.body.innerHTML = `
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
    `;

    document.getElementById('logout-btn').addEventListener('click', () => auth.logout());
    document.getElementById('perfil-btn').addEventListener('click', () => this.switchView('profile'));

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    document.getElementById('sidebar-toggle-btn').addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('hidden');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.add('hidden');
    });

    // El registro de errores necesita saber en qué vista está la persona, para
    // que el informe diga "Mesón" y no una URL.
    registroErrores.iniciar(() => this.currentView);
    this._vigilarPortadas();

    // Indicador de conexión (Fase 1.4): se des-suscribe primero por si
    // renderShell se está corriendo de nuevo (cerrar sesión y volver a
    // entrar sin recargar la página) — si no, cada vuelta dejaría un
    // escuchador de más, todos escribiendo sobre el mismo elemento actual.
    this._detenerEstadoConexion?.();
    this._detenerEstadoConexion = estadoConexion.suscribir(estado => this._renderIndicadorConexion(estado));

    await this.cargarParametros();
    if (!this._controlInactividadActivo) this.iniciarControlDeInactividad();
    await this.updateUserInfo(user);
    this.renderNavMenu();

    await this.switchView(this._vistaInicial(this.currentUserRole));
  }

  /**
   * Dibuja el indicador de conexión de la franja de título (Fase 1.4), con
   * las cuatro situaciones que pide PROMPT-produccion.md §7: en línea, sin
   * conexión, sincronizando, N pendientes. Prioridad de arriba a abajo
   * cuando hay más de una a la vez — "sin conexión" es lo más urgente que
   * la persona del mesón necesita saber, y se combina con el conteo de
   * pendientes si hay alguno, en vez de ocultarlo.
   *
   * No depende solo del color (ver WCAG en `design:accessibility-review`):
   * cada estado trae su propio ícono y texto, nunca solo un punto de color.
   */
  _renderIndicadorConexion({ enLinea, sincronizando, pendientes } = {}) {
    const el = document.getElementById('estado-conexion');
    if (!el) return; // la franja de título no está montada (por ejemplo, en pantallas de login)

    const plural = pendientes === 1 ? 'pendiente' : 'pendientes';
    let clase, icono, texto;

    if (!enLinea) {
      clase = 'bg-rose-100 text-rose-800';
      icono = 'fa-triangle-exclamation';
      texto = pendientes > 0 ? `Sin conexión · ${pendientes} ${plural}` : 'Sin conexión';
    } else if (sincronizando) {
      clase = 'bg-patrimonio-lago/10 text-patrimonio-lago';
      icono = 'fa-arrows-rotate fa-spin';
      texto = 'Sincronizando…';
    } else if (pendientes > 0) {
      clase = 'bg-amber-100 text-amber-800';
      icono = 'fa-clock';
      texto = `${pendientes} ${plural}`;
    } else {
      clase = 'bg-emerald-100 text-emerald-800';
      icono = 'fa-circle-check';
      texto = 'En línea';
    }

    el.className = `ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${clase}`;
    el.innerHTML = `<i aria-hidden="true" class="fas ${icono}"></i><span>${escapeHtml(texto)}</span>`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', `Estado de conexión: ${texto}`);
  }

  /**
   * Con qué vista abrir la primera vez.
   *
   * Normalmente es la primera de CONFIG.VIEWS_BY_ROLE. El QR de acceso
   * remoto (ver showQrRemotoModal) codifica "?vista=scanner" en el enlace
   * para abrir directo en el escáner en vez de aterrizar en el Dashboard y
   * obligar a navegar con el celular. Se valida contra las vistas que ese
   * rol puede ver de verdad: un id inventado, mal escrito, o de una vista
   * sin permiso para ese rol, simplemente se ignora y cae a la de siempre.
   */
  _vistaInicial(rol) {
    const vistasDelRol = CONFIG.VIEWS_BY_ROLE[rol] || CONFIG.VIEWS_BY_ROLE.librero;
    const vistaPedida = new URLSearchParams(window.location.search).get('vista');
    return vistasDelRol.some(v => v.id === vistaPedida) ? vistaPedida : vistasDelRol[0].id;
  }

  // Dibuja un gráfico de anillo con leyenda propia (número + porcentaje).
  // Se usa leyenda propia en vez de la de Chart.js porque necesitamos mostrar
  // las tres cosas juntas: etiqueta, cantidad y participación sobre el total.
  async _renderDonut(canvasId, legendId, segmentos) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const host = canvas.parentElement;

    try {
      await loadChartJs();
    } catch (e) {
      host.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center gap-2 text-center">
          <p class="text-sm text-stone-500">No se pudo cargar el gráfico.</p>
          <button class="retry-chart-btn text-xs font-bold text-patrimonio-lago hover:underline">
            <i aria-hidden="true" class="fas fa-rotate-right mr-1"></i> Reintentar
          </button>
        </div>`;
      host.querySelector('.retry-chart-btn')?.addEventListener('click', () => {
        chartJsPromise = null;
        host.innerHTML = `<canvas id="${canvasId}"></canvas>`;
        this._renderDonut(canvasId, legendId, segmentos);
      });
      return;
    }

    if (!document.getElementById(canvasId)) return; // la vista cambió mientras cargaba

    const total = segmentos.reduce((s, x) => s + x.valor, 0);
    const pct = v => total === 0 ? 0 : Math.round((v / total) * 1000) / 10;

    // Si no hay datos, mostramos un anillo gris en vez de un canvas vacío
    const hayDatos = total > 0;

    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
      delete chartInstances[canvasId];
    }

    chartInstances[canvasId] = new window.Chart(document.getElementById(canvasId).getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: segmentos.map(s => s.etiqueta),
        datasets: [{
          data: hayDatos ? segmentos.map(s => s.valor) : [1],
          backgroundColor: hayDatos ? segmentos.map(s => s.color) : ['#E7E5E4'],
          borderColor: '#FFFFFF',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: hayDatos,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} (${pct(ctx.parsed)}%)`
            },
            titleFont: { family: 'Plus Jakarta Sans' },
            bodyFont: { family: 'Plus Jakarta Sans' }
          }
        }
      }
    });

    // Total al centro del anillo
    const centro = document.getElementById(`${canvasId}-centro`);
    if (centro) centro.innerHTML = `
      <span class="block font-serif font-bold text-3xl text-stone-900 leading-none">${total}</span>
      <span class="block text-[10px] uppercase tracking-widest text-stone-500 mt-1">Total</span>`;

    // Leyenda con cantidad y porcentaje
    const legend = document.getElementById(legendId);
    if (legend) legend.innerHTML = segmentos.map(s => `
      <div class="flex items-center gap-2.5 py-1.5">
        <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${s.color}"></span>
        <span class="text-xs text-stone-600 flex-1 truncate">${escapeHtml(s.etiqueta)}</span>
        <span class="text-xs font-bold text-stone-900 tabular-nums">${s.valor}</span>
        <span class="text-[11px] text-stone-500 tabular-nums w-12 text-right">${pct(s.valor)}%</span>
      </div>
    `).join('');
  }

  // Dispara la descarga de un archivo generado en el navegador.
  // Compartido por Reportes (respaldo, CSV) y Administración → Cumplimiento
  // (exportación de datos de un lector, evidencia de incidente).
  _descargar(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Aviso reutilizable cuando falta una migración. Devuelve HTML ya seguro
  // (plantilla html), así que se puede anidar dentro de otra plantilla html
  // sin volver a escaparse, o asignarse directo a innerHTML.
  _avisoMigracion(numero, archivo) {
    return html`
      <div class="catalog-card bg-patrimonio-card rounded-2xl border border-stone-300 p-6 max-w-xl">
        <h3 class="font-serif font-semibold text-lg text-stone-900 mb-2">Falta un paso en la base de datos</h3>
        <p class="text-sm text-stone-600">
          Esta herramienta necesita la migración ${numero}. Abre el editor SQL de Supabase y ejecuta
          <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">${archivo}</code>,
          luego vuelve aquí.
        </p>
      </div>`;
  }

  // Engancha los botones de página de una tabla
  _bindPaginacion(container, selector, alCambiar) {
    container.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.hasAttribute('disabled')) return;
        alCambiar(Number(btn.dataset.page));
      });
    });
  }
}

export default UIManager;
