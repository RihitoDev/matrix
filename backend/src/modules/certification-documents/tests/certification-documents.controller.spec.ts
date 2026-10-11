import { StreamableFile } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificationDocumentFileController } from '../controllers/certification-document-file.controller.js';
import { CertificationDocumentsController } from '../controllers/certification-documents.controller.js';
import { CertificationDocumentNotFoundException } from '../exceptions/certification-document-not-found.exception.js';
import type { CertificationDocumentsService } from '../services/certification-documents.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const certificationId = '33333333-3333-4333-8333-333333333333';

const response = {
  id: certificationId,
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: '2024-05-10',
  hasDocument: true,
  createdAt: '2024-05-11T10:00:00.000Z',
  updatedAt: '2024-05-11T10:00:00.000Z',
};

describe('CertificationDocumentsController', () => {
  let controller: CertificationDocumentsController;
  let service: {
    upload: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = { upload: vi.fn(), remove: vi.fn() };
    controller = new CertificationDocumentsController(
      service as unknown as CertificationDocumentsService,
    );
  });

  it('uploads the document of a certification of the current user', async () => {
    const file = {
      originalname: 'certificate.pdf',
      mimetype: 'application/pdf',
      size: 4,
      buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
    };
    service.upload.mockResolvedValue(response);

    await expect(
      controller.upload(userId, certificationId, file),
    ).resolves.toBe(response);
    expect(service.upload).toHaveBeenCalledWith(userId, certificationId, file);
  });

  it('removes the document and returns null', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove(userId, certificationId),
    ).resolves.toBeNull();
    expect(service.remove).toHaveBeenCalledWith(userId, certificationId);
  });
});

describe('CertificationDocumentFileController', () => {
  let controller: CertificationDocumentFileController;
  let service: { getFile: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { getFile: vi.fn() };
    controller = new CertificationDocumentFileController(
      service as unknown as CertificationDocumentsService,
    );
  });

  it('streams the document with its headers', async () => {
    const content = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    service.getFile.mockResolvedValue({
      content,
      fileName: `certification-${certificationId}.pdf`,
      mimeType: 'application/pdf',
    });

    const result = await controller.download(userId, certificationId);

    expect(service.getFile).toHaveBeenCalledWith(userId, certificationId);
    expect(result).toBeInstanceOf(StreamableFile);
    expect(result.getHeaders()).toEqual({
      type: 'application/pdf',
      disposition: `inline; filename="certification-${certificationId}.pdf"`,
      length: content.length,
    });
  });

  it('propagates the not found error when there is no document', async () => {
    service.getFile.mockRejectedValue(
      new CertificationDocumentNotFoundException(),
    );

    await expect(
      controller.download(userId, certificationId),
    ).rejects.toBeInstanceOf(CertificationDocumentNotFoundException);
  });
});
