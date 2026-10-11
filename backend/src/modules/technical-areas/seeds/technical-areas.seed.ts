import type { Prisma } from '../../../prisma/client.js';
import { SEED_TECHNICAL_AREAS } from '../constants/seed-technical-areas.constants.js';

export async function seedTechnicalAreas(tx: Prisma.TransactionClient): Promise<void> {
  for (const area of SEED_TECHNICAL_AREAS) {
    await tx.technicalArea.upsert({
      where: { name: area.name },
      update: { description: area.description },
      create: { name: area.name, description: area.description },
    });
  }
}
