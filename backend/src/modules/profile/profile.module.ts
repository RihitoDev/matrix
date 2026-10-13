import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { FileValidationService } from '../../common/services/file-validation.service.js';
import { ProfilePhotoController } from './controllers/profile-photo.controller.js';
import { ProfileController } from './controllers/profile.controller.js';
import { ProfilePhotoMapper } from './mappers/profile-photo.mapper.js';
import { ProfileMapper } from './mappers/profile.mapper.js';
import { CityRepository } from './repositories/city.repository.js';
import { PhotoFileRepository } from './repositories/photo-file.repository.js';
import { ProfileRepository } from './repositories/profile.repository.js';
import { ProfilePhotoService } from './services/profile-photo.service.js';
import { ProfileService } from './services/profile.service.js';
import { CityCatalogService } from './services/city-catalog.service.js';

@Module({
  imports: [PrismaModule, JwtAuthModule],
  controllers: [ProfileController, ProfilePhotoController],
  providers: [
    ProfileService,
    CityCatalogService,
    ProfileRepository,
    CityRepository,
    ProfileMapper,
    ProfilePhotoService,
    PhotoFileRepository,
    ProfilePhotoMapper,
    FileValidationService,
  ],
  exports: [ProfileRepository, ProfileService, CityCatalogService],
})
export class ProfileModule {}
