import { describe, expect, it } from 'vitest';
import { CertificationDocumentMapper } from '../mappers/certification-document.mapper.js';

const certificationId = '33333333-3333-4333-8333-333333333333';

describe('CertificationDocumentMapper', () => {
  const mapper = new CertificationDocumentMapper();

  it('maps a multer file to an uploaded file', () => {
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46]);

    expect(
      mapper.toUploadedFile({
        originalname: 'certificate.pdf',
        mimetype: 'application/pdf',
        size: 4,
        buffer,
      }),
    ).toEqual({
      originalName: 'certificate.pdf',
      mimeType: 'application/pdf',
      size: 4,
      buffer,
    });
  });

  it.each([
    ['application/pdf', 'pdf'],
    ['image/png', 'png'],
    ['image/jpeg', 'jpg'],
  ])('builds the download of a %s document', (mimeType, extension) => {
    const content = Buffer.from([1, 2, 3]);

    expect(mapper.toFileDownload(certificationId, content, mimeType)).toEqual({
      content,
      fileName: `certification-${certificationId}.${extension}`,
      mimeType,
    });
  });

  it('falls back to a binary download when the type is unknown', () => {
    const content = Buffer.from([1, 2, 3]);

    expect(mapper.toFileDownload(certificationId, content, undefined)).toEqual({
      content,
      fileName: `certification-${certificationId}.bin`,
      mimeType: 'application/octet-stream',
    });
  });
});
