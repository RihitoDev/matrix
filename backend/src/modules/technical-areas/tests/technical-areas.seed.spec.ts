import type { Prisma } from '../../../prisma/client.js';
import { describe, expect, it } from 'vitest';
import { SEED_TECHNICAL_AREAS } from '../constants/seed-technical-areas.constants.js';
import { seedTechnicalAreas } from '../seeds/technical-areas.seed.js';

type TechnicalAreaSeedRecord = {
  name: string;
  description: string;
};

type TechnicalAreaUpsertArgs = {
  where: { name: string };
  update: { description: string };
  create: TechnicalAreaSeedRecord;
};

function createTechnicalAreaTransaction() {
  const records = new Map<string, TechnicalAreaSeedRecord>();
  const calls: TechnicalAreaUpsertArgs[] = [];
  const tx = {
    technicalArea: {
      upsert: async (args: TechnicalAreaUpsertArgs) => {
        calls.push(args);
        const current = records.get(args.where.name);
        const record = current === undefined ? args.create : { ...current, ...args.update };
        records.set(args.where.name, record);
        return record;
      },
    },
  } as unknown as Prisma.TransactionClient;

  return { calls, records, tx };
}

describe('seedTechnicalAreas', () => {
  it('crea las áreas técnicas definidas para desarrollo y QA', async () => {
    const { calls, records, tx } = createTechnicalAreaTransaction();

    await seedTechnicalAreas(tx);

    expect(calls).toHaveLength(SEED_TECHNICAL_AREAS.length);
    expect([...records.values()]).toEqual(SEED_TECHNICAL_AREAS);
  });

  it('es idempotente al ejecutarse dos veces', async () => {
    const { records, tx } = createTechnicalAreaTransaction();

    await seedTechnicalAreas(tx);
    await seedTechnicalAreas(tx);

    expect(records.size).toBe(SEED_TECHNICAL_AREAS.length);
    expect([...records.keys()]).toEqual(SEED_TECHNICAL_AREAS.map((area) => area.name));
  });
});
