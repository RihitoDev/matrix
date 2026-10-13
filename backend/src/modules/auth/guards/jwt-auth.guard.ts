import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
export type AuthenticatedRequest = Request & { user: { sub: string } };
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = /^Bearer (\S+)$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Debes iniciar sesión.');
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(match[1]);
      if (typeof payload.sub !== 'string' || !payload.sub.trim()) throw new Error('Invalid subject');
      request.user = { sub: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('La sesión no es válida o ha expirado.');
    }
  }
}
