const fs = require('fs');
let content = fs.readFileSync('src/js/vistas/bibliomovil.js', 'utf8');

content = "import { supabase } from '../supabase-init.js';\n" + content;

content = content.replace(/const \{ libros, total \} = await LibroRepository\.obtenerLibros\(this\.bibliomovilSearch \|\| '', this\.bookPage, porPagina\);/g, 
`let query = supabase.from('libros').select('*', { count: 'exact' }).ilike('ubicacion', '%bibliom%').order('titulo', { ascending: true }).range(this.bookPage * porPagina, (this.bookPage + 1) * porPagina - 1);
if (this.bibliomovilSearch) query = query.or(\`titulo.ilike.%\${this.bibliomovilSearch}%,autor.ilike.%\${this.bibliomovilSearch}%\`);
const { data: librosData, count: totalCount } = await query;
const libros = librosData || [];
const total = totalCount || 0;`);

content = content.replace(/const \{ libros: resultados, total: totalNuevo \} = await LibroRepository\.obtenerLibros\(this\.bibliomovilSearch, 0, porPagina\);/g,
`let queryRes = supabase.from('libros').select('*', { count: 'exact' }).ilike('ubicacion', '%bibliom%').order('titulo', { ascending: true }).range(0, porPagina - 1);
if (this.bibliomovilSearch) queryRes = queryRes.or(\`titulo.ilike.%\${this.bibliomovilSearch}%,autor.ilike.%\${this.bibliomovilSearch}%\`);
const { data: resData, count: resCount } = await queryRes;
const resultados = resData || [];
const totalNuevo = resCount || 0;`);

fs.writeFileSync('src/js/vistas/bibliomovil.js', content, 'utf8');
console.log("Success");
