import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import { CertificationsModule } from '../../certifications/certifications.module.js';
import { CertificationDocumentsModule } from '../certification-documents.module.js';
import { CertificationDocumentFileController } from '../controllers/certification-document-file.controller.js';
import { CertificationDocumentsController } from '../controllers/certification-documents.controller.js';
import { CertificationDocumentMapper } from '../mappers/certification-document.mapper.js';
import { CertificationDocumentsRepository } from '../repositories/certification-documents.repository.js';
import { CertificationDocumentsService } from '../services/certification-documents.service.js';

describe('CertificationDocumentsModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CertificationDocumentsModule, CertificationsModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([
    CertificationDocumentsController,
    CertificationDocumentFileController,
    CertificationDocumentsService,
    CertificationDocumentsRepository,
    CertificationDocumentMapper,
    FileValidationService,
  ])('provides %p', (provider) => {
    expect(moduleRef.get(provider)).toBeDefined();
  });
});
