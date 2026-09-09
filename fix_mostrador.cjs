const fs = require('fs');
let code = fs.readFileSync('src/js/vistas/mostrador.js', 'utf8');

const regexFilaReserva = /(<\/div>\s*)(<\/div>`;\s*const filaPrestamo)/g;
const replacementFilaReserva = `$1
        \${r.estado === 'apartada' ? \`
          <div class="flex flex-wrap gap-2 mt-3">
            <button data-entregar-reserva="\${escapeHtml(String(r.id))}" class="btn-secundario bg-patrimonio-bosque text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              <i aria-hidden="true" class="fas fa-hand-holding-hand mr-1"></i> Entregar libro
            </button>
            <button data-avisar-reserva="\${escapeHtml(String(r.id))}" data-rut="\${escapeHtml(r.lector_rut)}" data-vence="\${escapeHtml(r.vence_apartado_en)}" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold">
              <i aria-hidden="true" class="fab fa-whatsapp mr-1 text-green-600"></i> Avisar lector
            </button>
          </div>
        \` : ''}
      </div>\`;
    const filaPrestamo`;

const regexBotonReservar = /(<button data-prestar-libro[\s\S]*?<\/button>)/g;
const replacementBotonReservar = `\${hayDisponibles
              ? \`<button data-prestar-libro="\${escapeHtml(String(libro.id))}" class="btn-madera w-full text-white font-medium rounded-xl shadow py-2.5 text-sm">
                  <i aria-hidden="true" class="fas fa-right-left mr-1.5"></i> Prestar este libro
                 </button>\`
              : \`<button data-reservar-libro="\${escapeHtml(String(libro.id))}" class="btn-secundario bg-patrimonio-madera text-white font-medium rounded-xl shadow py-2.5 text-sm w-full">
                  <i aria-hidden="true" class="fas fa-clock mr-1.5"></i> Reservar este libro
                 </button>\`
            }`;

const regexBind = /(_bindFichaCirculacion\(resultEl, resultado, codigo\) \{\s*const recargar = \(\) => this\._mostrarResultadoEscaneo\?\.\(codigo\);)/g;
const replacementBind = `$1

    resultEl.querySelectorAll('[data-entregar-reserva]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await ReservaRepository.retirarReserva(btn.dataset.entregarReserva);
          this.showToast('Reserva entregada. Se ha registrado el préstamo.', 'success');
          recargar();
        } catch (err) {
          this.showToast(err.message || 'Error al entregar la reserva.', 'error');
          btn.disabled = false;
        }
      });
    });

    resultEl.querySelectorAll('[data-avisar-reserva]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          const { lector } = await LectorRepository.estadoLector(btn.dataset.rut);
          if (typeof this.showNotifyReservaModal === 'function') {
            this.showNotifyReservaModal(
              { vence_apartado_en: btn.dataset.vence },
              resultado.libro,
              lector
            );
          } else {
            this.showToast('El módulo de notificaciones no está disponible.', 'error');
          }
        } catch (err) {
          this.showToast(err.message || 'Error al obtener datos del lector.', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    resultEl.querySelectorAll('[data-reservar-libro]').forEach(btn => {
      btn.addEventListener('click', () => this.flujoReserva(btn.dataset.reservarLibro, recargar));
    });`;

code = code.replace(regexFilaReserva, replacementFilaReserva);
code = code.replace(regexBotonReservar, replacementBotonReservar);
code = code.replace(regexBind, replacementBind);

fs.writeFileSync('src/js/vistas/mostrador.js', code);
