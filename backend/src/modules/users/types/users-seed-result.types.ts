import type { SeedUsers } from './seed-users.types.js';

export interface UsersSeedResult {
  users: SeedUsers;
  roles: number;
  userRoles: number;
  legacyRoles: number;
}
