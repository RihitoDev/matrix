import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { EducationsController } from './controllers/educations.controller.js';
import { EducationMapper } from './mappers/education.mapper.js';
import { EducationsRepository } from './repositories/educations.repository.js';
import { EducationCatalogService } from './services/education-catalog.service.js';
import { EducationsService } from './services/educations.service.js';

@Module({
  imports: [PrismaModule, JwtAuthModule],
  controllers: [EducationsController],
  providers: [
    EducationsService,
    EducationCatalogService,
    EducationsRepository,
    EducationMapper,
  ],
  exports: [EducationsService, EducationCatalogService],
})
export class EducationsModule {}
