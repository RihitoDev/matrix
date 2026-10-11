import { z } from 'zod';
import { aboutMeSchema, headlineSchema } from './profile-fields.schema.js';

export const updatePresentationSchema = z.object({
  headline: headlineSchema,
  aboutMe: aboutMeSchema,
});

export type UpdatePresentationRequest = z.infer<typeof updatePresentationSchema>;
