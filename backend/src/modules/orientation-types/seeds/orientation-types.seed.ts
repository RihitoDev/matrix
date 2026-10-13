import type { Prisma } from "../../../prisma/client.js";
import { SEED_ORIENTATION_TYPES } from "../constants/seed-orientation-types.constants.js";

export async function seedOrientationTypes(
  tx: Prisma.TransactionClient,
): Promise<void> {
  for (const orientationType of SEED_ORIENTATION_TYPES) {
    await tx.orientationType.upsert({
      where: {
        name: orientationType.name,
      },
      update: {
        description: orientationType.description,
        isActive: true,
      },
      create: {
        name: orientationType.name,
        description: orientationType.description,
        isActive: true,
      },
    });
  }
}
