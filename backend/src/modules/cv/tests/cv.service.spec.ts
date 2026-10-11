import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CvNotFoundException } from '../exceptions/cv-not-found.exception.js';
import { EmptyFileException } from '../../../common/exceptions/empty-file.exception.js';
import { FileTooLargeException } from '../../../common/exceptions/file-too-large.exception.js';
import { InvalidFileTypeException } from '../../../common/exceptions/invalid-file-type.exception.js';
import { ProfileNotFoundException } from '../../profile/exceptions/profile-not-found.exception.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import { FileStorage } from '../../../common/types/file-storage.type.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import { CvMapper } from '../mappers/cv.mapper.js';
import type { CvMetadataRepository } from '../repositories/cv-metadata.repository.js';
import { CvService } from '../services/cv.service.js';
import type { CvMetadataRecord } from '../types/cv-metadata-record.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const pdfContent = Buffer.from("%PDF-1.4\n" + " ".repeat(50) + "\n%%EOF\n");
const pngContent = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(50), Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])]);

const buildRecord = (
  overrides: Partial<CvMetadataRecord> = {},
): CvMetadataRecord => ({
  firstName: 'Test',
  lastName: 'User',
  sizeBytes: pdfContent.length,
  updatedAt: new Date('2026-10-03T12:00:00.000Z'),
  ...overrides,
});

const buildMulterFile = (
  buffer: Buffer,
  overrides: Partial<MulterFile> = {},
): MulterFile => ({
  originalname: 'resume.pdf',
  mimetype: 'application/pdf',
  size: buffer.length,
  buffer,
  ...overrides,
});

describe('CvService', () => {
  let service: CvService;
  let repository: { findByUserId: ReturnType<typeof vi.fn> };
  let storage: {
    save: ReturnType<typeof vi.fn>;
    read: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = { findByUserId: vi.fn() };
    storage = { save: vi.fn(), read: vi.fn(), remove: vi.fn() };
    service = new CvService(
      repository as unknown as CvMetadataRepository,
      storage as unknown as FileStorage,
      new FileValidationService(),
      new CvMapper(),
    );
  });

  describe('getMetadata', () => {
    it('returns the cv metadata of the user', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord());

      await expect(service.getMetadata(userId)).resolves.toEqual({
        fileName: 'CV-Test-User.pdf',
        fileType: 'application/pdf',
        sizeInBytes: pdfContent.length,
        updatedAt: '2026-10-03T12:00:00.000Z',
      });
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('returns null when the user has no cv', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord({ sizeBytes: null }));

      await expect(service.getMetadata(userId)).resolves.toBeNull();
    });

    it('throws profile not found when the user does not exist', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.getMetadata(userId)).rejects.toBeInstanceOf(
        ProfileNotFoundException,
      );
    });
  });

  describe('getFile', () => {
    it('returns the stored pdf with its download name', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord());
      storage.read.mockResolvedValue(pdfContent);

      await expect(service.getFile(userId)).resolves.toEqual({
        content: pdfContent,
        fileName: 'CV-Test-User.pdf',
        mimeType: 'application/pdf',
      });
      expect(storage.read).toHaveBeenCalledWith(userId);
    });

    it('throws cv not found when the user has no cv', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord({ sizeBytes: null }));
      storage.read.mockResolvedValue(null);

      await expect(service.getFile(userId)).rejects.toBeInstanceOf(
        CvNotFoundException,
      );
    });

    it('throws profile not found before reading the storage', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.getFile(userId)).rejects.toBeInstanceOf(
        ProfileNotFoundException,
      );
      expect(storage.read).not.toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    it('saves a valid pdf and returns the new metadata', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord());

      const result = await service.upload(userId, buildMulterFile(pdfContent));

      expect(storage.save).toHaveBeenCalledWith(userId, pdfContent);
      expect(result?.fileName).toBe('CV-Test-User.pdf');
      expect(result?.sizeInBytes).toBe(pdfContent.length);
    });

    it('replaces the previous cv with the new file', async () => {
      const newContent = Buffer.concat([pdfContent, Buffer.from([0x0a])]);
      repository.findByUserId
        .mockResolvedValueOnce(buildRecord())
        .mockResolvedValueOnce(
          buildRecord({
            sizeBytes: newContent.length,
            updatedAt: new Date('2026-10-04T08:00:00.000Z'),
          }),
        );

      const result = await service.upload(userId, buildMulterFile(newContent));

      expect(storage.save).toHaveBeenCalledWith(userId, newContent);
      expect(result?.sizeInBytes).toBe(newContent.length);
      expect(result?.updatedAt).toBe('2026-10-04T08:00:00.000Z');
    });

    it('rejects a missing file without saving', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord({ sizeBytes: null }));

      await expect(service.upload(userId, undefined)).rejects.toBeInstanceOf(
        EmptyFileException,
      );
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('rejects a png renamed as pdf without saving', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord());

      await expect(
        service.upload(userId, buildMulterFile(pngContent)),
      ).rejects.toBeInstanceOf(InvalidFileTypeException);
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('rejects a pdf larger than 5 MB without saving', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord());
      const file = buildMulterFile(pdfContent, { size: 5 * 1024 * 1024 + 1 });

      await expect(service.upload(userId, file)).rejects.toBeInstanceOf(
        FileTooLargeException,
      );
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('throws profile not found without validating or saving', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(
        service.upload(userId, buildMulterFile(pdfContent)),
      ).rejects.toBeInstanceOf(ProfileNotFoundException);
      expect(storage.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes the stored cv', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord());

      await expect(service.remove(userId)).resolves.toBeUndefined();
      expect(storage.remove).toHaveBeenCalledWith(userId);
    });

    it('throws cv not found when there is nothing to remove', async () => {
      repository.findByUserId.mockResolvedValue(buildRecord({ sizeBytes: null }));

      await expect(service.remove(userId)).rejects.toBeInstanceOf(
        CvNotFoundException,
      );
      expect(storage.remove).not.toHaveBeenCalled();
    });

    it('throws profile not found when the user does not exist', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toBeInstanceOf(
        ProfileNotFoundException,
      );
      expect(storage.remove).not.toHaveBeenCalled();
    });
  });
});
