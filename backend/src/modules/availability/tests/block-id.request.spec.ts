import { describe, expect, it } from 'vitest';
import { blockIdSchema } from '../requests/block-id.request.js';

const messagesOf = (input: unknown): string[] => {
  const result = blockIdSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('blockIdSchema', () => {
  it('acepta un uuid', () => {
    expect(blockIdSchema.safeParse('a6f25881-cc48-42ce-9ba8-d48981501777').success).toBe(true);
  });

  it('rechaza un id que no es uuid', () => {
    expect(messagesOf('no-es-uuid')).toEqual(['El id del bloque no es válido']);
  });

  it('rechaza un id vacío', () => {
    expect(messagesOf('')).toEqual(['El id del bloque no es válido']);
  });
});
