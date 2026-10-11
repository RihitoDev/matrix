import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/roles.constants.js';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import { ForbiddenRoleException } from '../exceptions/forbidden-role.exception.js';
import type { AuthenticatedUser } from '../types/authenticated-user.types.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user: AuthenticatedUser | undefined = context
      .switchToHttp()
      .getRequest().user;

    if (!user) {
      throw new UnauthorizedSessionException('Sesión requerida');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenRoleException();
    }

    return true;
  }
}
