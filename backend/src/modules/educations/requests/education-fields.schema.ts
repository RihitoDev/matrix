import { z } from 'zod';
import { EDUCATION_DESCRIPTION_MAX_LENGTH, EDUCATION_MIN_DATE, EDUCATION_DATE_MIN_MESSAGE, EDUCATION_INSTITUTION_INVALID_MESSAGE } from '../constants/education-validation.constants.js';
import { resolveEducationInstitution } from '../utils/resolve-education-institution.js';

export const educationIdSchema = z.uuid();
export const institutionSchema = z.string().trim().min(1)
  .refine((value) => resolveEducationInstitution(value) !== undefined, EDUCATION_INSTITUTION_INVALID_MESSAGE)
  .transform((value) => resolveEducationInstitution(value) ?? value);
export const degreeSchema = z.string().trim().min(1);
export const educationDateSchema = z.iso
  .date()
  .refine((value) => value >= EDUCATION_MIN_DATE, EDUCATION_DATE_MIN_MESSAGE)
  .transform((value) => new Date(value));
export const educationDescriptionSchema = z
  .string()
  .max(EDUCATION_DESCRIPTION_MAX_LENGTH)
  .trim()
  .nullable()
  .optional();
