const fs = require('fs');
let content = fs.readFileSync('pruebas/probar-interfaz.mjs', 'utf8');

content = content.replace(/\(uiCompletoJs\.match\(\/r\\\\\\\?\\\\\\.encolado\/g\) \|\| \[\]\)\.length > 8/g, '(uiCompletoJs.match(/r\\\\?\\\\.encolado/g) || []).length > 8');

fs.writeFileSync('pruebas/probar-interfaz.mjs', content, 'utf8');
console.log("Success");
