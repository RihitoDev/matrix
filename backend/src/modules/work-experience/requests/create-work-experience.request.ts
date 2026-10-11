import { z } from 'zod';
import {
  companyNameSchema,
  isCurrentSchema,
  positionSchema,
  workExperienceDateSchema,
  workExperienceDescriptionSchema,
} from './work-experience-fields.schema.js';

export const createWorkExperienceSchema = z.strictObject({
  companyName: companyNameSchema,
  position: positionSchema,
  startDate: workExperienceDateSchema,
  endDate: workExperienceDateSchema.nullable().optional(),
  isCurrent: isCurrentSchema,
  description: workExperienceDescriptionSchema,
});

export type CreateWorkExperienceRequest = z.infer<
  typeof createWorkExperienceSchema
>;