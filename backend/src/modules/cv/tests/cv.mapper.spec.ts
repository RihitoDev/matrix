import { beforeEach, describe, expect, it } from 'vitest';
import { CvMapper } from '../mappers/cv.mapper.js';
import type { CvMetadataRecord } from '../types/cv-metadata-record.type.js';

const buildRecord = (
  overrides: Partial<CvMetadataRecord> = {},
): CvMetadataRecord => ({
  firstName: 'Test',
  lastName: 'User',
  sizeBytes: 1258291,
  updatedAt: new Date('2026-10-03T12:00:00.000Z'),
  ...overrides,
});

describe('CvMapper', () => {
  let mapper: CvMapper;

  beforeEach(() => {
    mapper = new CvMapper();
  });

  it('maps a multer file to the internal uploaded file', () => {
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46]);

    expect(
      mapper.toUploadedFile({
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 4,
        buffer,
      }),
    ).toEqual({
      originalName: 'resume.pdf',
      mimeType: 'application/pdf',
      size: 4,
      buffer,
    });
  });

  it('maps a stored cv to the response with an iso date', () => {
    expect(mapper.toResponse(buildRecord())).toEqual({
      fileName: 'CV-Test-User.pdf',
      fileType: 'application/pdf',
      sizeInBytes: 1258291,
      updatedAt: '2026-10-03T12:00:00.000Z',
    });
  });

  it('returns null when the user has no cv', () => {
    expect(mapper.toResponse(buildRecord({ sizeBytes: null }))).toBeNull();
  });

  it('builds an ascii file name without accents or spaces', () => {
    const response = mapper.toResponse(
      buildRecord({ firstName: 'José Luis', lastName: 'Pérez Núñez' }),
    );

    expect(response?.fileName).toBe('CV-Jose-Luis-Perez-Nunez.pdf');
  });

  it('removes characters that are not valid in a header file name', () => {
    const response = mapper.toResponse(
      buildRecord({ firstName: ' "Ana" ', lastName: "O'Brien;" }),
    );

    expect(response?.fileName).toBe('CV-Ana-O-Brien.pdf');
  });

  it('falls back to the prefix when the names have no valid characters', () => {
    const response = mapper.toResponse(
      buildRecord({ firstName: '***', lastName: '' }),
    );

    expect(response?.fileName).toBe('CV.pdf');
  });

  it('maps the stored content to a pdf download', () => {
    const content = Buffer.from([0x25, 0x50, 0x44, 0x46]);

    expect(mapper.toFileDownload(content, buildRecord())).toEqual({
      content,
      fileName: 'CV-Test-User.pdf',
      mimeType: 'application/pdf',
    });
  });
});
