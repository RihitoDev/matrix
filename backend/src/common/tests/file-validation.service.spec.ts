import { beforeEach, describe, expect, it } from 'vitest';
import { CorruptedFileException } from '../exceptions/corrupted-file.exception.js';
import { EmptyFileException } from '../exceptions/empty-file.exception.js';
import { FileTooLargeException } from '../exceptions/file-too-large.exception.js';
import { InvalidFileTypeException } from '../exceptions/invalid-file-type.exception.js';
import { FileValidationService } from '../services/file-validation.service.js';
import type { FileValidationRules } from '../types/file-validation-rules.type.js';
import type { UploadedFile } from '../types/uploaded-file.type.js';

const maxSizeBytes = 5 * 1024 * 1024;

const cvRules: FileValidationRules = {
  allowedTypes: ['pdf'],
  maxSizeBytes,
};

const documentRules: FileValidationRules = {
  allowedTypes: ['pdf', 'png', 'jpg'],
  maxSizeBytes,
};

function buildFile(
  bytes: number[],
  overrides: Partial<UploadedFile> = {},
): UploadedFile {
  const buffer = Buffer.from(bytes);
  return {
    originalName: 'file.bin',
    mimeType: 'application/octet-stream',
    size: buffer.length,
    buffer,
    ...overrides,
  };
}

function buildFileFromBuffer(
  buffer: Buffer,
  overrides: Partial<UploadedFile> = {},
): UploadedFile {
  return {
    originalName: 'file.bin',
    mimeType: 'application/octet-stream',
    size: buffer.length,
    buffer,
    ...overrides,
  };
}

function makeMinimalPdf(): Buffer {
  const header = Buffer.from('%PDF-1.4\n');
  const body = Buffer.alloc(60, 0x20);
  const trailer = Buffer.from('\n%%EOF\n');
  return Buffer.concat([header, body, trailer]);
}

function makeMinimalPng(): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const body = Buffer.alloc(60, 0x00);
  const iend = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  return Buffer.concat([sig, body, iend]);
}

function makeMinimalJpg(): Buffer {
  const soi = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const body = Buffer.alloc(60, 0x00);
  const eoi = Buffer.from([0xff, 0xd9]);
  return Buffer.concat([soi, body, eoi]);
}

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(() => {
    service = new FileValidationService();
  });

  describe('valid complete files', () => {
    it('accepts a structurally complete pdf', () => {
      const file = buildFileFromBuffer(makeMinimalPdf(), {
        originalName: 'doc.pdf',
        mimeType: 'application/pdf',
      });

      const result = service.validate(file, cvRules);

      expect(result.detectedType).toBe('pdf');
      expect(result.detectedMimeType).toBe('application/pdf');
    });

    it('accepts a structurally complete png', () => {
      const file = buildFileFromBuffer(makeMinimalPng(), {
        originalName: 'photo.png',
        mimeType: 'image/png',
      });

      const result = service.validate(file, documentRules);

      expect(result.detectedType).toBe('png');
      expect(result.detectedMimeType).toBe('image/png');
    });

    it('accepts a structurally complete jpg', () => {
      const file = buildFileFromBuffer(makeMinimalJpg(), {
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
      });

      const result = service.validate(file, documentRules);

      expect(result.detectedType).toBe('jpg');
      expect(result.detectedMimeType).toBe('image/jpeg');
    });
  });

  describe('truncated files (signature only, no closing marker)', () => {
    it('rejects a pdf that is only 4 bytes of signature', () => {
      const file = buildFile([0x25, 0x50, 0x44, 0x46], {
        originalName: 'doc.pdf',
        mimeType: 'application/pdf',
      });

      expect(() => service.validate(file, cvRules)).toThrow(
        CorruptedFileException,
      );
    });

    it('rejects a png that is only 4 bytes of signature', () => {
      const file = buildFile([0x89, 0x50, 0x4e, 0x47], {
        originalName: 'photo.png',
        mimeType: 'image/png',
      });

      expect(() => service.validate(file, documentRules)).toThrow(
        CorruptedFileException,
      );
    });

    it('rejects a jpg that is only 3 bytes of signature', () => {
      const file = buildFile([0xff, 0xd8, 0xff], {
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
      });

      expect(() => service.validate(file, documentRules)).toThrow(
        CorruptedFileException,
      );
    });
  });

  describe('files missing the closing marker', () => {
    it('rejects a pdf without the %%EOF marker', () => {
      const header = Buffer.from('%PDF-1.4\n');
      const body = Buffer.alloc(60, 0x20);
      const truncated = Buffer.concat([header, body]);
      const file = buildFileFromBuffer(truncated, {
        originalName: 'doc.pdf',
        mimeType: 'application/pdf',
      });

      expect(() => service.validate(file, cvRules)).toThrow(
        CorruptedFileException,
      );
    });

    it('rejects a png without the IEND chunk', () => {
      const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const body = Buffer.alloc(60, 0x00);
      const truncated = Buffer.concat([sig, body]);
      const file = buildFileFromBuffer(truncated, {
        originalName: 'photo.png',
        mimeType: 'image/png',
      });

      expect(() => service.validate(file, documentRules)).toThrow(
        CorruptedFileException,
      );
    });

    it('rejects a jpg without the FF D9 end-of-image marker', () => {
      const soi = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const body = Buffer.alloc(60, 0x00);
      const truncated = Buffer.concat([soi, body]);
      const file = buildFileFromBuffer(truncated, {
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
      });

      expect(() => service.validate(file, documentRules)).toThrow(
        CorruptedFileException,
      );
    });
  });

  describe('existing validation (unchanged behaviour)', () => {
    it('throws an empty file exception when no file is provided', () => {
      expect(() => service.validate(undefined, cvRules)).toThrow(
        EmptyFileException,
      );
    });

    it('throws an empty file exception when the file has no content', () => {
      expect(() => service.validate(buildFile([]), cvRules)).toThrow(
        EmptyFileException,
      );
    });

    it('throws an empty file exception when the reported size is zero', () => {
      expect(() =>
        service.validate(buildFileFromBuffer(makeMinimalPdf(), { size: 0 }), cvRules),
      ).toThrow(EmptyFileException);
    });

    it('throws a file too large exception when the size exceeds 5 MB', () => {
      const file = buildFileFromBuffer(makeMinimalPdf(), {
        size: maxSizeBytes + 1,
      });

      expect(() => service.validate(file, cvRules)).toThrow(
        FileTooLargeException,
      );
    });

    it('throws a file too large exception when the content exceeds the limit', () => {
      const file = buildFileFromBuffer(makeMinimalPdf());

      expect(() =>
        service.validate(file, { ...cvRules, maxSizeBytes: 4 }),
      ).toThrow(FileTooLargeException);
    });

    it('rejects a png renamed as pdf with a pdf mime type', () => {
      const file = buildFileFromBuffer(makeMinimalPng(), {
        originalName: 'cv.pdf',
        mimeType: 'application/pdf',
      });

      expect(() => service.validate(file, cvRules)).toThrow(
        InvalidFileTypeException,
      );
    });

    it('rejects a file whose content matches no known signature', () => {
      const file = buildFile([0x50, 0x4b, 0x03, 0x04]);

      expect(() => service.validate(file, cvRules)).toThrow(
        InvalidFileTypeException,
      );
    });

    it.each([
      [[0x89, 0x50, 0x4e, 0x47], 'image/png'],
      [[0xff, 0xd8, 0xff, 0xe0], 'image/jpeg'],
      [[0x25, 0x50, 0x44, 0x46], 'application/pdf'],
      [[0x00, 0x01, 0x02], undefined],
    ])('detects the mime type of stored content %j', (bytes, mimeType) => {
      expect(service.detectMimeType(Buffer.from(bytes))).toBe(mimeType);
    });
  });
});
