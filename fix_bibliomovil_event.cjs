const fs = require('fs');
let content = fs.readFileSync('src/js/vistas/bibliomovil.js', 'utf8');

// Replace everything from document.getElementById('add-book-form') to this._bindCatalogRowEvents(container);
content = content.replace(/document\.getElementById\('add-book-form'\)\.addEventListener[\s\S]*?this\._bindCatalogRowEvents\(container\);/, 'this._bindCatalogRowEvents(container);');

fs.writeFileSync('src/js/vistas/bibliomovil.js', content, 'utf8');
console.log("Success");
