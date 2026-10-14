import type { FileValidationRules } from '../../../common/types/file-validation-rules.type.js';

export const CV_FIELD_NAME = 'file';

export const CV_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;

export const CV_VALIDATION_RULES: FileValidationRules = {
  allowedTypes: ['pdf'],
  maxSizeBytes: 5 * 1024 * 1024,
};

export const CV_MIME_TYPE = 'application/pdf';

export const CV_FILE_NAME_MAX_LENGTH = 255;
