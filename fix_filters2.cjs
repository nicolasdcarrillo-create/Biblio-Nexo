const fs = require('fs');
let content = fs.readFileSync('src/js/vistas/catalogo.js', 'utf8');

const regex = /this\._bindCatalogRowEvents\(container\);\s+this\._bindPaginacion\(container, '\.catalog-page-btn', p => \{ this\.bookPage = p; this\.renderCatalog\(\); \}\);/;

const replacement = `this._bindCatalogRowEvents(container);
    this._bindPaginacion(container, '.catalog-page-btn', p => { this.bookPage = p; this.renderCatalog(); });

    container.querySelectorAll('.catalog-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.catalogFilter = btn.dataset.filter;
        this.bookPage = 0;
        this.renderCatalog();
      });
    });`;

if (regex.test(content)) {
    // Only replace the first occurrence (which is inside renderCatalog, not the one in the debounce setTimeout)
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/js/vistas/catalogo.js', content, 'utf8');
    console.log("Success");
} else {
    console.log("Regex not found");
}
