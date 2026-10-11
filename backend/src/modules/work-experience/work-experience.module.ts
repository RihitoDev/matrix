import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { WorkExperienceController } from './controllers/work-experience.controller.js';
import { WorkExperienceMapper } from './mappers/work-experience.mapper.js';
import { WorkExperienceRepository } from './repositories/work-experience.repository.js';
import { WorkExperienceService } from './services/work-experience.service.js';

@Module({
  imports: [PrismaModule, JwtAuthModule],
  controllers: [WorkExperienceController],
  providers: [
    WorkExperienceService,
    WorkExperienceRepository,
    WorkExperienceMapper,
  ],
})
export class WorkExperienceModule {}