import type { SeedUserResponse } from './seed-user-response.types.js';
import type { SeedUserKey } from './seed-user-key.types.js';

export type SeedUsers = Record<SeedUserKey, SeedUserResponse>;
