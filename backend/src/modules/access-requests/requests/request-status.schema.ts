import { z } from 'zod';

export const requestStatusParamsSchema = z.object({
  code: z.string({ error: 'El código de solicitud es obligatorio' }).regex(/^SOL-\d{4}-\d{4,}$/, 'El código de solicitud no es válido'),
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
