import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { FileValidationService } from '../../common/services/file-validation.service.js';
import { FileStorage } from '../../common/types/file-storage.type.js';
import { CvFileController } from './controllers/cv-file.controller.js';
import { CvController } from './controllers/cv.controller.js';
import { CvMapper } from './mappers/cv.mapper.js';
import { CvFileRepository } from './repositories/cv-file.repository.js';
import { CvMetadataRepository } from './repositories/cv-metadata.repository.js';
import { CvService } from './services/cv.service.js';

@Module({
  imports: [PrismaModule, JwtAuthModule],
  controllers: [CvController, CvFileController],
  providers: [
    CvService,
    CvMetadataRepository,
    CvMapper,
    FileValidationService,
    CvFileRepository,
    { provide: FileStorage, useExisting: CvFileRepository },
  ],
  exports: [CvService],
})
export class CvModule {}
