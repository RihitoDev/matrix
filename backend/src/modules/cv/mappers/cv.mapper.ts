import { Injectable } from '@nestjs/common';
import { CV_FILE_NAME_MAX_LENGTH, CV_MIME_TYPE } from '../constants/cv.constants.js';
import type { CvResponse } from '../responses/cv.response.js';
import type { CvFileDownload } from '../types/cv-file-download.type.js';
import type { CvMetadataRecord } from '../types/cv-metadata-record.type.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import type { UploadedFile } from '../../../common/types/uploaded-file.type.js';

@Injectable()
export class CvMapper {
  toUploadedFile(file: MulterFile): UploadedFile {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
  }

  toResponse(record: CvMetadataRecord): CvResponse | null {
    if (record.sizeBytes === null || record.uploadedAt === null) {
      return null;
    }

    return {
      fileName: record.fileName ?? this.buildFileName(record),
      fileType: CV_MIME_TYPE,
      sizeInBytes: record.sizeBytes,
      updatedAt: record.uploadedAt.toISOString(),
    };
  }

  toStoredFileName(originalName: string | undefined): string | undefined {
    const trimmed = originalName?.trim();

    return trimmed ? trimmed.slice(0, CV_FILE_NAME_MAX_LENGTH) : undefined;
  }

  toFileDownload(content: Buffer, record: CvMetadataRecord): CvFileDownload {
    return {
      content,
      fileName: record.fileName
        ? this.toHeaderSafeName(record.fileName)
        : this.buildFileName(record),
      mimeType: CV_MIME_TYPE,
    };
  }

  private buildFileName(record: CvMetadataRecord): string {
    const nameParts = [record.firstName, record.lastName]
      .map((part) => this.toAsciiSlug(part))
      .filter((part) => part.length > 0);

    return ['CV', ...nameParts].join('-') + '.pdf';
  }

  private toHeaderSafeName(fileName: string): string {
    return fileName.replace(/[^\x20-\x7E]|["\\;]/g, '_');
  }

  private toAsciiSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
