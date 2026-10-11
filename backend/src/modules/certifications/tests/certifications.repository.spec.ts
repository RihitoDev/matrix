import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { CertificationNotFoundException } from '../exceptions/certification-not-found.exception.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CertificationsRepository } from '../repositories/certifications.repository.js';

const recordNotFoundError = new Prisma.PrismaClientKnownRequestError('Record not found', {
  code: 'P2025',
  clientVersion: 'test',
});

const userId = '11111111-1111-4111-8111-111111111111';
const certificationId = '33333333-3333-4333-8333-333333333333';

describe('CertificationsRepository', () => {
  let repository: CertificationsRepository;
  let certification: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    certification = {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    repository = new CertificationsRepository({
      certification,
    } as unknown as PrismaService);
  });

  it('finds the certifications of a user ordered by issue date descending', async () => {
    const records = [{ id: 'a' }];
    certification.findMany.mockResolvedValue(records);

    await expect(repository.findManyByUserId(userId)).resolves.toBe(records);
    expect(certification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
        orderBy: { issueDate: 'desc' },
      }),
    );
  });

  it('finds a certification by id', async () => {
    const record = { id: certificationId };
    certification.findUnique.mockResolvedValue(record);

    await expect(repository.findById(certificationId)).resolves.toBe(record);
    expect(certification.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: certificationId } }),
    );
  });

  it('returns null when the certification does not exist', async () => {
    certification.findUnique.mockResolvedValue(null);

    await expect(repository.findById(certificationId)).resolves.toBeNull();
  });

  it('creates a certification attached to the user', async () => {
    const data = {
      name: 'AWS Solutions Architect',
      issuingOrganization: 'Amazon',
      issueDate: new Date('2024-05-10'),
    };
    const record = { id: certificationId };
    certification.create.mockResolvedValue(record);

    await expect(repository.create(userId, data)).resolves.toBe(record);
    expect(certification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ...data, userId } }),
    );
  });

  it('updates a certification by id', async () => {
    const record = { id: certificationId };
    certification.update.mockResolvedValue(record);

    await expect(
      repository.update(certificationId, { name: 'Updated' }),
    ).resolves.toBe(record);
    expect(certification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: certificationId },
        data: { name: 'Updated' },
      }),
    );
  });

  it('deletes a certification by id', async () => {
    certification.delete.mockResolvedValue({ id: certificationId });

    await expect(
      repository.delete(certificationId),
    ).resolves.toBeUndefined();
    expect(certification.delete).toHaveBeenCalledWith({
      where: { id: certificationId },
    });
  });

  it('fails with a domain exception when the certification no longer exists', async () => {
    certification.update.mockRejectedValue(recordNotFoundError);
    certification.delete.mockRejectedValue(recordNotFoundError);

    await expect(
      repository.update(certificationId, { name: 'Updated' }),
    ).rejects.toBeInstanceOf(CertificationNotFoundException);
    await expect(repository.delete(certificationId)).rejects.toBeInstanceOf(
      CertificationNotFoundException,
    );
  });
});
