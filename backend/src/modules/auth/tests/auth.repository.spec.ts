import { describe, expect, it, vi } from 'vitest';
import { AuthRepository } from '../repositories/auth.repository.js';

function build() {
  const user = { findUnique: vi.fn(), findFirst: vi.fn() };
  return { user, repository: new AuthRepository({ user } as any) };
}

describe('AuthRepository', () => {
  it('findUserByEmailWithRoles busca por correo e incluye solo roles activos', async () => {
    const { user, repository } = build();
    user.findUnique.mockResolvedValue(null);

    await repository.findUserByEmailWithRoles('ana@umss.edu.bo');

    const args = user.findUnique.mock.calls[0][0];
    expect(args.where).toEqual({ email: 'ana@umss.edu.bo' });
    expect(args.include.roles.where).toEqual({ deletedAt: null });
  });

  it.each([
    [{ id: 'u-1' }, true],
    [null, false],
  ])('existsByEmail busca sin distinguir mayúsculas (%o -> %s)', async (found, expected) => {
    const { user, repository } = build();
    user.findFirst.mockResolvedValue(found);

    await expect(repository.existsByEmail('Ana@umss.edu.bo')).resolves.toBe(expected);

    const args = user.findFirst.mock.calls[0][0];
    expect(args.where).toEqual({ email: { equals: 'Ana@umss.edu.bo', mode: 'insensitive' } });
    expect(args.select).toEqual({ id: true });
  });
});
