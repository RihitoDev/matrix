import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { BEARER_PREFIX } from '../constants/session.constants.js';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import type { AuthenticatedUser } from '../types/authenticated-user.types.js';
import type { LoginJwtPayload } from '../types/login-jwt-payload.types.js';

// TODO: reemplazar por el guard de sesión de Epic 1 cuando lo entregue (B-07, #151)
@Injectable()
export class ProvisionalSessionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers['authorization'];

    if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedSessionException(
        'Falta el header Authorization: Bearer <token>',
      );
    }

    const token = header.slice(BEARER_PREFIX.length);
    let payload: LoginJwtPayload;
    try {
      payload = this.jwtService.verify<LoginJwtPayload>(token);
    } catch {
      throw new UnauthorizedSessionException('Token inválido o expirado');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true },
      select: {
        id: true,
        email: true,
        roles: {
          where: { deletedAt: null, startAt: { lte: new Date() }, role: { name: payload.roleTag } },
          select: { role: { select: { name: true } } },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedSessionException('Usuario no encontrado o inactivo');
    }

    if (user.roles.length === 0) {
      throw new UnauthorizedSessionException('El rol de la sesión ya no está vigente');
    }

    const authenticated: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      roles: [payload.roleTag],
    };
    request.user = authenticated;

    return true;
  }
}
