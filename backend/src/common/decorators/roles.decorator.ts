import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/roles.constants.js';
import { RoleName } from '../enums/roles.enum.js';

export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
