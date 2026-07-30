// Verificación de contraste WCAG 2.1 (Decreto N° 1/2015 exige estándares W3C)
// AA requiere 4.5:1 en texto normal y 3:1 en texto grande (>=18.66px negrita o >=24px)
const hex = h => { const n = parseInt(h.replace('#',''),16); return [(n>>16)&255,(n>>8)&255,n&255]; };
const lum = ([r,g,b]) => { const f = c => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio = (a,b) => { const [l1,l2]=[lum(hex(a)),lum(hex(b))].sort((x,y)=>y-x); return (l1+0.05)/(l2+0.05); };

const P = {
  base:'#F7F4EB', card:'#FFFFFF', madera:'#7A431D', maderaHover:'#633414',
  lago:'#1B3B48', bosque:'#2C4A3E', stone500:'#78716c', stone400:'#a8a29e',
  stone600:'#57534e', rose700:'#be123c', amber600:'#d97706', amber700:'#b45309',
  blanco:'#FFFFFF', ambar:'#F6B26B'
};

const casos = [
  // [descripción, textoColor, fondoColor, mínimo]
  ['Texto principal sobre papel',        P.lago,     P.base, 4.5],
  ['Texto principal sobre tarjeta',      P.lago,     P.card, 4.5],
  ['Texto secundario (stone-600)',       P.stone600, P.card, 4.5],
  ['Texto auxiliar (stone-500)',         P.stone500, P.card, 4.5],
  ['Texto tenue sobre panel oscuro',     P.stone400, P.lago, 4.5],
  ['Enlace/acento madera sobre tarjeta', P.madera,   P.card, 4.5],
  ['Botón madera: blanco sobre madera',  P.blanco,   P.madera, 4.5],
  ['Botón madera hover',                 P.blanco,   P.maderaHover, 4.5],
  ['Botón lago: blanco sobre lago',      P.blanco,   P.lago, 4.5],
  ['Botón bosque: blanco sobre bosque',  P.blanco,   P.bosque, 4.5],
  ['Alerta atraso (rose-700)',           P.rose700,  P.card, 4.5],
  ['Alerta por vencer (amber-700)',      P.amber700, P.card, 4.5],
  ['Foco sobre panel oscuro',            P.ambar,    P.lago, 3.0],
];

let fallos = 0;
console.log('CONTRASTE WCAG 2.1 AA\n' + '='.repeat(62));
for (const [desc, fg, bg, min] of casos) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fallos++;
  console.log(`${ok?'✓':'✗'} ${desc.padEnd(38)} ${r.toFixed(2)}:1  (min ${min})`);
}
console.log('='.repeat(62));
console.log(fallos === 0 ? 'Todos cumplen AA' : `${fallos} combinación(es) NO cumplen AA`);

// Además se verifica que los colores descartados no hayan vuelto al código
import fs from 'fs';
const ui = fs.readFileSync(new URL('../js/modules/ui.js', import.meta.url), 'utf8');
const prohibidos = [
  ['text-amber-600', 'solo 3.19:1 sobre blanco, usar amber-700'],
];
let regresiones = 0;
for (const [clase, motivo] of prohibidos) {
  const n = (ui.match(new RegExp(clase, 'g')) || []).length;
  if (n > 0) { console.log(`✗ ${clase} reapareció ${n} vez/veces — ${motivo}`); regresiones++; }
}
// stone-400 solo se acepta sobre fondo oscuro
const lineasClaras = ui.split('\n').filter(l =>
  l.includes('text-stone-400') && !/sidebar|glass-panel|text-white|Región de Los Ríos|bg-patrimonio-lago|stone-300 mt-1/.test(l));
if (lineasClaras.length > 0) {
  console.log(`✗ text-stone-400 sobre fondo claro en ${lineasClaras.length} línea(s) — solo 2.52:1`);
  regresiones++;
}
if (regresiones === 0) console.log('Sin regresiones de color en el código');
process.exit(fallos > 0 || regresiones > 0 ? 1 : 0);
process.exit(fallos > 0 ? 1 : 0);
