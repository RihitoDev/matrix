import { describe, expect, it, vi } from 'vitest';
import { ROLE_NAMES } from '../../../common/enums/roles.enum.js';
import { EPIC_1_TEST_USER, SEED_USERS } from '../constants/seed-users.constants.js';
import { hashSeedPassword, seedUsers } from '../seeds/users.seed.js';

function buildTx(options: { legacy?: Array<{ id: string }>; references?: number; assigned?: boolean } = {}) {
  const roles = ROLE_NAMES.map((name) => ({ id: `role-${name}`, name }));
  const tx = {
    role: {
      createMany: vi.fn().mockResolvedValue({ count: roles.length }),
      findMany: vi
        .fn()
        .mockResolvedValueOnce(roles)
        .mockResolvedValueOnce(options.legacy ?? []),
      deleteMany: vi.fn().mockResolvedValue({ count: (options.legacy ?? []).length }),
    },
    userRole: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(options.references ?? 0),
      findFirst: vi.fn().mockResolvedValue(options.assigned ? { id: 'ur-1' } : null),
      create: vi.fn().mockResolvedValue({}),
    },
    user: {
      upsert: vi.fn().mockImplementation(async ({ where }) => ({ id: `user-${where.email}`, email: where.email })),
    },
  };
  return tx;
}

describe('hashSeedPassword', () => {
  it('devuelve un hash bcrypt, no el texto plano', async () => {
    const hash = await hashSeedPassword();
    expect(hash.startsWith('$2')).toBe(true);
  });
});

describe('seedUsers', () => {
  it('siembra los roles, el usuario de la Epic 1 y los usuarios de prueba', async () => {
    const tx = buildTx();

    const result = await seedUsers(tx as any, 'hash');

    expect(tx.role.createMany).toHaveBeenCalledWith({ data: ROLE_NAMES.map((name) => ({ name })), skipDuplicates: true });
    expect(tx.user.upsert).toHaveBeenCalledTimes(1 + SEED_USERS.length);
    expect(tx.user.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { email: EPIC_1_TEST_USER.email } }));
    expect(result).toMatchObject({ roles: ROLE_NAMES.length, userRoles: 1 + SEED_USERS.length, legacyRoles: 0 });
    expect(Object.keys(result.users)).toHaveLength(1 + SEED_USERS.length);
  });

  it('siembra un usuario administrativo con la misma contraseña de siembra', async () => {
    const tx = buildTx();

    const result = await seedUsers(tx as any, 'hash-compartido');

    expect(SEED_USERS).toHaveLength(6);
    expect(result.users.admin.email).toBe('admin.1@umssy.test');
    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'admin.1@umssy.test' },
        create: { firstName: 'Admin', lastName: 'Uno', email: 'admin.1@umssy.test', password: 'hash-compartido', isAvailableForMentoring: false },
      }),
    );
    expect(tx.userRole.create).toHaveBeenCalledWith({ data: { userId: 'user-admin.1@umssy.test', roleId: 'role-administrativo' } });
  });

  it('no repite la asignación de rol si ya existe', async () => {
    const tx = buildTx({ assigned: true });

    const result = await seedUsers(tx as any, 'hash');

    expect(tx.userRole.create).not.toHaveBeenCalled();
    expect(result.userRoles).toBe(0);
  });

  it('elimina los roles en mayúscula sin referencias', async () => {
    const tx = buildTx({ legacy: [{ id: 'legacy-1' }], references: 0 });

    const result = await seedUsers(tx as any, 'hash');

    expect(tx.role.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['legacy-1'] } } });
    expect(result.legacyRoles).toBe(1);
  });

  it('conserva los roles en mayúscula que aún tienen referencias', async () => {
    const tx = buildTx({ legacy: [{ id: 'legacy-1' }], references: 3 });

    const result = await seedUsers(tx as any, 'hash');

    expect(tx.role.deleteMany).not.toHaveBeenCalled();
    expect(result.legacyRoles).toBe(0);
  });

  it('lanza un error si falta un rol', async () => {
    const tx = buildTx();
    tx.role.findMany = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await expect(seedUsers(tx as any, 'hash')).rejects.toThrow('No existe el rol');
  });
});
