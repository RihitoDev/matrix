import type { RoleName } from '../../../common/enums/roles.enum.js';

export interface LoginResponse {
  accessToken: string;
  roleTag: RoleName;
  roles: RoleName[];
}
