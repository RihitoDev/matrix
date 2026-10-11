export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const DEFAULT_FILE_NAME = 'documento';

export const MAX_FILE_NAME_LENGTH = 200;

// El tipo se decide por los primeros bytes del contenido, nunca por el nombre ni el MIME declarado
export const FILE_TYPES = [
  { extension: 'pdf', mimeType: 'application/pdf', signature: [0x25, 0x50, 0x44, 0x46] },
  { extension: 'png', mimeType: 'image/png', signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { extension: 'jpg', mimeType: 'image/jpeg', signature: [0xff, 0xd8, 0xff] },
] as const;
