const fs = require('fs');
let c = fs.readFileSync('src/js/vistas/prestamos.js', 'utf8');

// Replace buttons HTML
const htmlSearch = `<button id="notify-all-btn" \${pendientes === 0 ? 'disabled' : ''}
            class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <i aria-hidden="true" class="fas fa-bell mr-1.5"></i> Avisar a los pendientes (\${pendientes})
          </button>`;
const htmlReplace = `<div class="flex flex-wrap gap-2">
            <button id="notify-all-btn" \${pendientes === 0 ? 'disabled' : ''}
              class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <i aria-hidden="true" class="fas fa-bell mr-1.5"></i> Avisar a los pendientes (\${pendientes})
            </button>
            <button id="notify-vacations-btn" \${conteos.todos === 0 ? 'disabled' : ''}
              class="btn-secundario bg-amber-50 border border-amber-200 text-amber-800 font-medium rounded-xl px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition hover:bg-amber-100">
              <i aria-hidden="true" class="fas fa-bullhorn mr-1.5"></i> Aviso Cierre
            </button>
          </div>`;
c = c.replace(htmlSearch, htmlReplace);

// Add event listener
const evSearch = `document.getElementById('notify-all-btn').addEventListener('click', async e => {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
          // Se pide la lista completa: la pogina visible es solo una parte
          const pendientesTodos = await PrestamoRepository.obtenerPendientesDeAviso(diasAviso);
          this.showBulkNotifyModal(pendientesTodos);
        } catch (err) {
          this.showToast(err.message || 'No se pudo cargar la lista de avisos.', 'error');
        } finally {
          btn.disabled = false;
        }
      });`;
const evReplace = evSearch + `

      document.getElementById('notify-vacations-btn')?.addEventListener('click', async e => {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
          const todosActivos = await PrestamoRepository.obtenerTodosActivosSinPaginar();
          this.showGeneralNotifyModal(todosActivos);
        } catch (err) {
          this.showToast(err.message || 'No se pudo cargar la lista general.', 'error');
        } finally {
          btn.disabled = false;
        }
      });`;
c = c.replace(evSearch, evReplace);

// Add new modal
const fnSearch = `showBulkNotifyModal(prestamos) {`;
const fnReplace = `showGeneralNotifyModal(prestamos) {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
      overlay.innerHTML = html\`
        <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
          <div class="p-6 pb-4">
            <h3 class="font-serif text-lg font-bold text-stone-900">Aviso Cierre General</h3>
            <p class="text-xs text-stone-500 mt-0.5">\${prestamos.length} \${prestamos.length === 1 ? 'lector' : 'lectores'} con libros en su poder. Solicita devolución masiva por cierre o vacaciones.</p>
          </div>
          <div class="overflow-y-auto px-6 divide-y divide-stone-200 border-t border-stone-200">
            \${prestamos.map(l => {
              const tel = l.lectores?.telefono;
              const nombre = l.lectores?.nombre || 'Lector';
              const titulo = l.libros?.titulo || 'un libro';
              const m = \`Estimado/a \${nombre}, le recordamos que por cierre de semestre o vacaciones debe devolver el libro "\${titulo}" a la biblioteca lo antes posible. ¡Gracias!\`;
              const msg = encodeURIComponent(m);
              const enlace = tel ? \`https://wa.me/\${this.formatPhone(tel)}?text=\${msg}\` : '';
              return html\`
                <div class="py-3 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-stone-800 truncate">\${nombre}</p>
                    <p class="text-xs text-stone-500 truncate" title="\${titulo}">\${titulo}</p>
                  </div>
                  \${tel
                    ? html\`<a href="\${enlace}" target="_blank" rel="noopener noreferrer" class="btn-secundario shrink-0 border border-stone-300 bg-white text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"><i aria-hidden="true" class="fab fa-whatsapp text-emerald-600 mr-1"></i> WhatsApp</a>\`
                    : html\`<span class="text-[10px] text-stone-400 font-bold uppercase tracking-widest shrink-0">Sin tel.</span>\`
                  }
                </div>
              \`;
            }).join('')}
          </div>
          <div class="p-4 border-t border-stone-200 text-right bg-stone-50 rounded-b-2xl shrink-0">
            <button data-action="cerrar" class="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200">Cerrar</button>
          </div>
        </div>
      \`.toString();
      document.body.appendChild(overlay);
      const cerrar = () => overlay.remove();
      overlay.querySelector('[data-action="cerrar"]').addEventListener('click', cerrar);
      overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
    },

    ` + fnSearch;
c = c.replace(fnSearch, fnReplace);

fs.writeFileSync('src/js/vistas/prestamos.js', c);
