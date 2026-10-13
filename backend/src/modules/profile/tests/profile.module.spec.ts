import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import { ProfilePhotoController } from '../controllers/profile-photo.controller.js';
import { ProfileController } from '../controllers/profile.controller.js';
import { ProfilePhotoMapper } from '../mappers/profile-photo.mapper.js';
import { ProfileMapper } from '../mappers/profile.mapper.js';
import { ProfileModule } from '../profile.module.js';
import { CityRepository } from '../repositories/city.repository.js';
import { PhotoFileRepository } from '../repositories/photo-file.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { ProfilePhotoService } from '../services/profile-photo.service.js';
import { ProfileService } from '../services/profile.service.js';
import { CityCatalogService } from '../services/city-catalog.service.js';

describe('ProfileModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ProfileModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([
    ProfileController,
    ProfilePhotoController,
    ProfileService,
    CityCatalogService,
    ProfilePhotoService,
    ProfileRepository,
    CityRepository,
    PhotoFileRepository,
    ProfileMapper,
    ProfilePhotoMapper,
    FileValidationService,
  ])('provides %p', (token) => {
    expect(moduleRef.get(token)).toBeDefined();
  });

  it('provides JwtAuthGuard', () => {
    expect(moduleRef.get(JwtAuthGuard)).toBeDefined();
  });
});
