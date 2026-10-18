import { z } from 'zod';
import { MAX_REJECTION_REASON_LENGTH } from '../constants/reject-access-request.constants.js';

export const rejectAccessRequestSchema = z.object({
  reason: z
    .string({ error: 'El motivo del rechazo es obligatorio' })
    .trim()
    .min(1, 'El motivo del rechazo es obligatorio')
    .max(MAX_REJECTION_REASON_LENGTH, `El motivo y la indicación no pueden superar los ${MAX_REJECTION_REASON_LENGTH} caracteres en total`),
});

export type RejectAccessRequestDto = z.infer<typeof rejectAccessRequestSchema>;
