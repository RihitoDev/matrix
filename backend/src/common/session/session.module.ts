import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { SessionService } from '../services/session.service.js';

@Module({
  imports: [PrismaModule],
  providers: [SessionRepository, SessionService],
  exports: [SessionService],
})
export class SessionModule {}
