const fs = require('fs');
let c = fs.readFileSync('src/js/vistas/mostrador.js', 'utf8');
c = c.replace('</label>`n          <div id="scan-result" class="mt-5">', '</label>\n          <div id="scan-result" class="mt-5">');
fs.writeFileSync('src/js/vistas/mostrador.js', c);
