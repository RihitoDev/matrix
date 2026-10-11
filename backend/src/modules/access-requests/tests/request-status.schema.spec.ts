import { describe, expect, it } from 'vitest';
import { requestStatusParamsSchema, requestStatusQuerySchema } from '../requests/request-status.schema.js';

const messagesOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  result.success ? [] : result.error!.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

describe('requestStatusParamsSchema', () => {
  it.each(['SOL-2026-0001', 'SOL-2026-0148', 'SOL-2026-12345'])('acepta %s', (code) => {
    expect(requestStatusParamsSchema.parse({ code })).toEqual({ code });
  });

  it.each(['sol-2026-0001', 'SOL-26-0001', 'SOL-2026-001', 'SOL-2026-', 'XYZ-2026-0001', ' SOL-2026-0001', ''])(
    'rechaza %j con mensaje en español',
    (code) => {
      expect(messagesOf(requestStatusParamsSchema.safeParse({ code }))).toEqual(['code: El código de solicitud no es válido']);
    },
  );

  it('rechaza la falta del código', () => {
    expect(messagesOf(requestStatusParamsSchema.safeParse({}))).toEqual(['code: El código de solicitud es obligatorio']);
  });
});

describe('requestStatusQuerySchema', () => {
  it('convierte el correo a minúsculas y recorta espacios', () => {
    expect(requestStatusQuerySchema.parse({ email: '  Ana@Umss.EDU.bo ' })).toEqual({ email: 'ana@umss.edu.bo' });
  });

  it.each(['no-es-correo', 'a@b', '', '   '])('rechaza el correo %j', (email) => {
    expect(messagesOf(requestStatusQuerySchema.safeParse({ email }))).toEqual(['email: El correo no tiene un formato válido']);
  });

  it('rechaza la falta del correo', () => {
    expect(messagesOf(requestStatusQuerySchema.safeParse({}))).toEqual(['email: El correo es obligatorio']);
  });
});
