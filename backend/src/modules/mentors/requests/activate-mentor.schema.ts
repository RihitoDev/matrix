import { z } from 'zod';

const uniqueUuidArray = z
  .array(z.string().uuid())
  .min(1)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'No se permiten identificadores duplicados',
  });

export const activateMentorSchema = z
  .object({
    technicalAreaIds: uniqueUuidArray,
    orientationTypeIds: uniqueUuidArray,
  })
  .strict();

export type ActivateMentorDto = z.infer<typeof activateMentorSchema>;
