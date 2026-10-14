import { describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../../prisma/client.js';
import { ROLE_NAMES } from '../../../common/enums/roles.enum.js';
import { SEED_USERS } from '../constants/seed-users.constants.js';
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
  it('siembra los roles y todos los usuarios desde SEED_USERS', async () => {
    const tx = buildTx();

    const result = await seedUsers(tx as any, 'hash');

    expect(tx.role.createMany).toHaveBeenCalledWith({ data: ROLE_NAMES.map((name) => ({ name })), skipDuplicates: true });
    expect(tx.user.upsert).toHaveBeenCalledTimes(SEED_USERS.length);
    expect(tx.user.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'prueba@umss.edu.bo' } }));
    expect(result).toMatchObject({ roles: ROLE_NAMES.length, userRoles: 15, legacyRoles: 0 });
    expect(Object.keys(result.users)).toHaveLength(SEED_USERS.length);
    expect(result.users.eventGraduate.email).toBe('prueba@umss.edu.bo');
  });

  it('siembra un usuario administrativo con la misma contraseña de siembra', async () => {
    const tx = buildTx();

    const result = await seedUsers(tx as any, 'hash-compartido');

    expect(SEED_USERS).toHaveLength(11);
    expect(result.users.admin.email).toBe('admin.1@umssy.test');
    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'admin.1@umssy.test' },
        create: { firstName: 'Admin', lastName: 'Uno', email: 'admin.1@umssy.test', password: 'hash-compartido', isAvailableForMentoring: false },
      }),
    );
    expect(tx.userRole.create).toHaveBeenCalledWith({ data: { userId: 'user-admin.1@umssy.test', roleId: 'role-administrativo' } });
  });

  it('siembra un usuario de empresa con la misma contraseña de siembra', async () => {
    const tx = buildTx();

    const result = await seedUsers(tx as any, 'hash-compartido');

    expect(result.users.company.email).toBe('empresa@umssy.test');
    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'empresa@umssy.test' },
        create: {
          firstName: 'Carlos',
          lastName: 'Rojas',
          email: 'empresa@umssy.test',
          password: 'hash-compartido',
          isAvailableForMentoring: false,
        },
      }),
    );
    expect(tx.userRole.create).toHaveBeenCalledWith({
      data: { userId: 'user-empresa@umssy.test', roleId: 'role-empresa' },
    });
  });

  it.each([
    ['adminGraduate', 'admin.titulado@umssy.test', ['administrativo', 'titulado'], false],
    ['multiRole', 'multi.role@umssy.test', ['administrativo', 'empresa', 'mentor', 'titulado'], true],
  ] as const)('siembra %s con todos sus roles y la contraseña compartida', async (key, email, roles, isAvailableForMentoring) => {
    const tx = buildTx();
    const result = await seedUsers(tx as unknown as Prisma.TransactionClient, 'hash-compartido');

    expect(result.users[key].email).toBe(email);
    expect(tx.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { email },
      create: expect.objectContaining({ password: 'hash-compartido', isAvailableForMentoring }),
      update: expect.objectContaining({ password: 'hash-compartido', isAvailableForMentoring }),
    }));
    const assignments = tx.userRole.create.mock.calls
      .map(([input]) => input.data)
      .filter(({ userId }) => userId === `user-${email}`);
    expect(assignments.map(({ roleId }) => roleId)).toEqual(roles.map((role) => `role-${role}`));
  });

  it('repite la siembra sin duplicar usuarios ni sus asignaciones de roles', async () => {
    const tx = buildTx();
    const assignments = new Set<string>();
    tx.role.findMany.mockImplementation(({ where }: { where: { name: { in: readonly string[] } } }) =>
      Promise.resolve(ROLE_NAMES.filter((name) => where.name.in.includes(name)).map((name) => ({ id: `role-${name}`, name }))),
    );
    tx.userRole.findFirst.mockImplementation(({ where }: { where: { userId: string; roleId: string } }) =>
      Promise.resolve(assignments.has(`${where.userId}:${where.roleId}`) ? { id: 'existing' } : null),
    );
    tx.userRole.create.mockImplementation(({ data }: { data: { userId: string; roleId: string } }) => {
      assignments.add(`${data.userId}:${data.roleId}`);
      return Promise.resolve({});
    });

    const first = await seedUsers(tx as unknown as Prisma.TransactionClient, 'hash');
    const second = await seedUsers(tx as unknown as Prisma.TransactionClient, 'hash');

    expect(first.userRoles).toBe(15);
    expect(second.userRoles).toBe(0);
    expect(assignments.size).toBe(15);
    expect(tx.userRole.create).toHaveBeenCalledTimes(15);
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
