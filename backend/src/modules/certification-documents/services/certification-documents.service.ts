import { Injectable } from '@nestjs/common';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import { CertificationNotFoundException } from '../../certifications/exceptions/certification-not-found.exception.js';
import { CertificationMapper } from '../../certifications/mappers/certification.mapper.js';
import { CertificationsRepository } from '../../certifications/repositories/certifications.repository.js';
import type { CertificationRecord } from '../../certifications/types/certification-record.type.js';
import type { CertificationResponse } from '../../certifications/types/certification-response.type.js';
import { CERTIFICATION_DOCUMENT_VALIDATION_RULES } from '../constants/certification-document.constants.js';
import { CertificationDocumentNotFoundException } from '../exceptions/certification-document-not-found.exception.js';
import { CertificationDocumentMapper } from '../mappers/certification-document.mapper.js';
import { CertificationDocumentsRepository } from '../repositories/certification-documents.repository.js';
import type { CertificationDocumentDownload } from '../types/certification-document-download.type.js';

@Injectable()
export class CertificationDocumentsService {
  constructor(
    private readonly certificationsRepository: CertificationsRepository,
    private readonly documentsRepository: CertificationDocumentsRepository,
    private readonly fileValidationService: FileValidationService,
    private readonly certificationMapper: CertificationMapper,
    private readonly documentMapper: CertificationDocumentMapper,
  ) {}

  async upload(
    userId: string,
    id: string,
    file: MulterFile | undefined,
  ): Promise<CertificationResponse> {
    await this.getOwnedOrFail(userId, id);

    const validatedFile = this.fileValidationService.validate(
      file ? this.documentMapper.toUploadedFile(file) : undefined,
      CERTIFICATION_DOCUMENT_VALIDATION_RULES,
    );

    await this.documentsRepository.save(id, validatedFile.buffer);

    const updated = await this.getOwnedOrFail(userId, id);
    return this.certificationMapper.toResponse(updated, true);
  }

  async getFile(
    userId: string,
    id: string,
  ): Promise<CertificationDocumentDownload> {
    await this.getOwnedOrFail(userId, id);
    const content = await this.documentsRepository.read(id);

    if (!content) {
      throw new CertificationDocumentNotFoundException();
    }

    return this.documentMapper.toFileDownload(
      id,
      content,
      this.fileValidationService.detectMimeType(content),
    );
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedOrFail(userId, id);

    if (!(await this.documentsRepository.hasDocument(id))) {
      throw new CertificationDocumentNotFoundException();
    }

    await this.documentsRepository.remove(id);
  }

  private async getOwnedOrFail(
    userId: string,
    id: string,
  ): Promise<CertificationRecord> {
    const record = await this.certificationsRepository.findById(id);

    if (!record || record.userId !== userId) {
      throw new CertificationNotFoundException();
    }

    return record;
  }
}
