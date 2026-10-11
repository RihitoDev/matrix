import type { FileValidationRules } from '../../../common/types/file-validation-rules.type.js';

export const CV_FIELD_NAME = 'file';

export const CV_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;

export const CV_VALIDATION_RULES: FileValidationRules = {
  allowedTypes: ['pdf'],
  maxSizeBytes: 5 * 1024 * 1024,
};

export const CV_MIME_TYPE = 'application/pdf';

export const CV_FILE_NAME_PREFIX = 'CV';

export const CV_FILE_EXTENSION = '.pdf';

export const DIACRITIC_MARKS_PATTERN = /[̀-ͯ]/g;

export const NON_ALPHANUMERIC_PATTERN = /[^A-Za-z0-9]+/g;

export const EDGE_HYPHENS_PATTERN = /^-+|-+$/g;
