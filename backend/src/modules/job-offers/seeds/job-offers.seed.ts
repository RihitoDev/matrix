import type { Prisma } from '../../../prisma/client.js';
import {
  SEED_JOB_OFFER_COMPANIES,
  SEED_JOB_OFFER_CONTRACT_TYPES,
  SEED_JOB_OFFER_MODALITIES,
  SEED_JOB_OFFER_SKILLS,
  SEED_JOB_OFFER_STATUSES,
} from '../constants/seed-job-offers.constants.js';

export async function seedJobOffers(tx: Prisma.TransactionClient): Promise<void> {
  for (const title of SEED_JOB_OFFER_MODALITIES) {
    await tx.jobOfferModality.upsert({ where: { title }, update: {}, create: { title } });
  }

  for (const title of SEED_JOB_OFFER_CONTRACT_TYPES) {
    await tx.jobOfferContractType.upsert({ where: { title }, update: {}, create: { title } });
  }

  for (const title of SEED_JOB_OFFER_STATUSES) {
    await tx.jobOfferStatus.upsert({ where: { title }, update: {}, create: { title } });
  }

  for (const name of SEED_JOB_OFFER_SKILLS) {
    await tx.skill.upsert({ where: { name }, update: { isCustom: false }, create: { name, isCustom: false } });
  }

  for (const company of SEED_JOB_OFFER_COMPANIES) {
    await tx.company.upsert({
      where: { title: company.title },
      update: { description: company.description },
      create: { id: company.id, title: company.title, description: company.description },
    });
  }
}
