import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Prisma } from '../../../prisma/client.js';
import { CertificationNotFoundException } from '../../certifications/exceptions/certification-not-found.exception.js';
import { CertificationDocumentsRepository } from '../repositories/certification-documents.repository.js';

const recordNotFoundError = new Prisma.PrismaClientKnownRequestError(
  'Record not found',
  { code: 'P2025', clientVersion: 'test' },
);

const userId = '11111111-1111-4111-8111-111111111111';
const certificationId = '33333333-3333-4333-8333-333333333333';

describe('CertificationDocumentsRepository', () => {
  let repository: CertificationDocumentsRepository;
  let certification: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    certification = {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    };
    repository = new CertificationDocumentsRepository({
      certification,
    } as unknown as PrismaService);
  });

  it('saves the content in the document column of the certification', async () => {
    certification.update.mockResolvedValue({ id: certificationId });

    await expect(
      repository.save(certificationId, Buffer.from([1, 2, 3])),
    ).resolves.toBeUndefined();
    expect(certification.update).toHaveBeenCalledWith({
      where: { id: certificationId },
      data: { documentUrl: new Uint8Array([1, 2, 3]) },
      select: { id: true },
    });
  });

  it('reads the content of the document', async () => {
    certification.findUnique.mockResolvedValue({
      documentUrl: new Uint8Array([1, 2, 3]),
    });

    await expect(repository.read(certificationId)).resolves.toEqual(
      Buffer.from([1, 2, 3]),
    );
    expect(certification.findUnique).toHaveBeenCalledWith({
      where: { id: certificationId },
      select: { documentUrl: true },
    });
  });

  it('returns null when the certification has no document', async () => {
    certification.findUnique.mockResolvedValue({ documentUrl: null });

    await expect(repository.read(certificationId)).resolves.toBeNull();
  });

  it('returns null when the certification does not exist', async () => {
    certification.findUnique.mockResolvedValue(null);

    await expect(repository.read(certificationId)).resolves.toBeNull();
  });

  it('clears the document column when removing the document', async () => {
    certification.update.mockResolvedValue({ id: certificationId });

    await expect(repository.remove(certificationId)).resolves.toBeUndefined();
    expect(certification.update).toHaveBeenCalledWith({
      where: { id: certificationId },
      data: { documentUrl: null },
      select: { id: true },
    });
  });

  it('fails with a domain exception when the certification no longer exists', async () => {
    certification.update.mockRejectedValue(recordNotFoundError);

    await expect(
      repository.save(certificationId, Buffer.from([1])),
    ).rejects.toBeInstanceOf(CertificationNotFoundException);
    await expect(repository.remove(certificationId)).rejects.toBeInstanceOf(
      CertificationNotFoundException,
    );
  });

  it('tells whether a certification has a document without loading it', async () => {
    certification.findFirst.mockResolvedValueOnce({ id: certificationId });
    certification.findFirst.mockResolvedValueOnce(null);

    await expect(repository.hasDocument(certificationId)).resolves.toBe(true);
    await expect(repository.hasDocument(certificationId)).resolves.toBe(false);
    expect(certification.findFirst).toHaveBeenCalledWith({
      where: { id: certificationId, documentUrl: { not: null } },
      select: { id: true },
    });
  });

  it('finds the ids of the certifications of a user that have a document', async () => {
    certification.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

    await expect(repository.findIdsWithDocument(userId)).resolves.toEqual(
      new Set(['a', 'b']),
    );
    expect(certification.findMany).toHaveBeenCalledWith({
      where: { userId, documentUrl: { not: null } },
      select: { id: true },
    });
  });
});
