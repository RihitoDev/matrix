import { z } from 'zod';
import {
  degreeSchema,
  educationDateSchema,
  educationDescriptionSchema,
  institutionSchema,
} from './education-fields.schema.js';

export const createEducationSchema = z.strictObject({
  institution: institutionSchema,
  degree: degreeSchema,
  startDate: educationDateSchema,
  endDate: educationDateSchema,
  description: educationDescriptionSchema,
});

export type CreateEducationRequest = z.infer<typeof createEducationSchema>;
