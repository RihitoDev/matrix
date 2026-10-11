import { z } from 'zod';
import { createWorkExperienceSchema } from './create-work-experience.request.js';

export const updateWorkExperienceSchema = createWorkExperienceSchema
  .partial()
  .refine(
    (request) => Object.values(request).some((value) => value !== undefined),
    { message: 'At least one work experience field is required' },
  );

export type UpdateWorkExperienceRequest = z.infer<
  typeof updateWorkExperienceSchema
>;