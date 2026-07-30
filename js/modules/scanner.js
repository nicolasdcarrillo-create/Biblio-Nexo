/**
 * Lector de códigos de barras del mesón.
 *
 * Dos correcciones importantes respecto de la versión anterior:
 *
 * 1) La cámara no volvía a encender. `clear()` desmonta la instancia de
 *    Html5QrcodeScanner y la deja inservible, pero se guardaba igual en
 *    `this.scanner`. Al volver a la vista Mesón y pulsar "Iniciar cámara", se
 *    llamaba `render()` sobre un objeto ya desmontado y no pasaba nada, sin
 *    mensaje de error. Para la persona del mesón el escáner simplemente dejaba
 *    de funcionar hasta recargar la página. Ahora la instancia se descarta.
 *
 * 2) El pitido apuntaba a `assets/sounds/beep.ogg`, un archivo que no existe en
 *    el proyecto. Cada lectura pedía un archivo inexistente. Se reemplaza por
 *    un tono generado con la API de audio del navegador: no hay archivo que
 *    falte, ni petición de red, ni problema con la política de seguridad.
 *
 * 3) La librería de escaneo pesa 368 KB y se cargaba en el arranque, en todas
 *    las vistas. Quien nunca abre el Mesón la descargaba igual. Ahora se pide
 *    solo al encender la cámara, igual que se hace con Chart.js.
 */

// Carga diferida de html5-qrcode. Se guarda la promesa para que dos llamadas
// seguidas no inserten el script dos veces.
let promesaLibreria = null;
function cargarLibreria() {
  if (typeof window.Html5QrcodeScanner === 'function') return Promise.resolve();
  if (promesaLibreria) return promesaLibreria;
  promesaLibreria = new Promise((resolver, rechazar) => {
    const script = document.createElement('script');
    script.src = 'vendor/js/html5-qrcode.min.js';
    script.onload = () => resolver();
    script.onerror = () => {
      promesaLibreria = null; // permite reintentar
      rechazar(new Error('No se pudo cargar el módulo de escaneo.'));
    };
    document.head.appendChild(script);
  });
  return promesaLibreria;
}
class ScannerManager {
    constructor() {
        this.scanner = null;
        this.activo = false;
        this._audioCtx = null;
    }

    /** Tono corto de confirmación, generado en el momento. */
    _pitido() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            // Un solo contexto reutilizado: crear uno por lectura los agota.
            this._audioCtx = this._audioCtx || new Ctx();
            const ctx = this._audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const vol = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            vol.gain.setValueAtTime(0.0001, ctx.currentTime);
            vol.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
            vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            osc.connect(vol).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.13);
        } catch {
            // El pitido es una comodidad, nunca un motivo para interrumpir la lectura
        }
    }

    async start(onSuccess, onError) {
        const contenedor = document.getElementById('reader');
        if (!contenedor) return onError?.('El área de la cámara no está lista.');
        if (this.activo) return; // ya está encendida

        try {
            await cargarLibreria();
        } catch (e) {
            return onError?.(e.message);
        }

        // La vista pudo cambiar mientras se descargaba la librería
        if (!document.getElementById('reader')) return;

        try {
            this.scanner = new window.Html5QrcodeScanner(
                'reader',
                { fps: 10, qrbox: { width: 250, height: 100 } },
                false
            );
            this.activo = true;
            this.scanner.render(
                text => {
                    this._pitido();
                    onSuccess(text);
                },
                // Se llama en cada cuadro sin código detectado: no es un error real
                () => {}
            );
        } catch (e) {
            this.activo = false;
            this.scanner = null;
            onError?.('No se pudo encender la cámara: ' + (e?.message || 'error desconocido'));
        }
    }

    stop() {
        if (!this.scanner) return;
        const instancia = this.scanner;
        // Se descarta ANTES de limpiar, para que un fallo de clear() no deje
        // una instancia muerta bloqueando el próximo encendido.
        this.scanner = null;
        this.activo = false;
        try {
            instancia.clear().catch(() => {});
        } catch {
            /* la instancia ya estaba desmontada */
        }
    }
}

export default new ScannerManager();
