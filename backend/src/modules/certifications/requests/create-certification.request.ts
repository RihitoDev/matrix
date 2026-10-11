import { z } from 'zod';
import {
  certificationNameSchema,
  issueDateSchema,
  issuingOrganizationSchema,
} from './certification-fields.schema.js';

export const createCertificationSchema = z.object({
  name: certificationNameSchema,
  issuingOrganization: issuingOrganizationSchema,
  issueDate: issueDateSchema,
});

export type CreateCertificationRequest = z.infer<
  typeof createCertificationSchema
>;
