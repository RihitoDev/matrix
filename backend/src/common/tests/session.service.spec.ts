import { describe, expect, it, vi } from 'vitest';
import { SessionRepository } from '../repositories/session.repository.js';
import { SessionService } from '../services/session.service.js';

function createService() {
  const findActiveUserById = vi.fn();
  const repository = { findActiveUserById } as unknown as SessionRepository;
  return { service: new SessionService(repository), findActiveUserById };
}

describe('SessionService', () => {
  it('returns the current database identity and deduplicates assigned roles', async () => {
    const { service, findActiveUserById } = createService();
    findActiveUserById.mockResolvedValue({
      id: 'user-1', email: 'user@test.com',
      roles: ['titulado', 'mentor', 'mentor'].map((name) => ({ role: { name } })),
    });
    await expect(service.getAuthenticatedUser('user-1')).resolves.toEqual({
      id: 'user-1', email: 'user@test.com', roles: ['titulado', 'mentor'],
    });
    expect(findActiveUserById).toHaveBeenCalledExactlyOnceWith('user-1');
  });

  it('rejects users that do not exist or are inactive', async () => {
    const { service, findActiveUserById } = createService();
    findActiveUserById.mockResolvedValue(null);
    await expect(service.getAuthenticatedUser('user-1')).rejects.toMatchObject({
      statusCode: 401, message: 'Usuario no encontrado o inactivo',
    });
  });

  it('rejects users without current roles', async () => {
    const { service, findActiveUserById } = createService();
    findActiveUserById.mockResolvedValue({ id: 'user-1', email: 'user@test.com', roles: [] });
    await expect(service.getAuthenticatedUser('user-1')).rejects.toMatchObject({
      statusCode: 401, message: 'El rol de la sesión ya no está vigente',
    });
  });

  it('propagates infrastructure errors without misreporting invalid credentials', async () => {
    const { service, findActiveUserById } = createService();
    const error = new Error('Database unavailable');
    findActiveUserById.mockRejectedValue(error);
    await expect(service.getAuthenticatedUser('user-1')).rejects.toBe(error);
  });
});
