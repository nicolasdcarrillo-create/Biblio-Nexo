// Vista Préstamos. Extraído de js/modules/ui-base.js el 22 de agosto de 2026
// (división por vista, ver pendientes-checklist.md y
// claude/plan-division-ui-base-2026-08-22.md). Sin cambios de lógica: es el
// mismo código, solo movido.
//
// Incluye tanto la tabla de préstamos activos (renderLoans, showBulkNotifyModal)
// como el flujo de circulación compartido (flujoPrestamo y todo lo que cuelga de
// él), porque Mostrador y Catálogo llaman a `flujoPrestamo` para iniciar un
// préstamo — mantenerlos juntos evita partir ese flujo en dos archivos.
//
// `showNotifyModal` (usado por el botón "Avisar" de cada fila) se quedó en
// ui-base.js — no estaba dentro del bloque marcado como "CATÁLOGO"/circulación
// en el archivo original, así que no se movió aquí. Sigue funcionando igual
// porque `Object.assign(UIManager.prototype, ...)` (js/modules/ui.js) mezcla
// los métodos de todas las vistas en el mismo prototipo: `this.foo()` no le
// importa en qué archivo se declaró `foo`.

import { db } from '../modules/db.js';
import { escapeHtml } from '../modules/utilidades.js';

export default {
  async renderLoans() {
    const container = this._container();
    if (!container) return;

    const filtro = this.loanFilter || 'todos';
    const porPagina = this.param('filas_por_pagina');
    const diasAviso = this.param('dias_aviso_previo');

    // El filtrado y los conteos los hace la base de datos: contarlos aquí sobre
    // una lista truncada daba números falsos.
    const { prestamos: visibles, total, conteos } =
      await db.obtenerPrestamos(filtro, this.loanPage, porPagina, diasAviso);
    if (this.currentView !== 'loans') return;

    // Si se devolvió el último de la página final, se retrocede una
    if (visibles.length === 0 && this.loanPage > 0) {
      this.loanPage = Math.max(0, Math.ceil(total / porPagina) - 1);
      return this.renderLoans();
    }

    // Se guardan para que los botones de aviso puedan recuperar el préstamo por id
    this._loansCache = visibles;
    const pendientes = conteos.vencidos + conteos.porVencer;

    const chip = (clave, texto, cantidad, color) => `
      <button data-filter="${clave}" class="loan-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
        filtro === clave
          ? 'bg-patrimonio-lago text-white border-patrimonio-lago'
          : 'bg-white text-stone-600 border-stone-300 hover:border-patrimonio-lago'
      }">
        ${texto} <span class="${filtro === clave ? 'text-white/70' : color}">${cantidad}</span>
      </button>`;

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-2">
          ${chip('todos', 'Todos', conteos.todos, 'text-stone-500')}
          ${chip('vencidos', 'Atrasados', conteos.vencidos, 'text-rose-700')}
          ${chip('porVencer', 'Por vencer', conteos.porVencer, 'text-amber-700')}
        </div>
        <button id="notify-all-btn" ${pendientes === 0 ? 'disabled' : ''}
          class="btn-madera text-white font-medium rounded-xl shadow px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <i aria-hidden="true" class="fas fa-bell mr-1.5"></i> Avisar a los pendientes (${pendientes})
        </button>
      </div>

      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header flex items-center justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Préstamos activos</h3>
          <span class="text-[11px] text-stone-500"><i aria-hidden="true" class="fas fa-circle-info mr-1"></i>Máx. ${this.param('max_prestamos_por_lector')} por lector</span>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Libro</th>
              <th class="text-left px-4 py-3">Lector</th>
              <th class="text-left px-4 py-3">Devolución</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${visibles.map(l => {
              const estado = this._estadoPrestamo(l.fecha_devolucion_esperada);
              const sinContacto = !l.lectores?.email && this.formatPhone(l.lectores?.telefono).length < 11;
              const colorFecha = estado.clave === 'vencido' ? 'text-rose-700 font-bold'
                : estado.clave === 'porVencer' ? 'text-amber-700 font-bold' : 'text-stone-600';
              return `
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3 font-bold text-stone-800">${escapeHtml(l.libros?.titulo)}</td>
                <td class="px-4 py-3 text-stone-600">
                  <div>${escapeHtml(l.lectores?.nombre)}</div>
                  <div class="text-[11px] text-stone-500 font-mono">${escapeHtml(l.lectores?.rut || '')}</div>
                </td>
                <td class="px-4 py-3 ${colorFecha}">
                  <div>${this._fechaLegible(l.fecha_devolucion_esperada)}</div>
                  ${estado.clave === 'vencido'
                    ? `<span class="stamp stamp-danger mt-1"><i aria-hidden="true" class="fas fa-triangle-exclamation"></i> ${escapeHtml(estado.etiqueta)}</span>`
                    : `<div class="text-[11px] font-medium ${estado.clave === 'porVencer' ? 'text-amber-700' : 'text-stone-500'}">${escapeHtml(estado.etiqueta)}</div>`}
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap space-x-3">
                  ${estado.clave !== 'alDia' ? `
                    <button class="notify-loan-btn font-bold ${sinContacto ? 'text-stone-500' : 'text-patrimonio-madera'}" data-id="${l.id}"
                      title="${sinContacto ? 'Sin datos de contacto' : 'Enviar aviso al lector'}">
                      <i aria-hidden="true" class="fas fa-bell"></i> Avisar
                    </button>` : ''}
                  ${estado.clave !== 'vencido' && (l.renovaciones ?? 0) < this.param('max_renovaciones') ? `
                    <button class="renew-loan-btn text-patrimonio-lago font-bold" data-id="${l.id}"
                      title="Extiende 7 días. Quedan ${this.param('max_renovaciones') - (l.renovaciones ?? 0)}.">
                      <i aria-hidden="true" class="fas fa-clock-rotate-left"></i> Renovar
                    </button>` : ''}
                  <button class="return-loan-btn text-patrimonio-bosque font-bold" data-id="${l.id}">Devolver</button>
                </td>
              </tr>
            `; }).join('') || `<tr><td colspan="4" class="px-4 py-8 text-center text-stone-500">${
              filtro === 'vencidos' ? 'No hay préstamos atrasados.'
              : filtro === 'porVencer' ? 'No hay préstamos por vencer.'
              : 'No hay préstamos activos.'}</td></tr>`}
          </tbody>
        </table>
        <div id="loans-pagination">${this._paginacionHtml(this.loanPage, total, porPagina, 'loan-page-btn')}</div>
      </div>
    `;

    this._bindPaginacion(container, '.loan-page-btn', p => { this.loanPage = p; this.renderLoans(); });

    container.querySelectorAll('.loan-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loanFilter = btn.dataset.filter;
        this.loanPage = 0; // el total cambió, la página actual puede no existir
        this.renderLoans();
      });
    });

    container.querySelectorAll('.notify-loan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prestamo = this._loansCache.find(l => String(l.id) === String(btn.dataset.id));
        if (prestamo) this.showNotifyModal(prestamo);
      });
    });

    document.getElementById('notify-all-btn').addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        // Se pide la lista completa: la página visible es solo una parte
        const pendientesTodos = await db.obtenerPendientesDeAviso(diasAviso);
        this.showBulkNotifyModal(pendientesTodos);
      } catch (err) {
        this.showToast(err.message || 'No se pudo cargar la lista de avisos.', 'error');
      } finally {
        btn.disabled = false;
      }
    });

    container.querySelectorAll('.renew-loan-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          const r = await db.renovarPrestamo(btn.dataset.id);
          // Fase 1.3: sin conexión, db.js encola la operación en vez de
          // lanzar — no hay "nueva fecha" que mostrar todavía, solo el
          // aviso de que quedó pendiente.
          if (r?.encolado) {
            this.showToast(r.mensaje, 'info');
          } else {
            const nueva = r?.nueva_fecha ? this._fechaLegible(r.nueva_fecha) : 'la nueva fecha';
            this.showToast(`Préstamo renovado hasta el ${nueva}.`, 'success');
          }
          this.renderLoans();
        } catch (err) {
          this.showToast(err.message || 'No se pudo renovar.', 'error');
          btn.disabled = false;
        }
      });
    });

    container.querySelectorAll('.return-loan-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const r = await db.devolverPrestamo(btn.dataset.id);
          if (r?.encolado) {
            this.showToast(r.mensaje, 'info');
          } else {
            this.showToast('Préstamo devuelto.', 'success');
          }
          this.renderLoans();
        } catch (err) {
          this.showToast(err.message || 'No se pudo registrar la devolución.', 'error');
        }
      });
    });
  },

  // Lista de avisos pendientes, para recorrerlos uno por uno sin volver a la tabla.
  showBulkNotifyModal(prestamos) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
        <div class="p-6 pb-4">
          <h3 class="font-serif text-lg font-bold text-stone-900">Avisos pendientes</h3>
          <p class="text-xs text-stone-500 mt-0.5">${prestamos.length} ${prestamos.length === 1 ? 'lector' : 'lectores'} con devoluciones atrasadas o próximas. Envía los avisos uno por uno.</p>
        </div>
        <div class="overflow-y-auto px-6 divide-y divide-stone-200 border-t border-stone-200">
          ${prestamos.map(l => {
            const estado = this._estadoPrestamo(l.fecha_devolucion_esperada);
            return `
            <div class="py-3 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-stone-800 text-sm truncate">${escapeHtml(l.lectores?.nombre)}</p>
                <p class="text-xs text-stone-500 truncate">${escapeHtml(l.libros?.titulo)}</p>
                <p class="text-[11px] font-bold ${estado.clave === 'vencido' ? 'text-rose-700' : 'text-amber-700'}">${escapeHtml(estado.etiqueta)}</p>
              </div>
              <button data-notify-id="${l.id}" class="btn-secundario shrink-0 bg-patrimonio-madera text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                <i aria-hidden="true" class="fas fa-bell mr-1"></i> Avisar
              </button>
            </div>`;
          }).join('')}
        </div>
        <div class="p-6 pt-4 flex justify-end border-t border-stone-200">
          <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cerrar = this._prepararModal(overlay);
    overlay.querySelector('[data-action="close"]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelectorAll('[data-notify-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prestamo = prestamos.find(l => String(l.id) === String(btn.dataset.notifyId));
        if (prestamo) this.showNotifyModal(prestamo);
      });
    });
  },

  /**
   * Flujo de préstamo desde el mesón: se pide el RUT, se consulta la situación
   * del lector y se muestra ANTES de confirmar. Así la persona del mesón sabe
   * si está bloqueado, si debe libros, o si no está registrado todavía.
   */
  async flujoPrestamo(libroId, alTerminar) {
    const rut = await this.showPrompt('Escribe el RUT del lector:', {
      title: 'Prestar libro', placeholder: '12345678-5', confirmText: 'Consultar'
    });
    if (!rut) return;
    if (!this.isValidRut(rut)) {
      this.showToast('El RUT no es válido. Revisa el dígito verificador.', 'error');
      return;
    }

    let estado;
    try {
      estado = await db.estadoLector(this.formatRut(rut));
    } catch (err) {
      this.showToast(err.message || 'No se pudo consultar el lector.', 'error');
      return;
    }

    this.showConfirmarPrestamoModal(libroId, this.formatRut(rut), estado, alTerminar);
  },

  /**
   * Muestra la situación del lector y, según el caso, ofrece prestar,
   * registrarlo como lector nuevo, o explica por qué no se puede prestar.
   */
  showConfirmarPrestamoModal(libroId, rut, estado, alTerminar) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';

    let cuerpo, acciones;

    if (!estado.existe) {
      // Lector nuevo
      cuerpo = `
        <div class="bg-patrimonio-lago/5 border border-patrimonio-lago/20 rounded-xl p-4 text-center">
          <i aria-hidden="true" class="fas fa-user-plus text-2xl text-patrimonio-lago mb-2"></i>
          <p class="font-bold text-stone-800">Lector nuevo</p>
          <p class="text-sm text-stone-600 mt-1">El RUT <span class="font-mono font-bold">${escapeHtml(rut)}</span> no está registrado.</p>
          <p class="text-xs text-stone-500 mt-2">Regístralo para poder prestarle libros.</p>
        </div>`;
      acciones = `
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
        <button data-action="registrar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar lector</button>`;
    } else if (!estado.puede_prestar) {
      // Impedido
      cuerpo = `
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p class="font-bold text-rose-800 mb-1"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>No se puede prestar</p>
          <p class="text-sm text-rose-700">${escapeHtml(estado.motivo_rechazo || 'El lector está impedido de pedir libros.')}</p>
        </div>
        ${this._resumenLector(estado)}`;
      acciones = `
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
        <button data-action="ver-prestamos" class="btn-secundario border border-stone-300 bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-medium">Ver sus préstamos</button>`;
    } else {
      // Todo en orden
      cuerpo = `
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="font-bold text-emerald-800"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>${escapeHtml(estado.nombre)}</p>
          <p class="text-sm text-emerald-700 mt-0.5">Puede llevar este libro.</p>
        </div>
        ${this._resumenLector(estado)}`;
      acciones = `
        <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
        <button data-action="prestar" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Confirmar préstamo</button>`;
    }

    overlay.innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900">Situación del lector</h3>
        ${cuerpo}
        <div class="flex justify-end gap-3 pt-1 flex-wrap">${acciones}</div>
      </div>`;
    document.body.appendChild(overlay);

    const cerrar = this._prepararModal(overlay);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('[data-action="prestar"]')?.addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        const r = await db.registrarPrestamo(libroId, rut);
        cerrar();
        // Fase 1.3: sin conexión, db.js encoló el préstamo en vez de
        // lanzar — se avisa que quedó pendiente, no que ya se completó
        // (deliberadamente sin un badge visual de "sin conexión" aparte;
        // el aviso mismo ya deja claro que no fue el flujo normal).
        if (r?.encolado) {
          this.showToast(r.mensaje, 'info');
        } else {
          this.showToast('Préstamo registrado.', 'success');
        }
        alTerminar?.();
      } catch (err) {
        this.showToast(err.message || 'No se pudo registrar el préstamo.', 'error');
        btn.disabled = false;
      }
    });

    overlay.querySelector('[data-action="registrar"]')?.addEventListener('click', () => {
      cerrar();
      this.showNuevoLectorModal(rut, async () => {
        // Tras registrarlo, se reintenta el préstamo con su situación ya actualizada
        const nuevoEstado = await db.estadoLector(rut);
        this.showConfirmarPrestamoModal(libroId, rut, nuevoEstado, alTerminar);
      });
    });

    overlay.querySelector('[data-action="ver-prestamos"]')?.addEventListener('click', () => {
      cerrar();
      this.loanFilter = 'vencidos';
      this.switchView('loans');
    });
  },

  // Resumen numérico de la situación de un lector
  _resumenLector(estado) {
    const dato = (etiqueta, valor, color = 'text-stone-900') => `
      <div class="text-center">
        <p class="font-serif font-bold text-2xl ${color}">${valor}</p>
        <p class="text-[10px] uppercase tracking-widest text-stone-500 mt-0.5">${etiqueta}</p>
      </div>`;
    return `
      <div class="grid grid-cols-3 gap-2 border border-stone-200 rounded-xl py-3">
        ${dato('Activos', estado.prestamos_activos ?? 0)}
        ${dato('Atrasados', estado.prestamos_atrasados ?? 0, (estado.prestamos_atrasados ?? 0) > 0 ? 'text-rose-700' : 'text-stone-900')}
        ${dato('Máximo', this.param('max_prestamos_por_lector'))}
      </div>
      ${estado.email || estado.telefono ? `
        <p class="text-[11px] text-stone-500 text-center">
          ${estado.email ? escapeHtml(estado.email) : ''}${estado.email && estado.telefono ? ' · ' : ''}${estado.telefono ? escapeHtml(estado.telefono) : ''}
        </p>` : ''}`;
  },

  /** Registro rápido de lector desde el mesón, con el RUT ya cargado. */
  showNuevoLectorModal(rut, alGuardar) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 class="font-serif text-lg font-bold text-stone-900">Registrar lector nuevo</h3>
          <p class="text-xs text-stone-500 mt-0.5">Todos los datos son obligatorios.</p>
        </div>
        <div class="space-y-3">
          <div>
            <label for="new-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
            <input id="new-user-id" value="${escapeHtml(rut)}" readonly
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm font-mono text-stone-600" />
          </div>
          <div>
            <label for="new-user-name" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Nombre completo</label>
            <input id="new-user-name" placeholder="María Antileo Huenchumán"
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="new-user-phone" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Teléfono</label>
            <input id="new-user-phone" type="tel" placeholder="9 1234 5678"
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
          <div>
            <label for="new-user-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
            <input id="new-user-email" type="email" placeholder="nombre@correo.cl"
              class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        ${this._bloqueConsentimiento('new')}
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Registrar y continuar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const cerrar = this._prepararModal(overlay);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', cerrar);
    this._bindConsentimiento('new');
    setTimeout(() => document.getElementById('new-user-name')?.focus(), 20);

    overlay.querySelector('[data-action="save"]').addEventListener('click', async e => {
      if (!this.validateUserForm(false)) return;
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        const consent = this._datosConsentimiento('new');
        if (!consent) { btn.disabled = false; return; }
        await db.agregarLector({
          rut: this.formatRut(document.getElementById('new-user-id').value),
          nombre: document.getElementById('new-user-name').value.trim(),
          email: document.getElementById('new-user-email').value.trim().toLowerCase(),
          telefono: this.formatPhone(document.getElementById('new-user-phone').value),
          ...consent
        });
        cerrar();
        this.showToast('Lector registrado.', 'success');
        await alGuardar?.();
      } catch (err) {
        this.showToast(err.message || 'No se pudo registrar el lector.', 'error');
        btn.disabled = false;
      }
    });
  },

  /** Consulta rápida de la situación de un lector por su RUT. */
  async showLectorModal(rut) {
    try {
      const estado = await db.estadoLector(rut);
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
      overlay.innerHTML = `
        <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900">${escapeHtml(estado.nombre || 'Lector')}</h3>
            <p class="text-xs font-mono text-stone-500">${escapeHtml(estado.rut || rut)}</p>
          </div>
          ${!estado.puede_prestar ? `
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <p class="text-sm text-rose-700"><i aria-hidden="true" class="fas fa-ban mr-1.5"></i>${escapeHtml(estado.motivo_rechazo || '')}</p>
            </div>` : `
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p class="text-sm text-emerald-700"><i aria-hidden="true" class="fas fa-circle-check mr-1.5"></i>Puede pedir libros prestados.</p>
            </div>`}
          ${this._resumenLector(estado)}
          <div class="flex justify-end pt-1">
            <button data-action="close" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cerrar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      const cerrar = this._prepararModal(overlay);
      overlay.querySelector('[data-action="close"]').addEventListener('click', cerrar);
      overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
    } catch (err) {
      this.showToast(err.message || 'No se pudo consultar el lector.', 'error');
    }
  }
};
