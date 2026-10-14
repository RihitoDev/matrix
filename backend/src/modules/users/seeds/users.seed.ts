import bcrypt from 'bcrypt';
import { ROLE_NAMES } from '../../../common/enums/roles.enum.js';
import type { RoleName } from '../../../common/enums/roles.enum.js';
import type { Prisma } from '../../../prisma/client.js';
import {
  BCRYPT_ROUNDS,
  LEGACY_ROLES,
  SEED_PASSWORD,
  SEED_USERS,
} from '../constants/seed-users.constants.js';
import type { SeedUserDefinition } from '../types/seed-user-definition.types.js';
import type { SeedUserAssignmentResponse } from '../types/seed-user-assignment-response.types.js';
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
  const seedEmails = SEED_USERS.map((user) => user.email);
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

async function ensureUserWithRoles(
  tx: Prisma.TransactionClient,
  definition: SeedUserDefinition,
  password: string,
  roleIds: readonly string[],
): Promise<SeedUserAssignmentResponse> {
  const { firstName, lastName, email } = definition;
  const isAvailableForMentoring = definition.roles.includes('mentor');
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

  let assignedRoles = 0;
  for (const roleId of new Set(roleIds)) {
    const assigned = await tx.userRole.findFirst({
      where: { userId: user.id, roleId, deletedAt: null },
    });
    if (assigned) continue;

    await tx.userRole.create({ data: { userId: user.id, roleId } });
    assignedRoles += 1;
  }

  return { user, assignedRoles };
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
  const users: Partial<SeedUsers> = {};
  for (const definition of SEED_USERS) {
    const result = await ensureUserWithRoles(
      tx,
      definition,
      password,
      definition.roles.map(roleIdOf),
    );
    users[definition.key] = result.user;
    userRoles += result.assignedRoles;
  }

  return {
    users: users as SeedUsers,
    roles: ROLE_NAMES.length,
    userRoles,
    legacyRoles,
  };
}
