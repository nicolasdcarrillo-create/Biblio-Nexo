const fs = require('fs');
let content = fs.readFileSync('src/js/vistas/bibliomovil.js', 'utf8');

// Change export default
content = content.replace(/export default \{/, 'export default {\n  // Bibliomóvil overrides');

// Replace renderCatalog with renderBibliomovil
content = content.replace(/renderCatalog/g, 'renderBibliomovil');
content = content.replace(/currentView !== 'catalog'/g, "currentView !== 'bibliomovil'");
content = content.replace(/catalogFilter/g, 'bibliomovilFilter');
content = content.replace(/catalogSearch/g, 'bibliomovilSearch');

// Modify the DOM IDs to avoid conflict
content = content.replace(/catalog-card/g, 'bibliomovil-card');
content = content.replace(/catalog-search-input/g, 'bibliomovil-search-input');
content = content.replace(/catalog-filter-btn/g, 'bibliomovil-filter-btn');
content = content.replace(/catalog-tbody/g, 'bibliomovil-tbody');
content = content.replace(/catalog-pagination/g, 'bibliomovil-pagination');
content = content.replace(/catalog-page-btn/g, 'bibliomovil-page-btn');

// Also remove the "Agregar libro" form, since we only need to view the catalog for the bibliomovil
content = content.replace(/<form id="add-book-form"[\s\S]*?<\/form>/, '');

// Also change the title
content = content.replace(/<h3 class="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">Agregar libro<\/h3>/, '');

fs.writeFileSync('src/js/vistas/bibliomovil.js', content, 'utf8');
console.log("Success");
