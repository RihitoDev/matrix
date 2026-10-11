import type { FileType } from './file-type.type.js';

export interface FileValidationRules {
  allowedTypes: readonly FileType[];
  maxSizeBytes: number;
}
