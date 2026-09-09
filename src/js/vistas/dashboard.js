// Vista Dashboard. Extraído mecánicamente de js/modules/ui.js (Fase 4).
import { db } from '../modules/db.js';
import { CONFIG } from '../config.js';
import { html } from '../modules/utilidades.js';

export default {
  async renderDashboard() {
    const container = this._container();
    if (!container) return;

    // Llamada asíncrona a Supabase (nombres alineados con db.obtenerEstadisticas)
    const stats = await db.obtenerEstadisticas();
    // Si el usuario ya cambió de vista mientras esperábamos la respuesta, no pintamos nada
    if (this.currentView !== 'dashboard') return;
    const roleInfo = CONFIG.ROLE_LABELS[this.currentUserRole] || CONFIG.ROLE_LABELS.librero;
    const isAdmin = this.currentUserRole === 'admin';

    const cards = [
      { label: 'Préstamos activos', value: stats.prestamos, icon: 'fa-right-left', color: 'text-patrimonio-lago' },
      { label: 'Libros registrados', value: stats.libros, icon: 'fa-book', color: 'text-patrimonio-madera' },
      { label: 'Lectores registrados', value: stats.lectores, icon: 'fa-users', color: 'text-patrimonio-bosque' },
      { label: 'Préstamos vencidos', value: stats.noDevueltos, icon: 'fa-triangle-exclamation', color: 'text-rose-700' }
    ];

    // Accesos rápidos: cada rol ve las acciones que realmente usa en su turno
    const quickActions = isAdmin
      ? [
          { view: 'catalog', label: 'Agregar libro', icon: 'fa-book-medical' },
          { view: 'users', label: 'Agregar lector', icon: 'fa-user-plus' },
          { view: 'loans', label: 'Ver préstamos', icon: 'fa-right-left' }
        ]
      : [
          { view: 'scanner', label: 'Escanear libro', icon: 'fa-barcode' },
          { view: 'loans', label: 'Ver préstamos', icon: 'fa-right-left' },
          { view: 'catalog', label: 'Buscar en catálogo', icon: 'fa-magnifying-glass' }
        ];

    container.innerHTML = html`
      ${this.desajusteDeRol ? html`
        <div class="mb-5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3" role="alert">
          <p class="text-sm font-bold text-amber-900 mb-1">
            <i aria-hidden="true" class="fas fa-triangle-exclamation mr-1.5"></i>Tu rol de administrador no está en la base de datos
          </p>
          <p class="text-xs text-amber-800 leading-relaxed">
            Ves el panel de administración porque tu correo figura en <code class="font-mono">config.js</code>,
            pero la tabla <code class="font-mono">usuarios</code> te tiene como librero, y es esa tabla la que
            manda del lado del servidor. Las acciones de administración van a fallar hasta que lo corrijas.
            Ejecuta esto en el editor SQL de Supabase, con tu correo:
          </p>
          <pre class="mt-2 bg-white/70 border border-amber-200 rounded-lg p-2 text-[11px] font-mono overflow-x-auto text-stone-800">insert into public.usuarios (id, email, rol)
select id, email, 'admin' from auth.users where email = '${this.currentUserEmail}'
on conflict (id) do update set rol = 'admin';</pre>
        </div>` : ''}

      <div class="mb-5">
        <h3 class="font-serif font-semibold text-xl text-stone-900">Hola, ${this._nombreParaSaludo()}</h3>
        <p class="text-xs text-stone-500">${roleInfo.welcome}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        ${cards.map(c => html`
          <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
            <i aria-hidden="true" class="fas ${c.icon} ${c.color} text-xl mb-2"></i>
            <p class="font-serif font-semibold text-4xl text-stone-900">${c.value}</p>
            <p class="text-xs text-stone-500 font-bold uppercase tracking-wide mt-1">${c.label}</p>
          </div>
        `)}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Anillo 1: dónde están físicamente las copias en este momento -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Estado del fondo</h3>
          <p class="text-xs text-stone-500 mb-4">Dónde están las copias ahora mismo.</p>
          <div class="relative h-44 mb-3">
            <canvas id="fondo-chart"></canvas>
            <div id="fondo-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
          </div>
          <div id="fondo-legend" class="divide-y divide-stone-100"></div>
        </div>

        <!-- Anillo 2: cómo se comportan los préstamos históricos -->
        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-1">Préstamos</h3>
          <p class="text-xs text-stone-500 mb-4">Devueltos, al día y atrasados.</p>
          <div class="relative h-44 mb-3">
            <canvas id="prestamos-chart"></canvas>
            <div id="prestamos-chart-centro" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"></div>
          </div>
          <div id="prestamos-legend" class="divide-y divide-stone-100"></div>
        </div>

        <div class="catalog-card bg-patrimonio-card rounded-2xl shadow-sm border border-stone-300 p-5">
          <h3 class="font-serif font-semibold text-lg text-stone-900 mb-4">Accesos rápidos</h3>
          <div class="space-y-2">
            ${quickActions.map(a => html`
              <button data-quick-view="${a.view}" class="quick-action-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-700 hover:border-patrimonio-madera hover:text-patrimonio-madera transition">
                <i aria-hidden="true" class="fas ${a.icon} w-4 text-center"></i>
                <span>${a.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.quickView));
    });

    // Anillo 1 — las copias son partes de un mismo total, así que la proporción
    // tiene sentido: cada ejemplar está en el estante o está prestado.
    this._renderDonut('fondo-chart', 'fondo-legend', [
      { etiqueta: 'En estante', valor: stats.enEstante, color: '#7A431D' },
      { etiqueta: 'Prestados', valor: stats.prestamos, color: '#1B3B48' }
    ]);

    // Anillo 2 — todos los préstamos de la historia, separados por su desenlace.
    // Los "activos al día" se calculan restando los vencidos a los activos.
    this._renderDonut('prestamos-chart', 'prestamos-legend', [
      { etiqueta: 'Devueltos', valor: stats.devueltos, color: '#2C4A3E' },
      { etiqueta: 'Activos al día', valor: Math.max(0, stats.prestamos - stats.noDevueltos), color: '#1B3B48' },
      { etiqueta: 'Atrasados', valor: stats.noDevueltos, color: '#be123c' }
    ]);
  }
};
