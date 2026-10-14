import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SessionModule } from '../../common/session/session.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    SessionModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as JwtSignOptions['expiresIn'],
        algorithm: (process.env.JWT_ALGORITHM || undefined) as JwtSignOptions['algorithm'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, SessionModule],
})
export class AuthModule {}
