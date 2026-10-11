import { CanActivate, ExecutionContext, Injectable, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '../constants/auth.constants.js';
import { MissingUserException } from '../exceptions/missing-user.exception.js';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.types.js';
import type { LoginJwtPayload } from '../types/login-jwt-payload.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization =
      request.headers?.[AUTHORIZATION_HEADER] ??
      request.headers?.authorization;

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
      !payload.roleTag.trim()
    ) {
      throw new UnauthorizedSessionException();
    }

    let user = {
      id: payload.sub,
      email: '',
      roles: [{ role: { name: payload.roleTag } }],
    };

    if (this.prisma && typeof this.prisma.user?.findFirst === 'function') {
      const dbUser = await this.prisma.user.findFirst({
        where: { id: payload.sub, isActive: true },
        select: {
          id: true,
          email: true,
          roles: {
            where: {
              deletedAt: null,
              startAt: { lte: new Date() },
              role: { name: payload.roleTag },
            },
            select: { role: { select: { name: true } } },
          },
        },
      });

      if (!dbUser) {
        throw new UnauthorizedSessionException(
          'Usuario no encontrado o inactivo',
        );
      }

      if (dbUser.roles.length === 0) {
        throw new UnauthorizedSessionException(
          'El rol de la sesión ya no está vigente',
        );
      }

      user = dbUser;
    }

    request.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map(({ role }) => role.name),
    };

    return true;
  }
}
