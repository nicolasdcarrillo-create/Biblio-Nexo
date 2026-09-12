const fs = require('fs');
let c = fs.readFileSync('src/js/vistas/mostrador.js', 'utf8');
const search = 'const reservas = await ReservaRepository.listarReservas(resultado.libro?.id).catch(() => null);';
const replace = `const fastReturnToggle = document.getElementById('fast-return-toggle');
          if (fastReturnToggle && fastReturnToggle.checked) {
              const prestamoActivo = resultado.prestamos.find(p => !p.fecha_devolucion_real);
              if (prestamoActivo) {
                  try {
                      await PrestamoRepository.devolverPrestamo(prestamoActivo.id);
                      this.showToast('Devolución rápida exitosa.', 'success');
                      resultEl.innerHTML = \`<div class="text-center py-8 text-stone-500">
                          <i aria-hidden="true" class="fas fa-check-circle text-4xl mb-3 text-emerald-600"></i>
                          <p class="text-sm font-bold text-emerald-700">¡Libro devuelto!</p>
                          <p class="text-xs">Puede escanear el siguiente.</p>
                      </div>\`;
                      return;
                  } catch (e) {
                      this.showToast(e.message || 'Error en devolución rápida', 'error');
                  }
              } else {
                  this.showToast('Este libro no tiene préstamos activos.', 'warning');
              }
          }

          const reservas = await ReservaRepository.listarReservas(resultado.libro?.id).catch(() => null);`;
c = c.replace(search, replace);
fs.writeFileSync('src/js/vistas/mostrador.js', c);
