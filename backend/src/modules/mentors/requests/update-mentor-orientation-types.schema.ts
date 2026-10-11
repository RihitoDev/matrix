import { z } from 'zod';

export const updateMentorOrientationTypesSchema = z
  .object({
    orientationTypeIds: z
      .array(z.string().uuid())
      .min(1)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: 'No se permiten identificadores duplicados',
      }),
  })
  .strict();

export type UpdateMentorOrientationTypesDto = z.infer<
  typeof updateMentorOrientationTypesSchema
>;
