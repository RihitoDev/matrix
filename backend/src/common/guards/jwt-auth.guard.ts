import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '../services/session.service.js';
import { ROLE_NAMES } from '../enums/roles.enum.js';
import { BEARER_PREFIX } from '../constants/auth.constants.js';
import { MissingUserException } from '../exceptions/missing-user.exception.js';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.types.js';
import type { LoginJwtPayload } from '../types/login-jwt-payload.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers?.authorization;

    if (
      typeof authorization !== 'string' ||
      !authorization.startsWith(BEARER_PREFIX)
    ) {
      throw new MissingUserException();
    }

    const token = authorization.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      throw new MissingUserException();
    }

    let payload: LoginJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<LoginJwtPayload>(token);
    } catch {
      throw new UnauthorizedSessionException();
    }

    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      !payload.sub.trim() ||
      typeof payload.roleTag !== 'string' ||
      !payload.roleTag.trim() ||
      (payload.roles !== undefined &&
        (!Array.isArray(payload.roles) ||
          payload.roles.length === 0 ||
          payload.roles.some((role) => !ROLE_NAMES.some((knownRole) => knownRole === role))))
    ) {
      throw new UnauthorizedSessionException();
    }

    request.user = await this.sessionService.getAuthenticatedUser(payload.sub);

    return true;
  }
}
