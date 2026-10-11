import { z } from 'zod';
import { accessRequestFields, hasGraduationYearConflict } from './access-request-fields.js';
import { GRADUATION_YEAR_COHERENCE_MESSAGE } from '../constants/access-request-fields.constants.js';

// Si solo llega uno de los dos campos, la coherencia con el valor guardado la valida el service
export const updateAccessRequestSchema = z
  .object({ ...accessRequestFields, phone: accessRequestFields.phone.nullable() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Debes enviar al menos un campo para actualizar')
  .superRefine((data, ctx) => {
    if (hasGraduationYearConflict(data)) {
      ctx.addIssue({ code: 'custom', path: ['graduationYear'], message: GRADUATION_YEAR_COHERENCE_MESSAGE });
    }
  });

export type UpdateAccessRequestDto = z.infer<typeof updateAccessRequestSchema>;
