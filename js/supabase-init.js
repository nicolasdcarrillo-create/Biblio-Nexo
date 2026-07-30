import { CONFIG } from './config.js';

let client = null;
if (!window.supabase) {
    console.error('Error crítico: Supabase no cargado desde el CDN.');
} else {
    client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
}

export const supabase = client;
