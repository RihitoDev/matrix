import { z } from 'zod';
import { createCertificationSchema } from './create-certification.request.js';

export const updateCertificationSchema = createCertificationSchema.partial();

export type UpdateCertificationRequest = z.infer<
  typeof updateCertificationSchema
>;
