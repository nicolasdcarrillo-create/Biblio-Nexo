// Vista Lectores. Extraído de js/modules/ui-base.js el 22 de agosto de 2026
// (división por vista, ver pendientes-checklist.md y
// claude/plan-division-ui-base-2026-08-22.md). Sin cambios de lógica: es el
// mismo código, solo movido.
//
// `_paginacionHtml`/`_bindPaginacion` y `_bloqueConsentimiento`/`_bindConsentimiento`
// se quedan en ui-base.js (son widgets genéricos compartidos por varias vistas).
// Sigue funcionando igual porque `Object.assign(UIManager.prototype, ...)`
// (js/modules/ui.js) mezcla los métodos de todas las vistas en el mismo
// prototipo: `this.foo()` no le importa en qué archivo se declaró `foo`.

import { db } from '../modules/db.js';
import { escapeHtml } from '../modules/utilidades.js';

export default {
  async renderUsers() {
    const container = this._container();
    if (!container) return;

    const porPagina = this.param('filas_por_pagina');
    const { lectores: users, total } = await db.obtenerLectores(this.userSearch || '', this.userPage, porPagina);
    if (this.currentView !== 'users') return;

    if (users.length === 0 && this.userPage > 0) {
      this.userPage = Math.max(0, Math.ceil(total / porPagina) - 1);
      return this.renderUsers();
    }
    this._usersCache = users;

    container.innerHTML = `
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 mb-6">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Agregar lector</h3>
        </div>
        <form id="add-user-form" class="p-5">
          <p class="text-xs text-stone-500 mb-4">Todos los datos son obligatorios. El correo y el teléfono se usan para avisar cuando un préstamo está por vencer.</p>          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="new-user-name" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Nombre completo</label>
              <input id="new-user-name" required placeholder="María Antileo Huenchumán" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
            <div>
              <label for="new-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
              <input id="new-user-id" required placeholder="12345678-5" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm font-mono" />
            </div>
            <div>
              <label for="new-user-phone" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Teléfono</label>
              <input id="new-user-phone" required type="tel" placeholder="9 1234 5678" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
            <div>
              <label for="new-user-email" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">Correo</label>
              <input id="new-user-email" required type="email" placeholder="nombre@correo.cl" class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
            </div>
          </div>
          <div class="mt-4">${this._bloqueConsentimiento('new')}</div>
          <button type="submit" class="btn-madera mt-4 w-full md:w-auto md:px-8 text-white font-sans font-medium rounded-xl shadow py-2.5 text-sm">Agregar lector</button>
        </form>
      </div>
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Lectores registrados</h3>
          <div class="relative sm:w-64">
            <i aria-hidden="true" class="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
            <input id="user-search-input" aria-label="Buscar lector por nombre, RUT o correo" type="text" placeholder="Buscar por nombre, RUT o correo..." value="${escapeHtml(this.userSearch || '')}"
              class="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-md bg-white focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Lector</th>
              <th class="text-left px-4 py-3">RUT</th>
              <th class="text-left px-4 py-3">Contacto</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr class="border-t border-stone-200">
                <td class="px-4 py-3 font-bold text-stone-800">${escapeHtml(u.nombre)}</td>
                <td class="px-4 py-3 text-stone-600 font-mono">${escapeHtml(u.rut)}</td>
                <td class="px-4 py-3 text-stone-600">
                  <div>${escapeHtml(u.email || '—')}</div>
                  <div class="text-xs text-stone-500">${escapeHtml(u.telefono || '—')}</div>
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
                  <button class="edit-user-btn text-stone-500 hover:text-patrimonio-madera font-bold" data-id="${u.id}">Editar</button>
                  ${this.currentUserRole === 'admin'
                    ? `<button class="delete-user-btn text-rose-700 font-bold" data-id="${u.id}">Eliminar</button>`
                    : ''}
                </td>
              </tr>
            `).join('') || `<tr><td colspan="4" class="px-4 py-6 text-center text-stone-500">${this.userSearch ? 'Ningún lector coincide con la búsqueda.' : 'Sin lectores registrados. Agrega el primero con el formulario de arriba.'}</td></tr>`}
          </tbody>
        </table>
        <div id="users-pagination">${this._paginacionHtml(this.userPage, total, porPagina, 'user-page-btn')}</div>
      </div>
    `;

    document.getElementById('add-user-form').addEventListener('submit', async e => {
      e.preventDefault();
      if (!this.validateUserForm(false)) return;
      try {
        const consent = this._datosConsentimiento('new');
        if (!consent) return;
        await db.agregarLector({
          // Se normalizan RUT y teléfono para que queden con un formato único
          // en la base de datos, sin importar cómo los escriba cada persona.
          rut: this.formatRut(document.getElementById('new-user-id').value),
          nombre: document.getElementById('new-user-name').value.trim(),
          email: document.getElementById('new-user-email').value.trim().toLowerCase(),
          telefono: this.formatPhone(document.getElementById('new-user-phone').value),
          ...consent
        });
        this.showToast('Lector agregado.', 'success');
        this.renderUsers();
      } catch (err) {
        this.showToast(err.message || 'No se pudo agregar el lector.', 'error');
      }
    });

    container.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await this.showConfirm('¿Eliminar este usuario? Esta acción no se puede deshacer.', { title: 'Eliminar lector', confirmText: 'Eliminar' });
        if (!ok) return;
        try {
          await db.eliminarLector(btn.dataset.id);
          this.showToast('Usuario eliminado.', 'success');
          this.renderUsers();
        } catch (err) {
          this.showToast(err.message || 'No se pudo eliminar.', 'error');
        }
      });
    });

    container.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lector = (this._usersCache || []).find(u => String(u.id) === String(btn.dataset.id));
        if (lector) this.showEditUserModal(lector);
      });
    });

    this._bindConsentimiento('new');
    this._bindPaginacion(container, '.user-page-btn', p => { this.userPage = p; this.renderUsers(); });

    const userSearchInput = document.getElementById('user-search-input');
    userSearchInput.addEventListener('input', () => {
      clearTimeout(this._userSearchTimer);
      this._userSearchTimer = setTimeout(() => {
        this.userSearch = userSearchInput.value.trim();
        this.userPage = 0;
        this.renderUsers();
      }, 350);
    });
  },

  /**
   * Editar un lector. Igual que con los libros, antes había que eliminar y
   * recrear para corregir un dato, lo que rompía el vínculo con su historial
   * de préstamos.
   */
  showEditUserModal(lector) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    const campo = (id, etiqueta, valor, extra = '') => `
      <div>
        <label for="${id}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${etiqueta}</label>
        <input id="${id}" value="${escapeHtml(valor ?? '')}" ${extra}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;

    // El RUT identifica al lector y es la clave con la que se buscan sus
    // préstamos: cambiarlo es una operación delicada, reservada a administración.
    // El resto del contacto sí lo puede corregir cualquiera del personal, porque
    // quien detecta que falta un teléfono es justamente quien está en el mesón.
    const esAdmin = this.currentUserRole === 'admin';

    overlay.innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-serif text-lg font-bold text-stone-900">Editar lector</h3>
        <div class="space-y-3">
          ${campo('edit-user-name', 'Nombre completo', lector.nombre)}
          ${esAdmin
            ? campo('edit-user-id', 'RUT', lector.rut)
            : `<div>
                 <label for="edit-user-id" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">RUT</label>
                 <input id="edit-user-id" value="${escapeHtml(lector.rut ?? '')}" readonly
                   class="w-full px-3 py-2 border border-stone-300 rounded-md bg-stone-50 text-sm font-mono text-stone-500" />
                 <p class="text-[11px] text-stone-500 mt-1">Solo un administrador puede corregir un RUT.</p>
               </div>`}
          ${campo('edit-user-phone', 'Teléfono', lector.telefono, 'type="tel"')}
          ${campo('edit-user-email', 'Correo', lector.email, 'type="email"')}
        </div>
        <div class="flex justify-end gap-3 pt-1">
          <button data-action="cancel" class="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">Cancelar</button>
          <button data-action="save" class="btn-madera text-white px-5 py-2 rounded-xl text-sm font-medium">Guardar cambios</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const cerrar = this._prepararModal(overlay);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('[data-action="save"]').addEventListener('click', async e => {
      if (!this.validateUserForm(true)) return;
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        const datos = {
          nombre: document.getElementById('edit-user-name').value.trim(),
          email: document.getElementById('edit-user-email').value.trim().toLowerCase(),
          telefono: this.formatPhone(document.getElementById('edit-user-phone').value)
        };
        if (esAdmin) {
          // Escritura directa: la política RLS de UPDATE sobre `lectores` la permite
          await db.actualizarLector(lector.id, {
            ...datos,
            rut: this.formatRut(document.getElementById('edit-user-id').value)
          });
        } else {
          // Vía función controlada: solo toca nombre, correo y teléfono
          await db.actualizarContactoLector(lector.id, datos);
        }
        cerrar();
        this.showToast('Lector actualizado.', 'success');
        this.renderUsers();
      } catch (err) {
        this.showToast(err.message || 'No se pudo guardar.', 'error');
        btn.disabled = false;
      }
    });
  }
};
