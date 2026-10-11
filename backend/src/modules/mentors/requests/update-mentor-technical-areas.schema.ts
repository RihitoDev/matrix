import { z } from 'zod';

export const updateMentorTechnicalAreasSchema = z
  .object({
    technicalAreaIds: z
      .array(z.string().uuid())
      .min(1)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: 'No se permiten identificadores duplicados',
      }),
  })
  .strict();

export type UpdateMentorTechnicalAreasDto = z.infer<
  typeof updateMentorTechnicalAreasSchema
>;
