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
            let idx = content.indexOf('showToast');
            if (idx !== -1) {
                // print lines where it's defined
                let lines = content.split('\n');
                lines.forEach((line, i) => {
                    if (line.includes('showToast(') && !line.includes('this.showToast')) {
                        console.log(file, i+1, line);
                    }
                });
            }
        }
    });
    return results;
}
walk('src/js');
