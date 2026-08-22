// Vista Catálogo. Extraído de js/modules/ui-base.js el 22 de agosto de 2026
// (división por vista, ver pendientes-checklist.md y
// claude/plan-division-ui-base-2026-08-22.md). El bloque venía marcado
// internamente como "CATÁLOGO" en ui-base.js, pero eso ya no aplicaba desde
// que la vista Administración se movió a js/vistas/admin.js en una ronda
// anterior — el marcador quedó apuntando a algo que ya no estaba ahí. Sin
// cambios de lógica: es el mismo código, solo movido.
//
// `_bindPaginacion` se queda en ui-base.js (la usan Catálogo, Lectores y
// Préstamos por igual, junto a `_paginacionHtml`). `promptCreateLoan` llama
// a `flujoPrestamo`, que vive en js/vistas/prestamos.js — sigue funcionando
// igual porque `Object.assign(UIManager.prototype, ...)` (js/modules/ui.js)
// mezcla los métodos de todas las vistas en el mismo prototipo: `this.foo()`
// no le importa en qué archivo se declaró `foo`.

import { db } from '../modules/db.js';
import { escapeHtml } from '../modules/utilidades.js';

export default {
  async renderCatalog() {
    const container = this._container();
    if (!container) return;

    const porPagina = this.param('filas_por_pagina');
    const { libros, total } = await db.obtenerLibros(this.catalogSearch || '', this.bookPage, porPagina);
    // Si el usuario ya cambió de vista mientras esperábamos la respuesta, no pintamos nada
    if (this.currentView !== 'catalog') return;

    // Si se borró el último elemento de la última página, se retrocede una
    if (libros.length === 0 && this.bookPage > 0) {
      this.bookPage = Math.max(0, Math.ceil(total / porPagina) - 1);
      return this.renderCatalog();
    }

    container.innerHTML = `
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 mb-6">
        <div class="catalog-card-header">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Agregar libro</h3>
        </div>
        <form id="add-book-form" class="grid grid-cols-2 md:grid-cols-6 gap-3 p-5">
          <input id="new-book-isbn" aria-label="ISBN del libro" placeholder="ISBN" class="col-span-2 md:col-span-1 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-title" aria-label="Título del libro" placeholder="Título" class="col-span-2 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-author" aria-label="Autor del libro" placeholder="Autor" class="col-span-2 px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-genre" aria-label="Género del libro" placeholder="Género" class="px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-location" aria-label="Ubicación en la biblioteca" placeholder="Ubicación" class="px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <input id="new-book-qty" aria-label="Cantidad de ejemplares" type="number" min="1" value="1" placeholder="Cantidad" class="px-3 py-2 border border-stone-300 rounded-md bg-white focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago text-sm" />
          <button type="submit" class="btn-madera col-span-2 md:col-span-1 text-white font-sans font-medium rounded-xl shadow py-2 text-sm">Agregar</button>
        </form>
      </div>
      <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 overflow-x-auto">
        <div class="catalog-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-serif font-semibold text-lg text-stone-900">Catálogo de libros</h3>
          <div class="relative sm:w-64">
            <i aria-hidden="true" class="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
            <input id="catalog-search-input" aria-label="Buscar en el catálogo por título, autor o ISBN" type="text" placeholder="Buscar por título, autor o ISBN..." value="${escapeHtml(this.catalogSearch || '')}"
              class="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-md bg-white focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
          </div>
        </div>
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 uppercase text-[10px] font-black">
            <tr>
              <th class="text-left px-4 py-3">Obra</th>
              <th class="text-left px-4 py-3">ISBN</th>
              <th class="text-center px-4 py-3">Disponibles</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody id="catalog-tbody">${this._renderBookRows(libros)}</tbody>
        </table>
        <div id="catalog-pagination">${this._paginacionHtml(this.bookPage, total, porPagina, 'catalog-page-btn')}</div>
      </div>
    `;

    this._booksCache = libros;

    document.getElementById('add-book-form').addEventListener('submit', async e => {
      e.preventDefault();
      if (!this.validateBookForm(false)) return;
      try {
        await db.agregarLibro({
          isbn: document.getElementById('new-book-isbn').value.trim(),
          titulo: document.getElementById('new-book-title').value.trim(),
          autor: document.getElementById('new-book-author').value.trim(),
          genero: document.getElementById('new-book-genre').value.trim(),
          ubicacion: document.getElementById('new-book-location').value.trim(),
          stock: Number(document.getElementById('new-book-qty').value || 1)
        });
        this.showToast('Libro agregado.', 'success');
        this.renderCatalog();
      } catch (err) {
        this.showToast(err.message || 'No se pudo agregar el libro.', 'error');
      }
    });

    this._bindCatalogRowEvents(container);
    this._bindPaginacion(container, '.catalog-page-btn', p => { this.bookPage = p; this.renderCatalog(); });

    // Buscador con debounce: espera 350ms sin escribir antes de consultar la BD.
    // Al buscar se vuelve a la primera página, porque el total de resultados cambió.
    const searchInput = document.getElementById('catalog-search-input');
    searchInput.addEventListener('input', () => {
      clearTimeout(this._catalogSearchTimer);
      this._catalogSearchTimer = setTimeout(async () => {
        this.catalogSearch = searchInput.value.trim();
        this.bookPage = 0;
        const { libros: resultados, total: totalNuevo } = await db.obtenerLibros(this.catalogSearch, 0, porPagina);
        const tbody = document.getElementById('catalog-tbody');
        if (this.currentView !== 'catalog' || !tbody) return;
        this._booksCache = resultados;
        tbody.innerHTML = this._renderBookRows(resultados);
        const paginacion = document.getElementById('catalog-pagination');
        if (paginacion) {
          paginacion.innerHTML = this._paginacionHtml(0, totalNuevo, porPagina, 'catalog-page-btn');
          this._bindPaginacion(container, '.catalog-page-btn', p => { this.bookPage = p; this.renderCatalog(); });
        }
        this._bindCatalogRowEvents(container);
      }, 350);
    });
  },

  // HTML de las filas del catálogo. Separado de renderCatalog para poder
  // refrescar solo el <tbody> cuando se busca, sin recrear todo el formulario.
  _renderBookRows(books) {
    return books.map(b => `
      <tr class="border-t border-stone-200">
        <td class="px-4 py-3">
          <div class="flex items-start gap-3">
            ${this._portadaHtml(b)}
            <div class="min-w-0">
              <div class="font-bold text-stone-800">${escapeHtml(b.titulo)}</div>
              <div class="text-xs text-stone-500">${escapeHtml(b.autor)}</div>
              ${(b.genero || b.ubicacion) ? `
                <div class="flex flex-wrap gap-1 mt-1">
                  ${b.genero ? `<span class="stamp stamp-info !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-tag"></i> ${escapeHtml(b.genero)}</span>` : ''}
                  ${b.ubicacion ? `<span class="stamp stamp-success !rotate-0 !text-[9px] !py-0.5 !px-1.5"><i aria-hidden="true" class="fas fa-location-dot"></i> ${escapeHtml(b.ubicacion)}</span>` : ''}
                </div>` : ''}
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-stone-500">${escapeHtml(b.isbn)}</td>
        <td class="px-4 py-3 text-center">${b.stock}</td>
        <td class="px-4 py-3 text-right whitespace-nowrap space-x-2">
          <button class="loan-book-btn text-patrimonio-lago font-bold" data-id="${b.id}">Prestar</button>
          ${this.currentUserRole === 'admin' ? `
            <button class="edit-book-btn text-stone-500 hover:text-patrimonio-madera font-bold" data-id="${b.id}">Editar</button>
            <button class="delete-book-btn text-rose-700 font-bold" data-id="${b.id}">Eliminar</button>` : ''}
        </td>
      </tr>
    `).join('') || `<tr><td colspan="4" class="px-4 py-6 text-center text-stone-500">Sin libros que coincidan con la búsqueda.</td></tr>`;
  },

  // Vuelve a enganchar los botones de Prestar/Eliminar del catálogo. Se llama tanto
  // al renderizar la vista completa como al refrescar el <tbody> tras una búsqueda.
  _bindCatalogRowEvents(container) {
    container.querySelectorAll('.delete-book-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await this.showConfirm('¿Eliminar este libro? Esta acción no se puede deshacer.', { title: 'Eliminar libro', confirmText: 'Eliminar' });
        if (!ok) return;
        try {
          await db.eliminarLibro(btn.dataset.id);
          this.showToast('Libro eliminado.', 'success');
          this.renderCatalog();
        } catch (err) {
          this.showToast(err.message || 'No se pudo eliminar.', 'error');
        }
      });
    });

    container.querySelectorAll('.loan-book-btn').forEach(btn => {
      btn.addEventListener('click', () => this.promptCreateLoan(btn.dataset.id));
    });

    container.querySelectorAll('.edit-book-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const libro = (this._booksCache || []).find(b => String(b.id) === String(btn.dataset.id));
        if (libro) this.showEditBookModal(libro);
      });
    });
  },

  /**
   * Editar un libro. Antes no existía: corregir una errata en el título
   * obligaba a eliminar el libro y volver a crearlo, lo que borraba su
   * historial de préstamos.
   */
  showEditBookModal(libro) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-patrimonio-lago/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4';
    const campo = (id, etiqueta, valor, extra = '') => `
      <div>
        <label for="${id}" class="text-[11px] font-black uppercase tracking-wide text-stone-600 mb-1 block">${etiqueta}</label>
        <input id="${id}" value="${escapeHtml(valor ?? '')}" ${extra}
          class="w-full px-3 py-2 border border-stone-300 rounded-md bg-white text-sm focus:outline-none focus:border-patrimonio-lago focus:ring-1 focus:ring-patrimonio-lago" />
      </div>`;

    overlay.innerHTML = `
      <div class="bg-patrimonio-card border border-stone-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="font-serif text-lg font-bold text-stone-900">Editar libro</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${campo('edit-book-title', 'Título', libro.titulo)}
          ${campo('edit-book-author', 'Autor', libro.autor)}
          ${campo('edit-book-isbn', 'ISBN', libro.isbn)}
          ${campo('edit-book-qty', 'Ejemplares en total', libro.copias_totales ?? libro.stock, 'type="number" min="0"')}
          ${campo('edit-book-genre', 'Género', libro.genero)}
          ${campo('edit-book-location', 'Ubicación', libro.ubicacion)}
        </div>
        <p class="text-[11px] text-stone-500 -mt-1">
          Escribe cuántos ejemplares tiene la biblioteca en total. El sistema calcula solo cuántos están
          disponibles según los préstamos activos${(libro.copias_totales ?? libro.stock) - (libro.stock ?? 0) > 0
            ? ` (ahora hay ${(libro.copias_totales ?? libro.stock) - (libro.stock ?? 0)} prestado(s))` : ''}.
        </p>
        <div>
          ${campo('edit-book-plazo', 'Plazo de préstamo propio (días, opcional)', libro.dias_prestamo_override, 'type="number" min="0" placeholder="Usa el plazo general"')}
          <p class="text-[11px] text-stone-500 mt-1">
            Déjalo vacío para usar el plazo general del sistema. Escribe <span class="font-mono">0</span> para
            material de referencia que no circula (no se puede prestar). Cualquier otro número reemplaza el
            plazo general solo para este libro.
          </p>
        </div>
        ${campo('edit-book-cover', 'URL de portada (opcional)', libro.portada_url, 'placeholder="https://..."')}
        <p class="text-[11px] text-stone-500">Usa este campo para las obras locales y patrimoniales, que no aparecen en catálogos internacionales.</p>
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
      // validateBookForm(true) lee justamente estos ids edit-book-*
      if (!this.validateBookForm(true)) return;
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        // Los datos descriptivos se actualizan directamente...
        const plazoTexto = document.getElementById('edit-book-plazo').value.trim();
        await db.actualizarLibro(libro.id, {
          titulo: document.getElementById('edit-book-title').value.trim(),
          autor: document.getElementById('edit-book-author').value.trim(),
          isbn: document.getElementById('edit-book-isbn').value.trim(),
          genero: document.getElementById('edit-book-genre').value.trim(),
          ubicacion: document.getElementById('edit-book-location').value.trim(),
          portada_url: document.getElementById('edit-book-cover').value.trim(),
          // Vacío = null = usa el plazo general (dias_prestamo).
          diasPrestamoOverride: plazoTexto === '' ? null : Number(plazoTexto)
        });

        // ...pero el número de ejemplares pasa por ajustar_copias, que recalcula
        // las disponibles descontando los préstamos activos. Escribir el stock
        // directamente era lo que corrompía el inventario.
        const totalNuevo = Number(document.getElementById('edit-book-qty').value || 0);
        if (totalNuevo !== (libro.copias_totales ?? libro.stock)) {
          await db.ajustarCopias(libro.id, totalNuevo);
        }

        cerrar();
        this.showToast('Libro actualizado.', 'success');
        this.renderCatalog();
      } catch (err) {
        this.showToast(err.message || 'No se pudo guardar.', 'error');
        btn.disabled = false;
      }
    });
  },

  /**
   * Prestar desde el Catálogo.
   *
   * Antes había dos caminos distintos para lo mismo: desde el Mesón se
   * consultaba la situación del lector y se mostraba ANTES de confirmar, y
   * desde el Catálogo simplemente se intentaba y se mostraba el error. Eso
   * significaba que la misma persona, haciendo lo mismo, obtenía una respuesta
   * distinta según por dónde hubiera entrado — y desde el Catálogo no había
   * forma de registrar a un lector nuevo sin abandonar lo que estaba haciendo.
   *
   * Ahora los dos usan el mismo flujo.
   */
  async promptCreateLoan(bookId) {
    await this.flujoPrestamo(bookId, () => {
      if (this.currentView === 'catalog') this.renderCatalog();
    });
  }
};
