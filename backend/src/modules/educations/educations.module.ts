import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { EducationsController } from './controllers/educations.controller.js';
import { EducationMapper } from './mappers/education.mapper.js';
import { EducationsRepository } from './repositories/educations.repository.js';
import { EducationsService } from './services/educations.service.js';

@Module({
  imports: [PrismaModule, JwtAuthModule],
  controllers: [EducationsController],
  providers: [EducationsService, EducationsRepository, EducationMapper],
})
export class EducationsModule {}
