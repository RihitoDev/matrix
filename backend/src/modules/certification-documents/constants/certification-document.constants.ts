import type { FileValidationRules } from '../../../common/types/file-validation-rules.type.js';

export const CERTIFICATION_DOCUMENT_FIELD_NAME = 'file';

export const CERTIFICATION_DOCUMENT_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;

export const CERTIFICATION_DOCUMENT_VALIDATION_RULES: FileValidationRules = {
  allowedTypes: ['pdf', 'png', 'jpg'],
  maxSizeBytes: 5 * 1024 * 1024,
};

export const CERTIFICATION_DOCUMENT_EXTENSION_BY_MIME_TYPE: Record<
  string,
  string
> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};
