import type { Prisma } from '../../../prisma/client.js';
import { describe, expect, it } from 'vitest';
import { SEED_ORIENTATION_TYPES } from '../constants/seed-orientation-types.constants.js';
import { seedOrientationTypes } from '../seeds/orientation-types.seed.js';

type OrientationTypeSeedRecord = {
  name: string;
  isActive: boolean;
};

type OrientationTypeUpsertArgs = {
  where: { name: string };
  update: { isActive: boolean };
  create: OrientationTypeSeedRecord;
};

function createOrientationTypeTransaction() {
  const records = new Map<string, OrientationTypeSeedRecord>();
  const calls: OrientationTypeUpsertArgs[] = [];
  const tx = {
    orientationType: {
      upsert: async (args: OrientationTypeUpsertArgs) => {
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

describe('seedOrientationTypes', () => {
  it('crea todos los tipos de orientación activos', async () => {
    const { calls, records, tx } = createOrientationTypeTransaction();

    await seedOrientationTypes(tx);

    expect(calls).toHaveLength(SEED_ORIENTATION_TYPES.length);
    expect([...records.values()]).toEqual(
      SEED_ORIENTATION_TYPES.map((name) => ({ name, isActive: true })),
    );
  });

  it('es idempotente al ejecutarse dos veces', async () => {
    const { records, tx } = createOrientationTypeTransaction();

    await seedOrientationTypes(tx);
    await seedOrientationTypes(tx);

    expect(records.size).toBe(SEED_ORIENTATION_TYPES.length);
    expect([...records.keys()]).toEqual([...SEED_ORIENTATION_TYPES]);
    expect([...records.values()].every((record) => record.isActive)).toBe(true);
  });
});
