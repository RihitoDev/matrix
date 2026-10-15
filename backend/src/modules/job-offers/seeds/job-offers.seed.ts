import type { Prisma } from '../../../prisma/client.js';
import {
  SEED_JOB_OFFER_COMPANIES,
  SEED_JOB_OFFER_CONTRACT_TYPES,
  SEED_JOB_OFFER_MODALITIES,
  SEED_JOB_OFFER_SKILLS,
  SEED_JOB_OFFER_STATUSES,
} from '../constants/seed-job-offers.constants.js';

export async function seedJobOffers(tx: Prisma.TransactionClient): Promise<void> {
  await tx.jobOfferModality.createMany({
    data: SEED_JOB_OFFER_MODALITIES.map((title) => ({ title })),
    skipDuplicates: true,
  });

  await tx.jobOfferContractType.createMany({
    data: SEED_JOB_OFFER_CONTRACT_TYPES.map((title) => ({ title })),
    skipDuplicates: true,
  });

  await tx.jobOfferStatus.createMany({
    data: SEED_JOB_OFFER_STATUSES.map((title) => ({ title })),
    skipDuplicates: true,
  });

  await tx.skill.createMany({
    data: SEED_JOB_OFFER_SKILLS.map((name) => ({ name, isCustom: false })),
    skipDuplicates: true,
  });
  await tx.skill.updateMany({
    where: { name: { in: [...SEED_JOB_OFFER_SKILLS] } },
    data: { isCustom: false },
  });

  for (const company of SEED_JOB_OFFER_COMPANIES) {
    await tx.company.upsert({
      where: { title: company.title },
      update: { description: company.description },
      create: { id: company.id, title: company.title, description: company.description },
    });
  }
}
