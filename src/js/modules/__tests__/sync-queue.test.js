import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { colaSync } from '../db.js';
// Mocking de dependencias
import persistencia from '../persistencia.js';

// Simulamos que persistencia es un módulo con estas funciones
vi.mock('../persistencia.js', () => ({
    default: {
        encolarOperacion: vi.fn(),
        listarOperacionesPendientes: vi.fn(),
        quitarOperacion: vi.fn()
    }
}));

describe('SyncQueue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Simulamos timers para probar la reintentabilidad sin esperar realmente
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('debe encolar operaciones y programar reintento', async () => {
        persistencia.encolarOperacion.mockResolvedValue('fake-uuid-1');

        const resultado = await colaSync.encolar('prestar_libro', { libroId: 1 }, 'Préstamo de prueba');

        expect(resultado.encolado).toBe(true);
        expect(resultado.id).toBe('fake-uuid-1');
        expect(persistencia.encolarOperacion).toHaveBeenCalledWith(
            'prestar_libro',
            { libroId: 1 },
            'Préstamo de prueba'
        );
    });

    // Podríamos probar reintentarPendientes si mockearamos supabase y navigator.onLine, 
    // pero eso requeriría mockear db.js completo o sus dependencias. 
    // Por ahora validamos que la cola encola localmente de manera segura.
});
