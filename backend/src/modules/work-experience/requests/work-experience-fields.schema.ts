import { z } from 'zod';
import {
  WORK_EXPERIENCE_BUSINESS_TIMEZONE,
  WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH,
  WORK_EXPERIENCE_DESCRIPTION_MAX_LENGTH,
  WORK_EXPERIENCE_MIN_DATE,
  WORK_EXPERIENCE_POSITION_MAX_LENGTH,
  WORK_EXPERIENCE_VALIDATION_MESSAGES,
} from '../constants/work-experience-validation.constants.js';

function todayInBolivia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WORK_EXPERIENCE_BUSINESS_TIMEZONE,
  }).format(new Date());
}

export const workExperienceIdSchema = z.uuid();
export const companyNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(
    WORK_EXPERIENCE_COMPANY_NAME_MAX_LENGTH,
    WORK_EXPERIENCE_VALIDATION_MESSAGES.companyNameTooLong,
  );
export const positionSchema = z
  .string()
  .trim()
  .min(1)
  .max(
    WORK_EXPERIENCE_POSITION_MAX_LENGTH,
    WORK_EXPERIENCE_VALIDATION_MESSAGES.positionTooLong,
  );
export const workExperienceDateSchema = z.iso
  .date()
  .refine((value) => value >= WORK_EXPERIENCE_MIN_DATE, {
    error: WORK_EXPERIENCE_VALIDATION_MESSAGES.dateBeforeMinimum,
    abort: true,
  })
  .refine((value) => value <= todayInBolivia(), {
    error: WORK_EXPERIENCE_VALIDATION_MESSAGES.futureDate,
    abort: true,
  })
  .transform((value) => new Date(value));
export const isCurrentSchema = z.boolean();
export const workExperienceDescriptionSchema = z
  .string()
  .trim()
  .max(
    WORK_EXPERIENCE_DESCRIPTION_MAX_LENGTH,
    WORK_EXPERIENCE_VALIDATION_MESSAGES.descriptionTooLong,
  )
  .nullable()
  .optional();
