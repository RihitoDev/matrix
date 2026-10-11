import type { Prisma } from '../../../prisma/client.js';
import { SEED_ORIENTATION_TYPES } from '../constants/seed-orientation-types.constants.js';

export async function seedOrientationTypes(tx: Prisma.TransactionClient): Promise<void> {
  for (const name of SEED_ORIENTATION_TYPES) {
    await tx.orientationType.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
}
