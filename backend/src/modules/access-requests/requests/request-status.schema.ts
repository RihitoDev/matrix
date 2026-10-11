import { z } from 'zod';
import { REQUEST_CODE_REGEX } from '../constants/request-code.constants.js';

export const requestStatusParamsSchema = z.object({
  code: z.string({ error: 'El código de solicitud es obligatorio' }).regex(REQUEST_CODE_REGEX, 'El código de solicitud no es válido'),
});

export const requestStatusQuerySchema = z.object({
  email: z
    .string({ error: 'El correo es obligatorio' })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'El correo no tiene un formato válido' })),
});

export type RequestStatusParams = z.infer<typeof requestStatusParamsSchema>;
export type RequestStatusQuery = z.infer<typeof requestStatusQuerySchema>;
