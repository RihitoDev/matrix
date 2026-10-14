import { z } from 'zod';

export const SeedOptionsSchema = z.object({
  SEED_TRANSACTION_TIMEOUT_MS: z.coerce.number().int().positive().max(600_000).default(120_000),
});
