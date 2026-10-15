import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SessionModule } from '../session/session.module.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Module({
  imports: [
    SessionModule,
    JwtModule.registerAsync({
      useFactory: () => ({ secret: process.env.JWT_SECRET }),
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard, SessionModule],
})
export class JwtAuthModule {}
