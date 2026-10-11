import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileTooLargeException } from '../../../common/exceptions/file-too-large.exception.js';
import { InvalidFileTypeException } from '../../../common/exceptions/invalid-file-type.exception.js';
import { PhotoNotFoundException } from '../exceptions/photo-not-found.exception.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import { ProfilePhotoMapper } from '../mappers/profile-photo.mapper.js';
import type { PhotoFileRepository } from '../repositories/photo-file.repository.js';
import type { ProfileRepository } from '../repositories/profile.repository.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import { ProfilePhotoService } from '../services/profile-photo.service.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const jpgBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(50), Buffer.from([0xff, 0xd9])]);
const pdfBytes = Buffer.from("%PDF-1.4\n" + " ".repeat(50) + "\n%%EOF\n");

const buildFile = (buffer: Buffer, overrides: Partial<MulterFile> = {}): MulterFile => ({
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  size: buffer.length,
  buffer,
  ...overrides,
});

describe('ProfilePhotoService', () => {
  let service: ProfilePhotoService;
  let profileRepository: { findByUserId: ReturnType<typeof vi.fn> };
  let photoFileRepository: {
    save: ReturnType<typeof vi.fn>;
    read: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    profileRepository = { findByUserId: vi.fn().mockResolvedValue({ id: userId }) };
    photoFileRepository = {
      save: vi.fn(),
      read: vi.fn(),
      exists: vi.fn(),
      remove: vi.fn(),
    };
    service = new ProfilePhotoService(
      profileRepository as unknown as ProfileRepository,
      photoFileRepository as unknown as PhotoFileRepository,
      new FileValidationService(),
      new ProfilePhotoMapper(),
    );
  });

  describe('upload', () => {
    it('saves a valid jpg photo and returns its metadata', async () => {
      await expect(service.upload(userId, buildFile(jpgBytes))).resolves.toEqual({
        mimeType: 'image/jpeg',
        sizeInBytes: jpgBytes.length,
      });
      expect(photoFileRepository.save).toHaveBeenCalledWith(userId, jpgBytes);
    });

    it('rejects a file whose content is not jpg or png', async () => {
      await expect(service.upload(userId, buildFile(pdfBytes))).rejects.toBeInstanceOf(
        InvalidFileTypeException,
      );
      expect(photoFileRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a photo bigger than 5 MB', async () => {
      const file = buildFile(jpgBytes, { size: 5 * 1024 * 1024 + 1 });

      await expect(service.upload(userId, file)).rejects.toBeInstanceOf(FileTooLargeException);
    });

    it('throws when the user does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);

      await expect(service.upload(userId, buildFile(jpgBytes))).rejects.toBeInstanceOf(
        ProfileNotFoundException,
      );
    });
  });

  describe('getPhoto', () => {
    it('returns the photo with its detected mime type', async () => {
      photoFileRepository.read.mockResolvedValue(jpgBytes);

      await expect(service.getPhoto(userId)).resolves.toEqual({
        content: jpgBytes,
        mimeType: 'image/jpeg',
      });
    });

    it('throws when there is no photo', async () => {
      photoFileRepository.read.mockResolvedValue(null);

      await expect(service.getPhoto(userId)).rejects.toBeInstanceOf(PhotoNotFoundException);
    });

    it('throws when the stored content is not a known image', async () => {
      photoFileRepository.read.mockResolvedValue(Buffer.from([0x00, 0x01]));

      await expect(service.getPhoto(userId)).rejects.toBeInstanceOf(PhotoNotFoundException);
    });
  });

  describe('remove', () => {
    it('removes an existing photo', async () => {
      photoFileRepository.exists.mockResolvedValue(true);

      await service.remove(userId);

      expect(photoFileRepository.remove).toHaveBeenCalledWith(userId);
    });

    it('throws when there is no photo to remove', async () => {
      photoFileRepository.exists.mockResolvedValue(false);

      await expect(service.remove(userId)).rejects.toBeInstanceOf(PhotoNotFoundException);
      expect(photoFileRepository.remove).not.toHaveBeenCalled();
    });
  });
});
