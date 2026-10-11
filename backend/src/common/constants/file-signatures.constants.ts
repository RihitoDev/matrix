import type { FileSignature } from '../types/file-signature.type.js';

export const FILE_SIGNATURES: readonly FileSignature[] = [
  {
    type: 'pdf',
    mimeType: 'application/pdf',
    bytes: [0x25, 0x50, 0x44, 0x46],
    endMarker: [0x25, 0x25, 0x45, 0x4f, 0x46],
    endMarkerSearchBytes: 1024,
  },
  {
    type: 'png',
    mimeType: 'image/png',
    bytes: [0x89, 0x50, 0x4e, 0x47],
    endMarker: [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82],
    endMarkerSearchBytes: 16,
  },
  {
    type: 'jpg',
    mimeType: 'image/jpeg',
    bytes: [0xff, 0xd8, 0xff],
    endMarker: [0xff, 0xd9],
    endMarkerSearchBytes: 1024,
  },
];
