import { z } from 'zod';

export const educationIdSchema = z.uuid();
export const institutionSchema = z.string().trim().min(1);
export const degreeSchema = z.string().trim().min(1);
export const educationDateSchema = z.iso
  .date()
  .transform((value) => new Date(value));
export const educationDescriptionSchema = z
  .string()
  .trim()
  .nullable()
  .optional();
