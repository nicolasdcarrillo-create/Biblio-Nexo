// Piezas que usa más de un dominio de js/modules/db/*.js — nada de lógica de
// negocio aquí, solo lo que hacía falta repetir en cada archivo si no
// estuviera en uno solo.
//
// `supabase` y `conTiempoLimite` se re-exportan desde aquí (no se importan
// por separado en cada archivo de dominio) para que cada uno tenga un solo
// punto de entrada a lo compartido.

import { supabase } from '../../supabase-init.js';
import { conTiempoLimite } from '../utilidades.js';

export { supabase, conTiempoLimite };

// Límite normal para una consulta o RPC. Ver utilidades.js: sin esto, una
// llamada colgada deja la pantalla esperando para siempre.
export const ESPERA = 15000;
// exportarTodo mueve páginas de hasta 1000 filas: se le da más margen.
export const ESPERA_RESPALDO = 25000;

/**
 * Fecha de hoy en horario de Chile, en formato YYYY-MM-DD.
 *
 * No se usa toISOString() porque devuelve UTC: en Chile (UTC-3/-4) eso
 * adelanta la fecha desde las 20:00 o 21:00, lo que desfasaba en un día el
 * conteo de préstamos atrasados. Debe coincidir con hoy_chile() en Postgres.
 */
export function hoyEnChile() {
    // en-CA produce el formato YYYY-MM-DD directamente
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

/**
 * Prepara un texto de búsqueda para usarlo dentro de un filtro `or()` de PostgREST.
 *
 * Hace falta porque PostgREST separa las condiciones por coma y usa comillas y
 * paréntesis como sintaxis. Buscar «García, Gabriel» partía el filtro en pedazos
 * y producía una consulta distinta a la pedida (o directamente inválida).
 *
 * Se eliminan los caracteres que forman parte de la sintaxis del filtro y se
 * escapan los comodines de LIKE para que se busquen literalmente.
 */
export function limpiarBusqueda(texto) {
    return (texto || '')
        .toString()
        .replace(/[,()"'\\]/g, ' ')   // sintaxis de PostgREST
        .replace(/[%_]/g, '')          // comodines de LIKE
        .trim();
}

/**
 * Detecta el error que devuelve Supabase cuando una función RPC todavía no
 * existe, es decir, cuando falta ejecutar la migración correspondiente.
 * Permite que la aplicación degrade con un mensaje claro en vez de romperse.
 */
export function esFuncionInexistente(error) {
    return error?.code === '42883' || error?.code === 'PGRST202' ||
           /function .* does not exist|could not find/i.test(error?.message || '');
}
