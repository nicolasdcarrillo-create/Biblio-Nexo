const fs = require('fs');

let uiModales = fs.readFileSync('src/js/modules/ui-modales.js', 'utf8');
uiModales = uiModales.replace(
    'backdrop-blur-md',
    ''
);
fs.writeFileSync('src/js/modules/ui-modales.js', uiModales, 'utf8');
