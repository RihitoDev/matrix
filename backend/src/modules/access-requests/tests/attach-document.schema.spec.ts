import { describe, expect, it } from 'vitest';
import { attachDocumentSchema } from '../requests/attach-document.schema.js';

function messagesOf(payload: unknown) {
  const result = attachDocumentSchema.safeParse(payload);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

describe('attachDocumentSchema', () => {
  it.each(['academic_diploma', 'national_title'])('acepta %s', (documentType) => {
    expect(attachDocumentSchema.parse({ documentType })).toEqual({ documentType });
  });

  it.each([
    ['otro tipo', { documentType: 'passport' }],
    ['mayúsculas', { documentType: 'ACADEMIC_DIPLOMA' }],
    ['campo ausente', {}],
    ['valor no texto', { documentType: 1 }],
  ])('rechaza %s con mensaje en español', (_label, payload) => {
    expect(messagesOf(payload)).toEqual(['documentType: El tipo de documento no es válido']);
  });
});
