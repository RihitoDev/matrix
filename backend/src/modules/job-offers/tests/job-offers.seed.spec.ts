import { describe, expect, it } from 'vitest';
import type { Prisma } from '../../../prisma/client.js';
import {
  SEED_JOB_OFFER_COMPANIES,
  SEED_JOB_OFFER_CONTRACT_TYPES,
  SEED_JOB_OFFER_MODALITIES,
  SEED_JOB_OFFER_SKILLS,
  SEED_JOB_OFFER_STATUSES,
} from '../constants/seed-job-offers.constants.js';
import { seedJobOffers } from '../seeds/job-offers.seed.js';
import { JobOfferStatus } from '../types/job-offer.enum.js';

type UpsertArgs = {
  where: Record<string, string>;
  update: Record<string, unknown>;
  create: Record<string, unknown>;
};

const MODELS = ['jobOfferModality', 'jobOfferContractType', 'jobOfferStatus', 'skill', 'company'] as const;

function createTransaction() {
  const stores = Object.fromEntries(MODELS.map((model) => [model, new Map<string, Record<string, unknown>>()]));
  const tx = Object.fromEntries(
    MODELS.map((model) => [
      model,
      {
        upsert: async (args: UpsertArgs) => {
          const [key] = Object.keys(args.where);
          const current = stores[model].get(args.where[key]);
          const record = current === undefined ? args.create : { ...current, ...args.update };
          stores[model].set(args.where[key], record);
          return record;
        },
      },
    ]),
  ) as unknown as Prisma.TransactionClient;

  return { stores, tx };
}

describe('seedJobOffers', () => {
  it('crea los catálogos a partir de los enums', async () => {
    const { stores, tx } = createTransaction();

    await seedJobOffers(tx);

    expect([...stores.jobOfferModality.keys()]).toEqual(SEED_JOB_OFFER_MODALITIES);
    expect([...stores.jobOfferContractType.keys()]).toEqual(SEED_JOB_OFFER_CONTRACT_TYPES);
    expect([...stores.jobOfferStatus.keys()]).toEqual(SEED_JOB_OFFER_STATUSES);
    expect(stores.jobOfferStatus.has(JobOfferStatus.PUBLISHED)).toBe(true);
  });

  it('carga las 20 tecnologías del catálogo cerrado, ninguna personalizada', async () => {
    const { stores, tx } = createTransaction();

    await seedJobOffers(tx);

    expect(stores.skill.size).toBe(20);
    expect([...stores.skill.values()].every((skill) => skill.isCustom === false)).toBe(true);
  });

  it('carga las empresas de demostración con id fijo', async () => {
    const { stores, tx } = createTransaction();

    await seedJobOffers(tx);

    expect(stores.company.size).toBe(SEED_JOB_OFFER_COMPANIES.length);
    expect(stores.company.get('TechBolivia S.R.L.')).toMatchObject({
      id: 'a0000000-0000-4000-8000-000000000001',
    });
  });

  it('es idempotente al ejecutarse dos veces', async () => {
    const { stores, tx } = createTransaction();

    await seedJobOffers(tx);
    await seedJobOffers(tx);

    expect(stores.skill.size).toBe(SEED_JOB_OFFER_SKILLS.length);
    expect(stores.company.size).toBe(SEED_JOB_OFFER_COMPANIES.length);
  });
});
