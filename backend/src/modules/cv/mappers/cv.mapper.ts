import { Injectable } from '@nestjs/common';
import {
  CV_FILE_EXTENSION,
  CV_FILE_NAME_PREFIX,
  CV_MIME_TYPE,
  DIACRITIC_MARKS_PATTERN,
  EDGE_HYPHENS_PATTERN,
  NON_ALPHANUMERIC_PATTERN,
} from '../constants/cv.constants.js';
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
    if (record.sizeBytes === null) {
      return null;
    }

    return {
      fileName: this.buildFileName(record),
      fileType: CV_MIME_TYPE,
      sizeInBytes: record.sizeBytes,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  toFileDownload(content: Buffer, record: CvMetadataRecord): CvFileDownload {
    return {
      content,
      fileName: this.buildFileName(record),
      mimeType: CV_MIME_TYPE,
    };
  }

  private buildFileName(record: CvMetadataRecord): string {
    const nameParts = [record.firstName, record.lastName]
      .map((part) => this.toAsciiSlug(part))
      .filter((part) => part.length > 0);

    return [CV_FILE_NAME_PREFIX, ...nameParts].join('-') + CV_FILE_EXTENSION;
  }

  private toAsciiSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(DIACRITIC_MARKS_PATTERN, '')
      .replace(NON_ALPHANUMERIC_PATTERN, '-')
      .replace(EDGE_HYPHENS_PATTERN, '');
  }
}
