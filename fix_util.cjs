const fs = require('fs');
let utilidades = fs.readFileSync('src/js/modules/utilidades.js', 'utf8');

const regexTime = /export function conTiempoLimite\([\s\S]*?\)\s*\{[\s\S]*?return Promise\.race\(\[[\s\S]*?new Promise\(\(_, rechazar\) => setTimeout\(\(\) => rechazar\(new Error\(mensaje\)\), ms\)\)[\s\S]*?\]\);[\s\n]*\}/;
const newTime = `export function conTiempoLimite(
    promesa,
    ms = 15000,
    mensaje = 'La operaci\\u00f3n tard\\u00f3 demasiado en responder. Intente nuevamente; si el problema persiste, recargue la p\\u00e1gina.'
) {
    let idTemporizador;
    const temporizador = new Promise((_, rechazar) => {
        idTemporizador = setTimeout(() => rechazar(new Error(mensaje)), ms);
    });
    return Promise.race([promesa, temporizador]).finally(() => clearTimeout(idTemporizador));
}`;

utilidades = utilidades.replace(regexTime, newTime);
fs.writeFileSync('src/js/modules/utilidades.js', utilidades, 'utf8');
