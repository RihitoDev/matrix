import { describe, expect, it } from 'vitest';
import { SeedOptionsSchema } from '../database/seed-options.schema.js';

describe('SeedOptionsSchema', () => {
  it('defaults to a bounded two-minute seed transaction', () => {
    expect(SeedOptionsSchema.parse({})).toEqual({ SEED_TRANSACTION_TIMEOUT_MS: 120_000 });
  });

  it('accepts a configured timeout without changing application transaction defaults', () => {
    expect(SeedOptionsSchema.parse({ SEED_TRANSACTION_TIMEOUT_MS: '180000' }))
      .toEqual({ SEED_TRANSACTION_TIMEOUT_MS: 180_000 });
  });

  it.each(['', '0', '-1', 'abc', 'Infinity', '1.5', '600001'])(
    'rejects invalid timeout %s', (value) => {
      expect(SeedOptionsSchema.safeParse({ SEED_TRANSACTION_TIMEOUT_MS: value }).success).toBe(false);
    },
  );
});
