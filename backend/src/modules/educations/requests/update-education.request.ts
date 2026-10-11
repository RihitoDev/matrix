import { z } from 'zod';
import { createEducationSchema } from './create-education.request.js';

export const updateEducationSchema = createEducationSchema
  .partial()
  .refine(
    (request) => Object.values(request).some((value) => value !== undefined),
    { message: 'At least one education field is required' },
  );

export type UpdateEducationRequest = z.infer<typeof updateEducationSchema>;
