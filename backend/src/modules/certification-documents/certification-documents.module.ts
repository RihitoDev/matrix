import { forwardRef, Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { FileValidationService } from '../../common/services/file-validation.service.js';
import { CertificationsModule } from '../certifications/certifications.module.js';
import { CertificationDocumentFileController } from './controllers/certification-document-file.controller.js';
import { CertificationDocumentsController } from './controllers/certification-documents.controller.js';
import { CertificationDocumentMapper } from './mappers/certification-document.mapper.js';
import { CertificationDocumentsRepository } from './repositories/certification-documents.repository.js';
import { CertificationDocumentsService } from './services/certification-documents.service.js';

@Module({
  imports: [
    PrismaModule,
    JwtAuthModule,
    forwardRef(() => CertificationsModule),
  ],
  controllers: [
    CertificationDocumentsController,
    CertificationDocumentFileController,
  ],
  providers: [
    CertificationDocumentsService,
    CertificationDocumentsRepository,
    CertificationDocumentMapper,
    FileValidationService,
  ],
  exports: [CertificationDocumentsRepository],
})
export class CertificationDocumentsModule {}
