import { StreamableFile } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CvFileController } from '../controllers/cv-file.controller.js';
import { CvNotFoundException } from '../exceptions/cv-not-found.exception.js';
import type { CvService } from '../services/cv.service.js';

const userId = '11111111-1111-4111-8111-111111111111';

describe('CvFileController', () => {
  let controller: CvFileController;
  let service: { getFile: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { getFile: vi.fn() };
    controller = new CvFileController(service as unknown as CvService);
  });

  it('streams the pdf of the current user with its headers', async () => {
    const content = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    service.getFile.mockResolvedValue({
      content,
      fileName: 'CV-Test-User.pdf',
      mimeType: 'application/pdf',
    });

    const result = await controller.download(userId);

    expect(service.getFile).toHaveBeenCalledWith(userId);
    expect(result).toBeInstanceOf(StreamableFile);
    expect(result.getHeaders()).toEqual({
      type: 'application/pdf',
      disposition: 'inline; filename="CV-Test-User.pdf"',
      length: content.length,
    });
  });

  it('propagates the not found error when the user has no cv', async () => {
    service.getFile.mockRejectedValue(new CvNotFoundException());

    await expect(controller.download(userId)).rejects.toBeInstanceOf(
      CvNotFoundException,
    );
  });
});
