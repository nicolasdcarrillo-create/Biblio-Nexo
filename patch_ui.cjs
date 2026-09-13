const fs = require('fs');

// 1. Fix ui-modales.js
let uiModales = fs.readFileSync('src/js/modules/ui-modales.js', 'utf8');
uiModales = uiModales.replace(
    /const bgColor = type === 'success' \? 'bg-emerald-500\/90' : type === 'error' \? 'bg-rose-600\/90' : 'bg-patrimonio-lago\/90';/g,
    "const bgColor = type === 'success' ? 'bg-[#10b981]' : type === 'error' ? 'bg-[#e11d48]' : 'bg-[#1B3B48]';"
);
// Also remove backdrop-blur-md from toast to ensure solid color if backdrop filter is acting up
uiModales = uiModales.replace(
    /toast.className = `\$\{bgColor\} text-white px-5 py-4 rounded-2xl shadow-soft-xl border border-white\/10 backdrop-blur-md/g,
    "toast.className = `\${bgColor} text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/20"
);
fs.writeFileSync('src/js/modules/ui-modales.js', uiModales, 'utf8');

// 2. Fix catalogo.js
let catalogo = fs.readFileSync('src/js/vistas/catalogo.js', 'utf8');

// Filters
const oldFilterTodos = /<button class="catalog-filter-btn px-3 py-1\.5 rounded-full text-\[11px\] uppercase tracking-wider font-bold transition-all \$\{\(!this.catalogFilter \|\| this.catalogFilter === 'todos'\) \? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'\}" data-filter="todos">Todos<\/button>/g;
const oldFilterDisp = /<button class="catalog-filter-btn px-3 py-1\.5 rounded-full text-\[11px\] uppercase tracking-wider font-bold transition-all \$\{this.catalogFilter === 'disponibles' \? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-900 shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'\}" data-filter="disponibles">En estante<\/button>/g;
const oldFilterPres = /<button class="catalog-filter-btn px-3 py-1\.5 rounded-full text-\[11px\] uppercase tracking-wider font-bold transition-all \$\{this.catalogFilter === 'prestados' \? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-stone-900 shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'\}" data-filter="prestados">Agotados<\/button>/g;

const newFilterTodos = `<button class="catalog-filter-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all \${(!this.catalogFilter || this.catalogFilter === 'todos') ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-md scale-105' : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'}" data-filter="todos">Todos</button>`;
const newFilterDisp = `<button class="catalog-filter-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all \${this.catalogFilter === 'disponibles' ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-900 shadow-md scale-105' : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'}" data-filter="disponibles">En estante</button>`;
const newFilterPres = `<button class="catalog-filter-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all \${this.catalogFilter === 'prestados' ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-stone-900 shadow-md scale-105' : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'}" data-filter="prestados">Agotados</button>`;

catalogo = catalogo.replace(oldFilterTodos, newFilterTodos);
catalogo = catalogo.replace(oldFilterDisp, newFilterDisp);
catalogo = catalogo.replace(oldFilterPres, newFilterPres);

// Prestar button
const oldPrestar = /<button class="loan-book-btn btn-secundario px-4 py-2 rounded-xl text-xs font-bold text-patrimonio-lago border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition" data-id="\$\{b\.id\}"><i aria-hidden="true" class="fas fa-hand-holding-hand mr-1"><\/i> Prestar<\/button>/g;
const newPrestar = `<button class="loan-book-btn bg-patrimonio-madera text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-[#5E3214] transition-all hover:scale-105 active:scale-95" data-id="\${b.id}"><i aria-hidden="true" class="fas fa-hand-holding-hand mr-1"></i> Prestar</button>`;
catalogo = catalogo.replace(oldPrestar, newPrestar);

fs.writeFileSync('src/js/vistas/catalogo.js', catalogo, 'utf8');

console.log("Done patching visual bugs");
