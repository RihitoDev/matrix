import type { User } from '../../../prisma/client.js';
import type { SeedUserKey } from './seed-user-key.types.js';

export type SeedUsers = Record<SeedUserKey, User>;
