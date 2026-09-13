const fs = require('fs');
let content = fs.readFileSync('src/js/vistas/prestamos.js', 'utf8');

content = content.replace("import { html, crudo } from '../modules/utilidades.js';", "import { html, crudo, escapeHtml } from '../modules/utilidades.js';");

fs.writeFileSync('src/js/vistas/prestamos.js', content, 'utf8');
console.log("Success");
