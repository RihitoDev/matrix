import { z } from 'zod';
import {
  cityIdSchema,
  personalEmailSchema,
  personNameSchema,
  phoneSchema,
} from './profile-fields.schema.js';

export const updatePersonalInfoSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  cityId: cityIdSchema,
  phone: phoneSchema,
  personalEmail: personalEmailSchema,
});

export type UpdatePersonalInfoRequest = z.infer<typeof updatePersonalInfoSchema>;
