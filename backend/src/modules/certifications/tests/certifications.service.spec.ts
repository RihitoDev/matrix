import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificationNotFoundException } from '../exceptions/certification-not-found.exception.js';
import { CertificationMapper } from '../mappers/certification.mapper.js';
import { CertificationDocumentsRepository } from '../../certification-documents/repositories/certification-documents.repository.js';
import { CertificationsRepository } from '../repositories/certifications.repository.js';
import { CertificationsService } from '../services/certifications.service.js';
import type { CertificationRecord } from '../types/certification-record.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const certificationId = '33333333-3333-4333-8333-333333333333';

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

describe('CertificationsService', () => {
  let service: CertificationsService;
  let repository: {
    findManyByUserId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let documentsRepository: {
    hasDocument: ReturnType<typeof vi.fn>;
    findIdsWithDocument: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      findManyByUserId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    documentsRepository = {
      hasDocument: vi.fn().mockResolvedValue(false),
      findIdsWithDocument: vi.fn().mockResolvedValue(new Set<string>()),
    };
    service = new CertificationsService(
      repository as unknown as CertificationsRepository,
      documentsRepository as unknown as CertificationDocumentsRepository,
      new CertificationMapper(),
    );
  });

  it('creates a certification for the user and returns the mapped response', async () => {
    const request = {
      name: 'AWS Solutions Architect',
      issuingOrganization: 'Amazon',
      issueDate: new Date('2024-05-10'),
    };
    repository.create.mockResolvedValue(buildRecord());

    const result = await service.create(userId, request);

    expect(repository.create).toHaveBeenCalledWith(userId, request);
    expect(result).toEqual({
      id: certificationId,
      name: 'AWS Solutions Architect',
      issuingOrganization: 'Amazon',
      issueDate: '2024-05-10',
      hasDocument: false,
      createdAt: '2024-05-11T10:00:00.000Z',
      updatedAt: '2024-05-11T10:00:00.000Z',
    });
  });

  it('lists the certifications of the user in the repository order', async () => {
    repository.findManyByUserId.mockResolvedValue([
      buildRecord({ id: 'a', issueDate: new Date('2024-05-10') }),
      buildRecord({ id: 'b', issueDate: new Date('2022-01-01') }),
    ]);

    const result = await service.findAll(userId);

    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);
    expect(result.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('flags the certifications that have a document in the list', async () => {
    repository.findManyByUserId.mockResolvedValue([
      buildRecord({ id: 'a' }),
      buildRecord({ id: 'b' }),
    ]);
    documentsRepository.findIdsWithDocument.mockResolvedValue(new Set(['b']));

    const result = await service.findAll(userId);

    expect(documentsRepository.findIdsWithDocument).toHaveBeenCalledWith(userId);
    expect(result.map((item) => item.hasDocument)).toEqual([false, true]);
  });

  it('returns an empty list when the user has no certifications', async () => {
    repository.findManyByUserId.mockResolvedValue([]);

    await expect(service.findAll(userId)).resolves.toEqual([]);
  });

  it('updates an owned certification', async () => {
    repository.findById.mockResolvedValue(buildRecord());
    repository.update.mockResolvedValue(buildRecord({ name: 'Updated name' }));

    const result = await service.update(userId, certificationId, {
      name: 'Updated name',
    });

    expect(repository.update).toHaveBeenCalledWith(certificationId, {
      name: 'Updated name',
    });
    expect(result.name).toBe('Updated name');
  });

  it('keeps the document flag of the certification when updating it', async () => {
    repository.findById.mockResolvedValue(buildRecord());
    repository.update.mockResolvedValue(buildRecord());
    documentsRepository.hasDocument.mockResolvedValue(true);

    const result = await service.update(userId, certificationId, {
      name: 'Updated name',
    });

    expect(documentsRepository.hasDocument).toHaveBeenCalledWith(certificationId);
    expect(result.hasDocument).toBe(true);
  });

  it('throws not found when updating a missing certification', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.update(userId, certificationId, { name: 'Updated name' }),
    ).rejects.toBeInstanceOf(CertificationNotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('throws not found when updating a certification owned by another user', async () => {
    repository.findById.mockResolvedValue(buildRecord({ userId: otherUserId }));

    await expect(
      service.update(userId, certificationId, { name: 'Updated name' }),
    ).rejects.toBeInstanceOf(CertificationNotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('removes an owned certification', async () => {
    repository.findById.mockResolvedValue(buildRecord());
    repository.delete.mockResolvedValue(undefined);

    await expect(
      service.remove(userId, certificationId),
    ).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(certificationId);
  });

  it('throws not found when removing a missing certification', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.remove(userId, certificationId),
    ).rejects.toBeInstanceOf(CertificationNotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws not found when removing a certification owned by another user', async () => {
    repository.findById.mockResolvedValue(buildRecord({ userId: otherUserId }));

    await expect(
      service.remove(userId, certificationId),
    ).rejects.toBeInstanceOf(CertificationNotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('uses status 404 and an English message for the not found exception', () => {
    const exception = new CertificationNotFoundException();

    expect(exception.statusCode).toBe(404);
    expect(exception.message).toBe('Certification not found');
  });
});
