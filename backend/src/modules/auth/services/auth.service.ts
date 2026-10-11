import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository.js';
import { InvalidCredentialsException, RoleNotAssignedException } from '../exceptions/index.js';
import type { LoginDto } from '../requests/login.schema.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  existsByEmail(email: string) {
    return this.authRepository.existsByEmail(email);
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmailWithRoles(dto.email);

    if (!user || !user.password) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    const hasRole = user.roles.some((userRole) => userRole.role.name === dto.roleTag);
    if (!hasRole) {
      throw new RoleNotAssignedException();
    }

    const accessToken = this.jwtService.sign({ sub: user.id, roleTag: dto.roleTag });
    return { accessToken, roleTag: dto.roleTag };
  }
}