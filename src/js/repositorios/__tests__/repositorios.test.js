import { describe, it, expect, vi } from 'vitest';
import { db } from '../../modules/db.js';
import { LibroRepository } from '../LibroRepository.js';
import { LectorRepository } from '../LectorRepository.js';
import { AdminRepository } from '../AdminRepository.js';

// Mapear db para simular las llamadas
vi.mock('../../modules/db.js', () => ({
  db: {
    obtenerLibros: vi.fn(),
    obtenerLectores: vi.fn(),
    obtenerAuditoria: vi.fn()
  }
}));

describe('Repositorios', () => {
  it('LibroRepository.obtenerLibros delega a db.obtenerLibros', async () => {
    db.obtenerLibros.mockResolvedValueOnce({ libros: [], total: 0 });
    const result = await LibroRepository.obtenerLibros('harry', 0, 10);
    expect(db.obtenerLibros).toHaveBeenCalledWith('harry', 0, 10);
    expect(result).toEqual({ libros: [], total: 0 });
  });

  it('LectorRepository.obtenerLectores delega a db.obtenerLectores', async () => {
    db.obtenerLectores.mockResolvedValueOnce({ lectores: [], total: 0 });
    const result = await LectorRepository.obtenerLectores('11111111-1', 0, 10);
    expect(db.obtenerLectores).toHaveBeenCalledWith('11111111-1', 0, 10);
    expect(result).toEqual({ lectores: [], total: 0 });
  });

  it('AdminRepository.obtenerAuditoria delega a db.obtenerAuditoria', async () => {
    db.obtenerAuditoria.mockResolvedValueOnce([]);
    const result = await AdminRepository.obtenerAuditoria(50);
    expect(db.obtenerAuditoria).toHaveBeenCalledWith(50);
    expect(result).toEqual([]);
  });
});
