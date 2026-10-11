import { forwardRef, Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { CertificationDocumentsModule } from '../certification-documents/certification-documents.module.js';
import { CertificationsController } from './controllers/certifications.controller.js';
import { CertificationMapper } from './mappers/certification.mapper.js';
import { CertificationsRepository } from './repositories/certifications.repository.js';
import { CertificationsService } from './services/certifications.service.js';

@Module({
  imports: [
    PrismaModule,
    JwtAuthModule,
    forwardRef(() => CertificationDocumentsModule),
  ],
  controllers: [CertificationsController],
  providers: [
    CertificationsService,
    CertificationsRepository,
    CertificationMapper,
  ],
  exports: [CertificationsRepository, CertificationMapper],
})
export class CertificationsModule {}
