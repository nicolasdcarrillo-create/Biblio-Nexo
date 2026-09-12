const fs = require('fs');

// Patch db/prestamos.js
let c = fs.readFileSync('src/js/modules/db/prestamos.js', 'utf8');
const search = 'async obtenerPrestamos(filtro = \'todos\', pagina = 0, porPagina = 25, diasAviso = 3) {';
const replace = `async obtenerTodosActivosSinPaginar() {
        const { data, error } = await conTiempoLimite(
            supabase
                .from('prestamos')
                .select('id, fecha_prestamo, fecha_devolucion_esperada, libros(titulo), lectores(nombre, rut, telefono)')
                .is('fecha_devolucion_real', null)
                .order('fecha_devolucion_esperada', { ascending: true })
        );
        if (error) throw new Error(error.message);
        return data || [];
    },

    async obtenerPrestamos(filtro = 'todos', pagina = 0, porPagina = 25, diasAviso = 3) {`;
c = c.replace(search, replace);
fs.writeFileSync('src/js/modules/db/prestamos.js', c);

// Patch PrestamoRepository.js
let pr = fs.readFileSync('src/js/repositorios/PrestamoRepository.js', 'utf8');
const search2 = 'async obtenerPendientesDeAviso(diasAvisoPrevio = 2) {';
const replace2 = `async obtenerTodosActivosSinPaginar() {
        return db.obtenerTodosActivosSinPaginar();
    },

    /**
     * @param {number} diasAvisoPrevio
     * @returns {Promise<any[]>}
     */
    async obtenerPendientesDeAviso(diasAvisoPrevio = 2) {`;
pr = pr.replace(search2, replace2);
fs.writeFileSync('src/js/repositorios/PrestamoRepository.js', pr);
