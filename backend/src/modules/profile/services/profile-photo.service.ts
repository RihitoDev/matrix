import { Injectable } from '@nestjs/common';
import { PhotoNotFoundException } from '../exceptions/photo-not-found.exception.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import { ProfilePhotoMapper } from '../mappers/profile-photo.mapper.js';
import { PhotoFileRepository } from '../repositories/photo-file.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import type { ProfilePhotoResponse } from '../responses/profile-photo.response.js';
import type { FileValidationRules } from '../../../common/types/file-validation-rules.type.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import type { PhotoFileDownload } from '../types/photo-file-download.type.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';

const photoValidationRules: FileValidationRules = {
  allowedTypes: ['jpg', 'png'],
  maxSizeBytes: 5 * 1024 * 1024,
};

@Injectable()
export class ProfilePhotoService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly photoFileRepository: PhotoFileRepository,
    private readonly fileValidationService: FileValidationService,
    private readonly profilePhotoMapper: ProfilePhotoMapper,
  ) {}

  async upload(userId: string, file: MulterFile | undefined): Promise<ProfilePhotoResponse> {
    await this.ensureProfileExists(userId);

    const validatedFile = this.fileValidationService.validate(
      file ? this.profilePhotoMapper.toUploadedFile(file) : undefined,
      photoValidationRules,
    );

    await this.photoFileRepository.save(userId, validatedFile.buffer);
    return this.profilePhotoMapper.toResponse(validatedFile);
  }

  async getPhoto(userId: string): Promise<PhotoFileDownload> {
    await this.ensureProfileExists(userId);

    const content = await this.photoFileRepository.read(userId);
    const mimeType = content ? this.fileValidationService.detectMimeType(content) : undefined;

    if (!content || !mimeType) {
      throw new PhotoNotFoundException();
    }

    return { content, mimeType };
  }

  async remove(userId: string): Promise<void> {
    await this.ensureProfileExists(userId);

    if (!(await this.photoFileRepository.exists(userId))) {
      throw new PhotoNotFoundException();
    }

    await this.photoFileRepository.remove(userId);
  }

  private async ensureProfileExists(userId: string): Promise<void> {
    if (!(await this.profileRepository.findByUserId(userId))) {
      throw new ProfileNotFoundException();
    }
  }
}
