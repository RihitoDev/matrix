import 'dotenv/config';

import { pathToFileURL } from 'node:url';

import { Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { seedEvents } from '../../modules/events/seeds/events.seed.js';
import { seedEventRegistrations } from '../../modules/event-registrations/seeds/event-registrations.seed.js';
import { seedAccessRequests } from '../../modules/access-requests/seeds/access-requests.seed.js';
import { seedAvailability } from '../../modules/availability/seeds/availability.seed.js';
import { seedOrientationTypes } from '../../modules/orientation-types/seeds/orientation-types.seed.js';
import { seedTechnicalAreas } from '../../modules/technical-areas/seeds/technical-areas.seed.js';
import { SEED_USERS } from '../../modules/users/constants/seed-users.constants.js';
import {
  hashSeedPassword,
  seedUsers,
} from '../../modules/users/seeds/users.seed.js';
import { PrismaClient } from '../../prisma/client.js';
import { SEED_TRANSACTION_OPTIONS } from '../constants/seed.constants.js';
import { buildDatabaseConnectionString } from '../prisma/build-connection-string.js';
import type { SeedEnv } from '../types/seed-env.types.js';
import type { SeedSummary } from '../types/seed-summary.types.js';
import { SeedEnvSchema } from './seed-env.schema.js';

export function loadSeedEnv(source: NodeJS.ProcessEnv = process.env): SeedEnv {
  const parsed = SeedEnvSchema.safeParse(source);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raíz)'}: ${issue.message}`)
      .join(' | ');
    throw new Error(`Configuración de base de datos inválida — ${detail}`);
  }
  return parsed.data;
}

export function createSeedClient(env: SeedEnv = loadSeedEnv()): PrismaClient {
  const adapter = new PrismaPg(
    { connectionString: buildDatabaseConnectionString() },
    env.DB_SCHEMA ? { schema: env.DB_SCHEMA } : undefined,
  );
  return new PrismaClient({ adapter });
}

export async function runSeed(client?: PrismaClient): Promise<SeedSummary> {
  const ownsClient = client === undefined;
  const prisma = client ?? createSeedClient();

  try {
    const now = new Date();
    const password = await hashSeedPassword();

    return await prisma.$transaction(async (tx) => {
      await seedTechnicalAreas(tx);
      await seedOrientationTypes(tx);

      const usersResult = await seedUsers(tx, password);
      const { users } = usersResult;
      await seedEvents(tx, users.eventGraduate.id);
      await seedEventRegistrations(tx, users.eventGraduate.id);
      const availabilityResult = await seedAvailability(
        tx,
        {
          mentorId: users.mentorA.id,
          graduateId: users.graduate.id,
          ownedUserIds: Object.values(users).map((user) => user.id),
        },
        now,
      );

      const accessRequestsResult = await seedAccessRequests(tx);

      return {
        weeks: availabilityResult.weeks,
        plan: availabilityResult.plan,
        roles: usersResult.roles,
        statuses: availabilityResult.statuses,
        users: SEED_USERS.length + 1,
        userRoles: usersResult.userRoles,
        blocks: availabilityResult.blocks,
        appointments: availabilityResult.appointments,
        legacyRoles: usersResult.legacyRoles,
        warnings: availabilityResult.warnings,
        accessRequests: accessRequestsResult,
      };
    }, SEED_TRANSACTION_OPTIONS);
  } finally {
    if (ownsClient) {
      await prisma.$disconnect();
    }
  }
}

async function main(): Promise<void> {
  const logger = new Logger('Seed');
  let client: PrismaClient | undefined;

  try {
    client = createSeedClient();
    const summary = await runSeed(client);
    logger.log(
      `Seed completado — roles: ${summary.roles}, estados: ${summary.statuses}, usuarios: ${summary.users}, ` +
        `roles de usuario nuevos: ${summary.userRoles}, bloques: ${summary.blocks}, citas: ${summary.appointments}, ` +
        `solicitudes (estados: ${summary.accessRequests.statuses}, tipos de documento: ${summary.accessRequests.documentTypes}, carreras: ${summary.accessRequests.careers})` +
        (summary.legacyRoles > 0 ? ` (roles en mayúscula eliminados: ${summary.legacyRoles})` : ''),
    );
    for (const warning of summary.warnings) {
      logger.warn(warning);
    }
  } catch (error) {
    logger.error(
      'El seed falló y la transacción se revirtió',
      error instanceof Error ? error.stack : String(error),
    );
    process.exitCode = 1;
  } finally {
    await client?.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  void main();
}
