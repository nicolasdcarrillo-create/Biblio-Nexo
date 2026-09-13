const fs = require('fs');
let content = fs.readFileSync('src/js/main.js', 'utf8');

const regex = /\/\*\*\s*\n\s*\* Registro del service worker[\s\S]*?\/\/ El Service Worker ahora lo inyecta automáticamente vite-plugin-pwa/;

content = content.replace(regex, '// El Service Worker ahora lo inyecta automáticamente vite-plugin-pwa');

fs.writeFileSync('src/js/main.js', content, 'utf8');
console.log("Success");
