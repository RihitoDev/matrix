import { Injectable } from '@nestjs/common';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import type { UploadedFile } from '../../../common/types/uploaded-file.type.js';
import {
  CERTIFICATION_DOCUMENT_DEFAULT_EXTENSION,
  CERTIFICATION_DOCUMENT_DEFAULT_MIME_TYPE,
  CERTIFICATION_DOCUMENT_EXTENSION_BY_MIME_TYPE,
  CERTIFICATION_DOCUMENT_FILE_NAME_PREFIX,
} from '../constants/certification-document.constants.js';
import type { CertificationDocumentDownload } from '../types/certification-document-download.type.js';

@Injectable()
export class CertificationDocumentMapper {
  toUploadedFile(file: MulterFile): UploadedFile {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
  }

  toFileDownload(
    certificationId: string,
    content: Buffer,
    mimeType: string | undefined,
  ): CertificationDocumentDownload {
    const resolvedMimeType =
      mimeType ?? CERTIFICATION_DOCUMENT_DEFAULT_MIME_TYPE;
    const extension =
      CERTIFICATION_DOCUMENT_EXTENSION_BY_MIME_TYPE[resolvedMimeType] ??
      CERTIFICATION_DOCUMENT_DEFAULT_EXTENSION;

    return {
      content,
      fileName: `${CERTIFICATION_DOCUMENT_FILE_NAME_PREFIX}-${certificationId}.${extension}`,
      mimeType: resolvedMimeType,
    };
  }
}
