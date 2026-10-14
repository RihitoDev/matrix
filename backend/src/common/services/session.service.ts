import { Injectable } from '@nestjs/common';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import { SessionRepository } from '../repositories/session.repository.js';
import type { AuthenticatedUser } from '../types/authenticated-user.types.js';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async getAuthenticatedUser(id: string): Promise<AuthenticatedUser> {
    const user = await this.sessionRepository.findActiveUserById(id);
    if (!user) {
      throw new UnauthorizedSessionException('Usuario no encontrado o inactivo');
    }
    if (user.roles.length === 0) {
      throw new UnauthorizedSessionException('El rol de la sesión ya no está vigente');
    }

    return {
      id: user.id,
      email: user.email,
      roles: [...new Set(user.roles.map(({ role }) => role.name))],
    };
  }
}
