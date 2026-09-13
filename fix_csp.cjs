const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace("img-src 'self' data: https://covers.openlibrary.org;", "img-src 'self' data: https://covers.openlibrary.org;\n        manifest-src 'self';");

fs.writeFileSync('index.html', content, 'utf8');
console.log("Success");
