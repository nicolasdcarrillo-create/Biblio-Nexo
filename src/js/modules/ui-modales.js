import { escapeHtml } from './utilidades.js';
import registroErrores from './errores.js';

export default {
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
        const bgColor = type === 'success' ? 'bg-emerald-500/90' : type === 'error' ? 'bg-rose-600/90' : 'bg-patrimonio-lago/90';
        const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        toast.className = `\${bgColor} text-white px-5 py-4 rounded-2xl shadow-soft-xl border border-white/10 backdrop-blur-md font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-10 scale-95 opacity-0 z-50 text-sm`;
        toast.innerHTML = `<i aria-hidden="true" class="fas ${icon} text-lg"></i> <span>${escapeHtml(message)}</span>`;

        container.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-10', 'scale-95', 'opacity-0'), 10);
        setTimeout(() => {
            toast.classList.add('translate-y-10', 'scale-95', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // Modal de confirmación propio (reemplaza confirm() nativo)
    showConfirm(message, { title = 'Confirmar acción', confirmText = 'Confirmar', danger = true } = {}) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4';
            overlay.innerHTML = `
                <div class="bg-patrimonio-card/95 backdrop-blur-xl border border-white/20 rounded-[2rem] max-w-sm w-full p-8 shadow-soft-xl shadow-patrimonio-lago/20 transform transition-all space-y-4">
                    <h3 class="font-serif text-lg font-bold text-stone-900">${escapeHtml(title)}</h3>
                    <p class="text-stone-600 text-sm">${escapeHtml(message)}</p>
                    <div class="flex justify-end gap-3 pt-2">
                        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
                        <button data-action="confirm" class="${danger ? 'bg-rose-700 hover:bg-rose-800' : 'bg-patrimonio-madera hover:bg-[#633414]'} text-white px-4 py-2 rounded-xl text-sm font-medium">${escapeHtml(confirmText)}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            let resultado = false;
            const cerrarModal = this._prepararModal(overlay, { alCerrar: () => resolve(resultado) });
            const close = (r) => { resultado = r; cerrarModal(); };
            overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false));
            overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true));
            overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
        });
    },

    // Modal de entrada de texto propio (reemplaza prompt() nativo)
    showPrompt(message, { title = 'Ingresar dato', placeholder = '', confirmText = 'Aceptar' } = {}) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-patrimonio-lago/40 backdrop-blur-md z-[10000] transition-opacity duration-300 flex items-center justify-center p-4';
            overlay.innerHTML = `
                <div class="bg-patrimonio-card/95 backdrop-blur-xl border border-white/20 rounded-[2rem] max-w-sm w-full p-8 shadow-soft-xl shadow-patrimonio-lago/20 transform transition-all space-y-4">
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
            // Fokus automático para UX
            setTimeout(() => input.focus(), 50);
        });
    },

    /**
     * Trampa de foco y manejo de Escape para modales (accesibilidad WCAG).
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
        return cerrar;
    }
};
