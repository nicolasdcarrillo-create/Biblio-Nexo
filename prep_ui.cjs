const fs = require('fs');
let content = fs.readFileSync('src/js/modules/ui.js', 'utf8');

content = content.replace("import mostrador from '../vistas/mostrador.js';", "import mostrador from '../vistas/mostrador.js';\nimport bibliomovil from '../vistas/bibliomovil.js';");
content = content.replace("Object.assign(UIManager.prototype, UIModales, dashboard, reportes, perfil, admin, catalogo, lectores, prestamos, mostrador);", "Object.assign(UIManager.prototype, UIModales, dashboard, reportes, perfil, admin, catalogo, lectores, prestamos, mostrador, bibliomovil);");

fs.writeFileSync('src/js/modules/ui.js', content, 'utf8');
console.log("Success");
