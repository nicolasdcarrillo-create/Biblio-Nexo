const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(file, 'utf8');
            if (content.includes('nav-menu')) {
                console.log("Found in: " + file);
            }
        }
    });
    return results;
}
walk('src/js');
