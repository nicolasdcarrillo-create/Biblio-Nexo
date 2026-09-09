const fs = require('fs');
let code = fs.readFileSync('src/js/modules/ui-base.js', 'utf8');

const nuevoMetodo = `
  showNotifyReservaModal(reserva, libro, lector) {
      const mensaje = \`Estimado(a) \${lector.nombre || 'lector'},\n\nEl libro "\${libro.titulo}" que reservaste ya está disponible para ti en la Biblioteca Pública Municipal de Futrono.\n\nTienes plazo hasta el \${this._fechaLegible(reserva.vence_apartado_en)} para venir a retirarlo. ¡Te esperamos!\`;
      const telefono = this.formatPhone(lector.telefono);
      const email = lector.email;
      const asunto = 'Tu reserva está lista — Biblioteca Municipal de Futrono';
  
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
      overlay.innerHTML = \`
        <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900">Avisar a \${escapeHtml(lector.nombre || 'el lector')}</h3>
            <p class="text-xs text-stone-500 mt-0.5">Reserva disponible • \${escapeHtml(libro.titulo || '')}</p>
          </div>
  
          <div>
            <label class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Mensaje</label>
            <textarea id="notify-message" aria-label="Texto del aviso al lector" rows="7" class="w-full px-3 py-2.5 border border-stone-300 rounded-md bg-white text-sm text-stone-800 focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago">\${escapeHtml(mensaje)}</textarea>
            <p class="text-[11px] text-stone-500 mt-1">Puedes editarlo antes de enviarlo.</p>
          </div>
  
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button data-action="whatsapp" \${telefono.length < 11 ? 'disabled' : ''}
              class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-bosque hover:bg-[#22392F] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
              <i aria-hidden="true" class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
            <button data-action="email" \${!email ? 'disabled' : ''}
              class="btn-secundario flex items-center justify-center gap-2 bg-patrimonio-lago hover:bg-[#14303c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl text-sm font-medium">
              <i aria-hidden="true" class="fas fa-envelope"></i> Correo
            </button>
            <button data-action="copy"
              class="btn-secundario flex items-center justify-center gap-2 border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-2.5 rounded-xl text-sm font-medium">
              <i aria-hidden="true" class="fas fa-copy"></i> Copiar
            </button>
          </div>
          \${(telefono.length < 11 || !email) ? \`<p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">Este lector no tiene \${!email ? 'correo' : ''}\${(!email && telefono.length < 11) ? ' ni ' : ''}\${telefono.length < 11 ? 'teléfono' : ''} registrado. Complétalo en la vista Lectores para poder avisarle.</p>\` : ''}
  
          <div class="flex justify-end pt-1">
            <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
          </div>
        </div>
      \`;
      document.body.appendChild(overlay);
  
      const textarea = overlay.querySelector('#notify-message');
      const cerrar = this._prepararModal(overlay);
  
      overlay.querySelector('[data-action="close"]').addEventListener('click', cerrar);
      overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
  
      overlay.querySelector('[data-action="whatsapp"]').addEventListener('click', () => {
        window.open(\`https://wa.me/\${telefono}?text=\${encodeURIComponent(textarea.value)}\`, '_blank', 'noopener');
        cerrar();
      });
  
      overlay.querySelector('[data-action="email"]').addEventListener('click', () => {
        window.location.href = \`mailto:\${email}?subject=\${encodeURIComponent(asunto)}&body=\${encodeURIComponent(textarea.value)}\`;
        cerrar();
      });
  
      overlay.querySelector('[data-action="copy"]').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(textarea.value);
          this.showToast('Mensaje copiado.', 'success');
        } catch {
          textarea.select();
          this.showToast('Selecciona y copia el mensaje manualmente.', 'error');
        }
      });
  }
`;

const buscar = `      });
  }`;

code = code.replace(buscar, buscar + "\n" + nuevoMetodo);

fs.writeFileSync('src/js/modules/ui-base.js', code);
