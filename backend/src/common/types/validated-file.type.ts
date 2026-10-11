import type { FileType } from './file-type.type.js';
import type { UploadedFile } from './uploaded-file.type.js';

export interface ValidatedFile extends UploadedFile {
  detectedType: FileType;
  detectedMimeType: string;
}
