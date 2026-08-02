// Punto de ensamblado de la interfaz.
//
// UIManager vivía entero en este archivo (4.018 líneas, 76 métodos). Se partió
// en js/modules/ui-base.js (constructor y lo transversal: validaciones,
// widgets genéricos, navegación, pantallas de autenticación) más un archivo
// por vista en js/vistas/. Cada uno exporta un objeto plano de métodos que se
// mezcla sobre el prototipo aquí abajo — así "this" sigue siendo la instancia
// dentro de cada método, exactamente igual que cuando estaban todos juntos.
import UIManager from './ui-base.js';
import dashboard from '../vistas/dashboard.js';
import reportes from '../vistas/reportes.js';

Object.assign(UIManager.prototype, dashboard, reportes);

export default new UIManager();
