import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmptyFileException } from '../../../common/exceptions/empty-file.exception.js';
import { FileTooLargeException } from '../../../common/exceptions/file-too-large.exception.js';
import { InvalidFileTypeException } from '../../../common/exceptions/invalid-file-type.exception.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import { CertificationNotFoundException } from '../../certifications/exceptions/certification-not-found.exception.js';
import { CertificationMapper } from '../../certifications/mappers/certification.mapper.js';
import { CertificationsRepository } from '../../certifications/repositories/certifications.repository.js';
import type { CertificationRecord } from '../../certifications/types/certification-record.type.js';
import { CertificationDocumentNotFoundException } from '../exceptions/certification-document-not-found.exception.js';
import { CertificationDocumentMapper } from '../mappers/certification-document.mapper.js';
import { CertificationDocumentsRepository } from '../repositories/certification-documents.repository.js';
import { CertificationDocumentsService } from '../services/certification-documents.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const certificationId = '33333333-3333-4333-8333-333333333333';

const pdfBytes = Array.from(Buffer.from("%PDF-1.4\n" + " ".repeat(50) + "\n%%EOF\n"));
const pngBytes = Array.from(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(50), Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])]));
const jpgBytes = Array.from(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(50), Buffer.from([0xff, 0xd9])]));

const buildRecord = (
  overrides: Partial<CertificationRecord> = {},
): CertificationRecord => ({
  id: certificationId,
  userId,
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: new Date('2024-05-10'),
  createdAt: new Date('2024-05-11T10:00:00.000Z'),
  updatedAt: new Date('2024-05-11T10:00:00.000Z'),
  ...overrides,
});

const buildFile = (
  bytes: number[],
  overrides: Partial<MulterFile> = {},
): MulterFile => ({
  originalname: 'certificate.pdf',
  mimetype: 'application/pdf',
  size: bytes.length,
  buffer: Buffer.from(bytes),
  ...overrides,
});

describe('CertificationDocumentsService', () => {
  let service: CertificationDocumentsService;
  let certificationsRepository: { findById: ReturnType<typeof vi.fn> };
  let documentsRepository: {
    save: ReturnType<typeof vi.fn>;
    read: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    hasDocument: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    certificationsRepository = { findById: vi.fn() };
    documentsRepository = {
      save: vi.fn(),
      read: vi.fn(),
      remove: vi.fn(),
      hasDocument: vi.fn(),
    };
    service = new CertificationDocumentsService(
      certificationsRepository as unknown as CertificationsRepository,
      documentsRepository as unknown as CertificationDocumentsRepository,
      new FileValidationService(),
      new CertificationMapper(),
      new CertificationDocumentMapper(),
    );
  });

  describe('upload', () => {
    it.each([
      ['pdf', pdfBytes],
      ['png', pngBytes],
      ['jpg', jpgBytes],
    ])('saves a valid %s document and flags the certification', async (_type, bytes) => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      documentsRepository.save.mockResolvedValue(undefined);

      const result = await service.upload(
        userId,
        certificationId,
        buildFile(bytes),
      );

      expect(documentsRepository.save).toHaveBeenCalledWith(
        certificationId,
        Buffer.from(bytes),
      );
      expect(result).toMatchObject({ id: certificationId, hasDocument: true });
      expect(result).not.toHaveProperty('userId');
    });

    it('rejects a missing file', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());

      await expect(
        service.upload(userId, certificationId, undefined),
      ).rejects.toBeInstanceOf(EmptyFileException);
      expect(documentsRepository.save).not.toHaveBeenCalled();
    });

    it('rejects an empty file', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());

      await expect(
        service.upload(userId, certificationId, buildFile([])),
      ).rejects.toBeInstanceOf(EmptyFileException);
    });

    it('rejects a file larger than 5 MB', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      const size = 5 * 1024 * 1024 + 1;
      const file = buildFile(pdfBytes, { size, buffer: Buffer.alloc(size) });

      await expect(
        service.upload(userId, certificationId, file),
      ).rejects.toBeInstanceOf(FileTooLargeException);
      expect(documentsRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a file whose real type is not allowed even with a valid extension', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      const textFile = buildFile([0x68, 0x65, 0x6c, 0x6c, 0x6f], {
        originalname: 'certificate.pdf',
        mimetype: 'application/pdf',
      });

      await expect(
        service.upload(userId, certificationId, textFile),
      ).rejects.toBeInstanceOf(InvalidFileTypeException);
      expect(documentsRepository.save).not.toHaveBeenCalled();
    });

    it('throws not found for a missing certification', async () => {
      certificationsRepository.findById.mockResolvedValue(null);

      await expect(
        service.upload(userId, certificationId, buildFile(pdfBytes)),
      ).rejects.toBeInstanceOf(CertificationNotFoundException);
      expect(documentsRepository.save).not.toHaveBeenCalled();
    });

    it('throws not found for a certification owned by another user', async () => {
      certificationsRepository.findById.mockResolvedValue(
        buildRecord({ userId: otherUserId }),
      );

      await expect(
        service.upload(userId, certificationId, buildFile(pdfBytes)),
      ).rejects.toBeInstanceOf(CertificationNotFoundException);
      expect(documentsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getFile', () => {
    it('returns the document with the type detected from its content', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      documentsRepository.read.mockResolvedValue(Buffer.from(pngBytes));

      await expect(service.getFile(userId, certificationId)).resolves.toEqual({
        content: Buffer.from(pngBytes),
        fileName: `certification-${certificationId}.png`,
        mimeType: 'image/png',
      });
    });

    it('throws document not found when the certification has no document', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      documentsRepository.read.mockResolvedValue(null);

      await expect(
        service.getFile(userId, certificationId),
      ).rejects.toBeInstanceOf(CertificationDocumentNotFoundException);
    });

    it('throws not found for a certification owned by another user', async () => {
      certificationsRepository.findById.mockResolvedValue(
        buildRecord({ userId: otherUserId }),
      );

      await expect(
        service.getFile(userId, certificationId),
      ).rejects.toBeInstanceOf(CertificationNotFoundException);
      expect(documentsRepository.read).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes the document of an owned certification', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      documentsRepository.hasDocument.mockResolvedValue(true);
      documentsRepository.remove.mockResolvedValue(undefined);

      await expect(
        service.remove(userId, certificationId),
      ).resolves.toBeUndefined();
      expect(documentsRepository.remove).toHaveBeenCalledWith(certificationId);
    });

    it('throws document not found when there is nothing to remove', async () => {
      certificationsRepository.findById.mockResolvedValue(buildRecord());
      documentsRepository.hasDocument.mockResolvedValue(false);

      await expect(
        service.remove(userId, certificationId),
      ).rejects.toBeInstanceOf(CertificationDocumentNotFoundException);
      expect(documentsRepository.remove).not.toHaveBeenCalled();
    });

    it('throws not found for a missing certification', async () => {
      certificationsRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove(userId, certificationId),
      ).rejects.toBeInstanceOf(CertificationNotFoundException);
      expect(documentsRepository.remove).not.toHaveBeenCalled();
    });
  });

  it('uses status 404 and an English message for the document not found exception', () => {
    const exception = new CertificationDocumentNotFoundException();

    expect(exception.statusCode).toBe(404);
    expect(exception.message).toBe('Certification document not found');
  });
});
