const fs = require('fs');

// 1. Fix Memory Leak in ui-base.js
let uiBase = fs.readFileSync('src/js/modules/ui-base.js', 'utf8');

const regexBind = /const toggleNotifs = \(\) => \{[\s\S]*?\}\);/g;
const newBind = `const toggleNotifs = () => {
        const isHidden = notifPanel.classList.contains('opacity-0');
        if (isHidden) {
          notifPanel.classList.remove('opacity-0', 'invisible', 'scale-95');
          notifPanel.classList.add('opacity-100', 'scale-100');
        } else {
          notifPanel.classList.add('opacity-0', 'invisible', 'scale-95');
          notifPanel.classList.remove('opacity-100', 'scale-100');
        }
      };
      bellBtn.addEventListener('click', toggleNotifs);
      document.getElementById('notificaciones-close').addEventListener('click', toggleNotifs);
      
      if (this._notifOutsideClickHandler) {
        document.removeEventListener('click', this._notifOutsideClickHandler);
      }
      this._notifOutsideClickHandler = (e) => {
        if (!notifPanel.classList.contains('opacity-0') && !bellBtn.contains(e.target) && !notifPanel.contains(e.target)) {
          toggleNotifs();
        }
      };
      document.addEventListener('click', this._notifOutsideClickHandler);`;
uiBase = uiBase.replace(regexBind, newBind);
fs.writeFileSync('src/js/modules/ui-base.js', uiBase, 'utf8');

// 2. Fix Timer Leak in utilidades.js
let utilidades = fs.readFileSync('src/js/modules/utilidades.js', 'utf8');

const regexTime = /export function conTiempoLimite\(promesa, ms = 15000, mensaje = 'La petici\\u00f3n tard\\u00f3 demasiado\.'\) \{[\s\S]*?\n\}/g;
const newTime = `export function conTiempoLimite(promesa, ms = 15000, mensaje = 'La petición tardó demasiado.') {
    let idTemporizador;
    const temporizador = new Promise((_, rechazar) => {
        idTemporizador = setTimeout(() => rechazar(new Error(mensaje)), ms);
    });
    return Promise.race([promesa, temporizador]).finally(() => clearTimeout(idTemporizador));
}`;
utilidades = utilidades.replace(regexTime, newTime);
// For the unicode case:
const regexTime2 = /export function conTiempoLimite\(promesa, ms = 15000, mensaje = '.*?'\) \{\s*return Promise\.race\(\[\s*promesa,\s*new Promise\(\(_, rechazar\) => setTimeout\(\(\) => rechazar\(new Error\(mensaje\)\), ms\)\)\s*\]\);\s*\}/;
utilidades = utilidades.replace(regexTime2, newTime);
fs.writeFileSync('src/js/modules/utilidades.js', utilidades, 'utf8');

// 3. Fix UI Inconsistency in escaneo-remoto.js
if (fs.existsSync('src/js/escaneo-remoto.js')) {
    let escaneo = fs.readFileSync('src/js/escaneo-remoto.js', 'utf8');
    const regexVis = /document\.addEventListener\('visibilitychange', \(\) => \{\s*if \(document\.hidden\) Scanner\.stop\(\);\s*\}\);/g;
    const newVis = `document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        Scanner.stop();
        const erCamara = document.getElementById('er-camara-encendida');
        const erStart = document.getElementById('er-start');
        if (erCamara) erCamara.classList.add('hidden');
        if (erStart) erStart.classList.remove('hidden');
    }
});`;
    escaneo = escaneo.replace(regexVis, newVis);
    fs.writeFileSync('src/js/escaneo-remoto.js', escaneo, 'utf8');
} else {
    console.log("No escaneo-remoto.js in src/js");
}

