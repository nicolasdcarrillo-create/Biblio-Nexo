const fs = require('fs');
let content = fs.readFileSync('src/js/vistas/bibliomovil.js', 'utf8');

content = content.replace(/document\.getElementById\('add-book-form'\)\.addEventListener\('submit', async \(e\) => \{[\s\S]*?\}\);/, '');

fs.writeFileSync('src/js/vistas/bibliomovil.js', content, 'utf8');
console.log("Success");
