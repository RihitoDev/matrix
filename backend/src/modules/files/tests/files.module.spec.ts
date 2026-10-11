import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from '../files.module.js';
import { FilesService } from '../services/files.service.js';
import { FilesRepository } from '../repositories/files.repository.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

describe('FilesModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({ imports: [FilesModule, PrismaModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([FilesService, FilesRepository])('resuelve %o', (provider) => {
    expect(moduleRef.get(provider)).toBeInstanceOf(provider);
  });

  it('exporta solo FilesService', () => {
    expect(Reflect.getMetadata('exports', FilesModule)).toEqual([FilesService]);
  });
});
