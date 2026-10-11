import { Injectable } from '@nestjs/common';
import { CV_VALIDATION_RULES } from '../constants/cv.constants.js';
import { CvNotFoundException } from '../exceptions/cv-not-found.exception.js';
import { ProfileNotFoundException } from '../../profile/exceptions/profile-not-found.exception.js';
import { CvMapper } from '../mappers/cv.mapper.js';
import { CvMetadataRepository } from '../repositories/cv-metadata.repository.js';
import type { CvResponse } from '../responses/cv.response.js';
import type { CvFileDownload } from '../types/cv-file-download.type.js';
import type { CvMetadataRecord } from '../types/cv-metadata-record.type.js';
import { FileStorage } from '../../../common/types/file-storage.type.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';

@Injectable()
export class CvService {
  constructor(
    private readonly cvMetadataRepository: CvMetadataRepository,
    private readonly fileStorage: FileStorage,
    private readonly fileValidationService: FileValidationService,
    private readonly cvMapper: CvMapper,
  ) {}

  async getMetadata(userId: string): Promise<CvResponse | null> {
    const record = await this.getRecordOrFail(userId);
    return this.cvMapper.toResponse(record);
  }

  async getFile(userId: string): Promise<CvFileDownload> {
    const record = await this.getRecordOrFail(userId);
    const content = await this.fileStorage.read(userId);

    if (!content) {
      throw new CvNotFoundException();
    }

    return this.cvMapper.toFileDownload(content, record);
  }

  async upload(
    userId: string,
    file: MulterFile | undefined,
  ): Promise<CvResponse | null> {
    await this.getRecordOrFail(userId);

    const validatedFile = this.fileValidationService.validate(
      file ? this.cvMapper.toUploadedFile(file) : undefined,
      CV_VALIDATION_RULES,
    );

    await this.fileStorage.save(userId, validatedFile.buffer);

    return this.getMetadata(userId);
  }

  async remove(userId: string): Promise<void> {
    const record = await this.getRecordOrFail(userId);

    if (record.sizeBytes === null) {
      throw new CvNotFoundException();
    }

    await this.fileStorage.remove(userId);
  }

  private async getRecordOrFail(userId: string): Promise<CvMetadataRecord> {
    const record = await this.cvMetadataRepository.findByUserId(userId);

    if (!record) {
      throw new ProfileNotFoundException();
    }

    return record;
  }
}
