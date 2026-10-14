import type { User } from '../../../prisma/client.js';

export interface SeedUserAssignmentResponse {
  user: User;
  assignedRoles: number;
}
