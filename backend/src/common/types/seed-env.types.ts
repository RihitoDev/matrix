import type { z } from 'zod';
import type { SeedEnvSchema } from '../database/seed-env.schema.js';

export type SeedEnv = z.infer<typeof SeedEnvSchema>;
