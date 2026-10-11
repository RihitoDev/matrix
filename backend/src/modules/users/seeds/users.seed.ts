import bcrypt from 'bcrypt';
import { ROLE_NAMES } from '../../../common/enums/roles.enum.js';
import type { RoleName } from '../../../common/enums/roles.enum.js';
import type { Prisma, User } from '../../../prisma/client.js';
import {
  BCRYPT_ROUNDS,
  EPIC_1_TEST_USER,
  LEGACY_ROLES,
  SEED_PASSWORD,
  SEED_USERS,
} from '../constants/seed-users.constants.js';
import type { SeedUserDefinition } from '../types/seed-user-definition.types.js';
import type { SeedUsers } from '../types/seed-users.types.js';
import type { UsersSeedResult } from '../types/users-seed-result.types.js';

export const hashSeedPassword = (): Promise<string> =>
  bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

async function seedRoles(
  tx: Prisma.TransactionClient,
): Promise<Map<string, string>> {
  await tx.role.createMany({
    data: ROLE_NAMES.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const roles = await tx.role.findMany({
    where: { name: { in: [...ROLE_NAMES] } },
  });
  return new Map(roles.map((role) => [role.name, role.id]));
}

async function removeLegacyRoles(
  tx: Prisma.TransactionClient,
): Promise<number> {
  const legacy = await tx.role.findMany({
    where: { name: { in: LEGACY_ROLES } },
    select: { id: true },
  });
  if (legacy.length === 0) {
    return 0;
  }

  const ids = legacy.map((role) => role.id);
  const seedEmails = [EPIC_1_TEST_USER, ...SEED_USERS].map(
    (user) => user.email,
  );
  await tx.userRole.deleteMany({
    where: { roleId: { in: ids }, user: { email: { in: seedEmails } } },
  });

  const references = await tx.userRole.count({
    where: { roleId: { in: ids } },
  });
  if (references > 0) {
    return 0;
  }

  const { count } = await tx.role.deleteMany({ where: { id: { in: ids } } });
  return count;
}

async function ensureUserWithRole(
  tx: Prisma.TransactionClient,
  definition: SeedUserDefinition,
  password: string,
  roleId: string,
): Promise<{ user: User; roleAssigned: boolean }> {
  const { firstName, lastName, email } = definition;
  const isAvailableForMentoring = definition.role === 'mentor';
  const user = await tx.user.upsert({
    where: { email },
    update: { firstName, lastName, password, isAvailableForMentoring },
    create: {
      firstName,
      lastName,
      email,
      password,
      isAvailableForMentoring,
    },
  });

  const assigned = await tx.userRole.findFirst({
    where: { userId: user.id, roleId, deletedAt: null },
  });
  if (assigned) {
    return { user, roleAssigned: false };
  }

  await tx.userRole.create({ data: { userId: user.id, roleId } });
  return { user, roleAssigned: true };
}

export async function seedUsers(
  tx: Prisma.TransactionClient,
  password: string,
): Promise<UsersSeedResult> {
  const roleIds = await seedRoles(tx);
  const legacyRoles = await removeLegacyRoles(tx);

  const roleIdOf = (name: RoleName): string => {
    const id = roleIds.get(name);
    if (!id) {
      throw new Error(`No existe el rol ${name}`);
    }
    return id;
  };

  let userRoles = 0;
  const testUser = await ensureUserWithRole(
    tx,
    EPIC_1_TEST_USER,
    password,
    roleIdOf(EPIC_1_TEST_USER.role),
  );
  if (testUser.roleAssigned) {
    userRoles += 1;
  }

  const users: Partial<SeedUsers> = { eventGraduate: testUser.user };
  for (const definition of SEED_USERS) {
    const result = await ensureUserWithRole(
      tx,
      definition,
      password,
      roleIdOf(definition.role),
    );
    users[definition.key] = result.user;
    if (result.roleAssigned) {
      userRoles += 1;
    }
  }

  return {
    users: users as SeedUsers,
    roles: ROLE_NAMES.length,
    userRoles,
    legacyRoles,
  };
}
