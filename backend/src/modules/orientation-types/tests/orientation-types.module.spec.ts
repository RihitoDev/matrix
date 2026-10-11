import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { OrientationTypesController } from '../controllers/orientation-types.controller.js';
import { OrientationTypesModule } from '../orientation-types.module.js';
import { OrientationTypesRepository } from '../repositories/orientation-types.repository.js';
import { OrientationTypesService } from '../services/orientation-types.service.js';
import { OrientationTypesMapper } from '../mappers/orientation-types.mapper.js';

describe('OrientationTypesModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrientationTypesModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([
    OrientationTypesController,
    OrientationTypesService,
    OrientationTypesRepository,
    OrientationTypesMapper,
  ])('resuelve %o', (provider) => {
    expect(moduleRef.get(provider)).toBeInstanceOf(provider);
  });
});
