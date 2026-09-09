import { vi } from 'vitest';

// Mocar Supabase global para evitar el error de CDN en entornos jsdom (tests)
window.supabase = {
    createClient: vi.fn(() => ({
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
        })),
        rpc: vi.fn()
    }))
};
