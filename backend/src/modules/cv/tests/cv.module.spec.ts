import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import { CvFileController } from '../controllers/cv-file.controller.js';
import { CvController } from '../controllers/cv.controller.js';
import { CvModule } from '../cv.module.js';
import { CvMapper } from '../mappers/cv.mapper.js';
import { CvFileRepository } from '../repositories/cv-file.repository.js';
import { CvMetadataRepository } from '../repositories/cv-metadata.repository.js';
import { FileStorage } from '../../../common/types/file-storage.type.js';
import { CvService } from '../services/cv.service.js';

describe('CvModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CvModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([
    CvController,
    CvFileController,
    CvService,
    CvMetadataRepository,
    CvFileRepository,
    FileStorage,
    CvMapper,
    FileValidationService,
  ])('provides %p', (provider) => {
    expect(moduleRef.get(provider)).toBeDefined();
  });
});
