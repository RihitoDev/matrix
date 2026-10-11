import type { RoleName } from '../../../common/enums/roles.enum.js';

export interface SeedUserDefinition {
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
}
