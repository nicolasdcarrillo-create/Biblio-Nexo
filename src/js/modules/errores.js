import { supabase } from '../supabase-init.js';

/**
 * Registro de errores.
 *
 * Atrapa lo que falla en el navegador y lo guarda en la base de datos del
 * propio proyecto, para que un fallo en el mesón un martes por la tarde no
 * dependa de que alguien se acuerde de llamar por teléfono.
 *
 * Tres reglas de diseño, todas por el mismo motivo — que aquí se trabaja con
 * datos personales de vecinos:
 *
 *   1. No sale nada hacia terceros. Se escribe en Supabase, no en un servicio
 *      de monitoreo externo.
 *   2. No se envía el contenido de la pantalla, ni la URL completa, ni ningún
 *      dato de un lector. Solo el mensaje del fallo, la vista y la acción.
 *   3. Si el registro falla, se calla. Un sistema de monitoreo que interrumpe
 *      el trabajo por no poder monitorear es peor que no tenerlo.
 */

// Mensajes que no aportan nada y solo generan ruido
const IGNORAR = [
  /ResizeObserver loop/i,
  /Script error\.?$/i,          // errores de origen cruzado, sin detalle útil
  /Non-Error promise rejection/i,
  /Failed to fetch.*openlibrary/i, // portada no encontrada: ya se maneja en pantalla
  /AbortError/i,
  /play\(\) failed/i             // el navegador bloqueó el pitido, es inofensivo
];

// Datos que nunca deben llegar a la bitácora, por si aparecen en un mensaje
const REDACTAR = [
  { patron: /\b\d{7,8}-[0-9kK]\b/g, por: '[RUT]' },
  { patron: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, por: '[correo]' },
  { patron: /\b(?:\+?56)?9\d{8}\b/g, por: '[teléfono]' },
  { patron: /eyJ[A-Za-z0-9_-]{10,}/g, por: '[token]' }
];

function limpiar(texto) {
  let t = (texto ?? '').toString();
  REDACTAR.forEach(({ patron, por }) => { t = t.replace(patron, por); });
  return t;
}

/** Navegador y tamaño de pantalla, sin nada que identifique a una persona. */
function navegador() {
  const ua = navigator.userAgent || '';
  const nombre =
    /Edg\//.test(ua) ? 'Edge' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' : 'Otro';
  const sistema =
    /Windows/.test(ua) ? 'Windows' :
    /Android/.test(ua) ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS' :
    /Mac OS/.test(ua) ? 'macOS' :
    /Linux/.test(ua) ? 'Linux' : 'Otro';
  return `${nombre} · ${sistema} · ${window.innerWidth}×${window.innerHeight}`;
}

class RegistroDeErrores {
  constructor() {
    this.activo = false;
    this.disponible = true;   // se apaga si falta la migración 009
    this.cola = [];
    this.enviando = false;
    this._recientes = new Map(); // huella -> instante, para no repetir en ráfaga
    this.obtenerVista = () => null;
  }

  /**
   * Empieza a escuchar. Recibe una función que dice en qué vista está la
   * persona, para que el informe sea útil sin tener que mirar la URL.
   *
   * Se puede llamar más de una vez: la primera vez engancha los escuchadores,
   * las siguientes solo actualizan el localizador de vista. Así main.js puede
   * activarlo apenas arranca la aplicación —antes de que exista una sesión—
   * y ui.js puede después afinarlo para que el informe diga "Mesón" en vez
   * de "arranque", sin duplicar ningún escuchador.
   */
  iniciar(obtenerVista) {
    if (typeof obtenerVista === 'function') this.obtenerVista = obtenerVista;
    if (this.activo) return;
    this.activo = true;

    window.addEventListener('error', evento => {
      // Los fallos de carga de imágenes llegan aquí y no son fallos del sistema
      if (evento.target && evento.target !== window) return;
      this.registrar(evento.message, {
        detalle: `${evento.filename || ''}:${evento.lineno || 0}\n${evento.error?.stack || ''}`
      });
    });

    window.addEventListener('unhandledrejection', evento => {
      const motivo = evento.reason;
      this.registrar(motivo?.message || String(motivo), {
        detalle: motivo?.stack || '',
        accion: 'promesa sin capturar'
      });
    });

    // Al cerrar la pestaña se intenta vaciar lo que quede pendiente
    window.addEventListener('pagehide', () => { this._vaciar(); });
  }

  /**
   * Registra un fallo. `accion` es lo que la persona estaba haciendo, en
   * palabras: "registrar préstamo", "guardar lector".
   */
  registrar(mensaje, { detalle = '', accion = null, origen = 'js' } = {}) {
    if (!this.disponible || !supabase) return;

    const texto = limpiar(mensaje);
    if (!texto || IGNORAR.some(r => r.test(texto))) return;

    // Un fallo en bucle no debe generar cien envíos: se agrupa por 30 segundos
    const huella = `${texto}|${this.obtenerVista() || ''}`;
    const ahora = Date.now();
    if (ahora - (this._recientes.get(huella) || 0) < 30000) return;
    this._recientes.set(huella, ahora);
    if (this._recientes.size > 50) this._recientes.clear();

    this.cola.push({
      p_mensaje: texto.slice(0, 500),
      p_origen: origen,
      p_detalle: limpiar(detalle).slice(0, 2000),
      p_vista: this.obtenerVista(),
      p_accion: accion,
      p_navegador: navegador()
    });
    this._vaciar();
  }

  /** Atajo para operaciones que fallaron con un error ya capturado. */
  registrarOperacion(accion, error) {
    this.registrar(error?.message || String(error), {
      origen: 'operacion',
      accion,
      detalle: error?.stack || ''
    });
  }

  async _vaciar() {
    if (this.enviando || this.cola.length === 0) return;
    this.enviando = true;
    try {
      while (this.cola.length) {
        const informe = this.cola.shift();
        const { error } = await supabase.rpc('registrar_error', informe);
        if (error) {
          // Si la función no existe, falta la migración: se deja de intentar
          // en vez de repetir un fallo en cada error posterior.
          const noExiste = error.code === '42883' || error.code === 'PGRST202' ||
                           /function .* does not exist|could not find/i.test(error.message || '');
          if (noExiste) {
            this.disponible = false;
            this.cola = [];
            console.warn('Registro de errores desactivado: falta ejecutar la migración 009.');
          }
          break;
        }
      }
    } catch {
      // El registro nunca interrumpe el trabajo
    } finally {
      this.enviando = false;
    }
  }
}

export default new RegistroDeErrores();
