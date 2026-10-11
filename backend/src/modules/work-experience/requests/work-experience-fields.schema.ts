import { z } from 'zod';

export const workExperienceIdSchema = z.uuid();
export const companyNameSchema = z.string().trim().min(1).max(100);
export const positionSchema = z.string().trim().min(1);
export const workExperienceDateSchema = z.iso
  .date()
  .transform((value) => new Date(value));
export const isCurrentSchema = z.boolean();
export const workExperienceDescriptionSchema = z
  .string()
  .trim()
  .nullable()
  .optional();