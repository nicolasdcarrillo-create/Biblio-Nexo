const fs = require('fs');

let uiModales = fs.readFileSync('src/js/modules/ui-modales.js', 'utf8');
uiModales = uiModales.replace(
    /toast.className = `\\\$\\{bgColor\\} text-white px-5 py-4 rounded-2xl shadow-soft-xl border border-white\/10 backdrop-blur-md/g,
    "toast.className = `\${bgColor} text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/20"
);
fs.writeFileSync('src/js/modules/ui-modales.js', uiModales, 'utf8');

