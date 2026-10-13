import { z } from 'zod';
import {
  GOOGLE_MAPS_LINK_REGEX,
  JOB_OFFER_DESCRIPTION_MAX_LENGTH,
  JOB_OFFER_LANGUAGES_MAX_LENGTH,
  JOB_OFFER_MAX_POSITIONS,
  JOB_OFFER_MAX_SKILLS,
  JOB_OFFER_TITLE_MAX_LENGTH,
  JOB_OFFER_TITLE_REGEX,
  JOB_OFFER_VALIDATION_MESSAGES as MESSAGES,
} from '../constants/job-offer.constants.js';
import { JobOfferContractType, JobOfferModality } from '../types/job-offer.enum.js';

const salarySchema = z.number().int().min(1, MESSAGES.SALARY_NOT_POSITIVE);

export const createJobOfferSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, MESSAGES.REQUIRED_FIELD)
      .max(JOB_OFFER_TITLE_MAX_LENGTH, MESSAGES.TITLE_TOO_LONG)
      .regex(JOB_OFFER_TITLE_REGEX, MESSAGES.TITLE_INVALID_CHARACTERS),
    description: z
      .string()
      .trim()
      .min(1, MESSAGES.REQUIRED_FIELD)
      .max(JOB_OFFER_DESCRIPTION_MAX_LENGTH, MESSAGES.DESCRIPTION_TOO_LONG),
    modality: z.enum(JobOfferModality, { message: MESSAGES.INVALID_MODALITY }),
    contractType: z.enum(JobOfferContractType, { message: MESSAGES.INVALID_CONTRACT_TYPE }),
    category: z.string().trim().min(1, MESSAGES.REQUIRED_FIELD),
    positionsAvailable: z
      .number()
      .int(MESSAGES.POSITIONS_NOT_INTEGER)
      .min(1, MESSAGES.POSITIONS_TOO_FEW)
      .max(JOB_OFFER_MAX_POSITIONS, MESSAGES.POSITIONS_TOO_MANY),
    salaryMin: salarySchema,
    salaryMax: salarySchema.optional(),
    languages: z
      .string()
      .trim()
      .min(1, MESSAGES.REQUIRED_FIELD)
      .max(JOB_OFFER_LANGUAGES_MAX_LENGTH, MESSAGES.LANGUAGES_TOO_LONG),
    locationUrl: z
      .string()
      .trim()
      .min(1, MESSAGES.REQUIRED_FIELD)
      .regex(GOOGLE_MAPS_LINK_REGEX, MESSAGES.INVALID_LOCATION_URL),
    skillIds: z
      .array(z.uuid(MESSAGES.INVALID_SKILL_ID))
      .min(1, MESSAGES.SKILLS_REQUIRED)
      .max(JOB_OFFER_MAX_SKILLS, MESSAGES.SKILLS_TOO_MANY),
  })
  .refine((data) => data.salaryMax === undefined || data.salaryMin <= data.salaryMax, {
    path: ['salaryMin'],
    message: MESSAGES.SALARY_RANGE_INVALID,
  });

export type CreateJobOfferRequest = z.infer<typeof createJobOfferSchema>;
