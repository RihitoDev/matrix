import type { Prisma } from '../../../prisma/client.js';
import type {
  JOB_OFFER_CREATED_SELECT,
  JOB_OFFER_SELECT,
} from '../constants/job-offer.constants.js';

export type JobOfferRecord = Prisma.JobOfferGetPayload<{ select: typeof JOB_OFFER_SELECT }>;

export type JobOfferCreatedRecord = Prisma.JobOfferGetPayload<{
  select: typeof JOB_OFFER_CREATED_SELECT;
}>;
