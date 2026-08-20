import { colaSync } from './db.js';

/**
 * Estado de conexión (Fase 1.4 — el último tramo de "funcionamiento sin
 * conexión", ver PROMPT-produccion.md §7).
 *
 * Junta, en un solo lugar visible para la persona del mesón, tres datos que
 * ya existían dispersos desde las Fases 1.2 y 1.3 pero nunca se mostraban
 * en pantalla:
 *
 *   - si el NAVEGADOR está en línea (navigator.onLine, más los eventos
 *     "online"/"offline" — esto es "¿este equipo tiene red?", no "¿el
 *     préstamo ya se guardó en el servidor?").
 *   - si la cola de sincronización (Fase 1.3, `colaSync` en db.js) está
 *     reintentando AHORA MISMO — "sincronizando".
 *   - cuántas operaciones quedan pendientes en esa cola.
 *
 * Deliberadamente NO decide nada por su cuenta ni duplica ninguna lógica de
 * sincronización: solo escucha lo que ya pasa (`colaSync.alCambiar()`, los
 * eventos del navegador) y reenvía el estado a quien esté suscrito — en
 * este caso, el indicador de la franja de título (ver
 * `UIManager.prototype.renderShell` en `ui-base.js`). Si algún día hay más
 * de un consumidor (por ejemplo, un resumen en el panel de Diagnóstico),
 * este módulo ya está preparado: `suscribir()` admite cualquier número de
 * escuchas.
 *
 * "Sincronizando" refleja solo la actividad de `colaSync` (reintentar
 * escrituras pendientes), no la sincronización de catálogo en segundo plano
 * de `persistencia.js` — esa última corre cada 5 minutos y es demasiado
 * frecuente y silenciosa como para que valga la pena interrumpir a nadie
 * con un aviso cada vez. Lo que de verdad le importa a quien está en el
 * mesón es saber si HAY algo que la app está tratando de terminar de
 * guardar ahora mismo, no que el catálogo se refrescó solo.
 */
class EstadoConexion {
    constructor() {
        this._enLinea = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
        this._sincronizando = false;
        this._pendientes = 0;
        this._escuchas = new Set();
        this._iniciado = false;
    }

    /**
     * Engancha los escuchadores reales. Se puede llamar más de una vez sin
     * problema (solo la primera hace algo) — así cualquier parte de la
     * aplicación que dependa de este módulo lo puede "asegurar iniciado"
     * sin tener que coordinarse con las demás para ver quién lo hace primero.
     */
    iniciar() {
        if (this._iniciado || typeof window === 'undefined') return;
        this._iniciado = true;

        window.addEventListener('online', () => this._actualizar({ enLinea: true }));
        window.addEventListener('offline', () => this._actualizar({ enLinea: false }));

        colaSync.alCambiar(({ pendientes, sincronizando }) => {
            this._actualizar({ pendientes, sincronizando });
        });

        // Primer estado real, sin esperar a que pase ningún evento — para
        // que el indicador no arranque mostrando "En línea" a ciegas si en
        // realidad ya había operaciones pendientes de una sesión anterior.
        colaSync.estado().then(({ pendientes }) => this._actualizar({ pendientes })).catch(() => {});
    }

    /**
     * Se suscribe a los cambios. Al suscribirse, avisa de inmediato con el
     * estado actual (así quien dibuja el indicador no tiene que esperar al
     * primer cambio real para saber qué mostrar). Devuelve una función para
     * des-suscribirse.
     */
    suscribir(fn) {
        this._escuchas.add(fn);
        fn(this.obtener());
        return () => this._escuchas.delete(fn);
    }

    obtener() {
        return { enLinea: this._enLinea, sincronizando: this._sincronizando, pendientes: this._pendientes };
    }

    _actualizar(cambios) {
        if (cambios.enLinea !== undefined) this._enLinea = cambios.enLinea;
        if (cambios.sincronizando !== undefined) this._sincronizando = cambios.sincronizando;
        if (cambios.pendientes !== undefined) this._pendientes = cambios.pendientes;
        const estado = this.obtener();
        this._escuchas.forEach(fn => fn(estado));
    }
}

export default new EstadoConexion();
