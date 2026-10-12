import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { JwtAuthGuard as EventsJwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as JwtSignOptions['expiresIn'],
        algorithm: (process.env.JWT_ALGORITHM || undefined) as JwtSignOptions['algorithm'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthGuard, EventsJwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, EventsJwtAuthGuard],
})
export class AuthModule {}
