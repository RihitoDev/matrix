import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CvController } from '../controllers/cv.controller.js';
import type { CvService } from '../services/cv.service.js';

const userId = '11111111-1111-4111-8111-111111111111';

const response = {
  fileName: 'CV-Test-User.pdf',
  fileType: 'application/pdf',
  sizeInBytes: 1024,
  updatedAt: '2026-10-03T12:00:00.000Z',
};

describe('CvController', () => {
  let controller: CvController;
  let service: {
    getMetadata: ReturnType<typeof vi.fn>;
    upload: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = { getMetadata: vi.fn(), upload: vi.fn(), remove: vi.fn() };
    controller = new CvController(service as unknown as CvService);
  });

  it('returns the cv metadata of the current user', async () => {
    service.getMetadata.mockResolvedValue(response);

    await expect(controller.getMetadata(userId)).resolves.toBe(response);
    expect(service.getMetadata).toHaveBeenCalledWith(userId);
  });

  it('uploads the file of the current user', async () => {
    const file = {
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 4,
      buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
    };
    service.upload.mockResolvedValue(response);

    await expect(controller.upload(userId, file)).resolves.toBe(response);
    expect(service.upload).toHaveBeenCalledWith(userId, file);
  });

  it('removes the cv of the current user and returns null', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(userId)).resolves.toBeNull();
    expect(service.remove).toHaveBeenCalledWith(userId);
  });
});
