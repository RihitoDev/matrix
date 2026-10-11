import { describe, expect, it } from 'vitest';
import { BLOCK_ID_MESSAGES as MSG } from '../constants/block-id.constants.js';
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
    expect(messagesOf('no-es-uuid')).toEqual([MSG.invalidId]);
  });

  it('rechaza un id vacío', () => {
    expect(messagesOf('')).toEqual([MSG.invalidId]);
  });
});
