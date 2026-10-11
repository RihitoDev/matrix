import type { FileType } from './file-type.type.js';

export interface FileSignature {
  type: FileType;
  mimeType: string;
  bytes: readonly number[];
  endMarker: readonly number[];
  endMarkerSearchBytes: number;
}
