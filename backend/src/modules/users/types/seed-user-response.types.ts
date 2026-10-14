import type { User } from '../../../prisma/client.js';

export type SeedUserResponse = Pick<User, 'id' | 'email'>;
