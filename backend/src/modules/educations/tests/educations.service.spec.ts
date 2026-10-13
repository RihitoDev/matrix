import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EducationNotFoundException } from '../exceptions/education-not-found.exception.js';
import { EducationUpdateConflictException } from '../exceptions/education-update-conflict.exception.js';
import { InvalidEducationDateRangeException } from '../exceptions/invalid-education-date-range.exception.js';
import { EducationMapper } from '../mappers/education.mapper.js';
import type { EducationsRepository } from '../repositories/educations.repository.js';
import { EducationsService } from '../services/educations.service.js';
import { EducationCatalogService } from '../services/education-catalog.service.js';
import type { EducationRecord } from '../types/education-record.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const educationId = '33333333-3333-4333-8333-333333333333';
const data = {
  institution: 'UMSS',
  degree: 'Ingeniería Informática',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2024-01-01'),
};
const record: EducationRecord = {
  ...data,
  id: educationId,
  userId,
  description: null,
  createdAt: new Date('2024-02-01T10:00:00.000Z'),
  updatedAt: new Date('2024-02-01T10:00:00.000Z'),
};

describe('EducationsService', () => {
  const repository = {
    findManyByUserId: vi.fn(),
    findByIdAndUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  let service: EducationsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new EducationsService(
      repository as unknown as EducationsRepository,
      new EducationMapper(),
      new EducationCatalogService(),
    );
  });

  it('creates an owned record and maps the public response', async () => {
    repository.create.mockResolvedValue(record);
    const response = await service.create(userId, data);
    expect(repository.create).toHaveBeenCalledWith(userId, data);
    expect(response.startDate).toBe('2020-01-01');
    expect(response).not.toHaveProperty('userId');
  });

  it('rejects a reversed date range before creating', async () => {
    await expect(
      service.create(userId, { ...data, endDate: new Date('2019-12-31') }),
    ).rejects.toBeInstanceOf(InvalidEducationDateRangeException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('accepts same-day education', async () => {
    repository.create.mockResolvedValue({ ...record, endDate: data.startDate });
    await expect(
      service.create(userId, { ...data, endDate: data.startDate }),
    ).resolves.toHaveProperty('id', educationId);
  });

  it('lists multiple records in repository order without exposing owners', async () => {
    const secondId = '44444444-4444-4444-8444-444444444444';
    repository.findManyByUserId.mockResolvedValue([
      record,
      { ...record, id: secondId },
    ]);
    const response = await service.findAll(userId);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);
    expect(response.map((item) => item.id)).toEqual([educationId, secondId]);
    response.forEach((item) => expect(item).not.toHaveProperty('userId'));
  });

  it('returns an empty list for a user without education', async () => {
    repository.findManyByUserId.mockResolvedValue([]);
    await expect(service.findAll(userId)).resolves.toEqual([]);
  });

  it('updates a single field while preserving stored dates', async () => {
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.update.mockResolvedValue({ ...record, degree: 'Ingeniería Industrial' });
    const response = await service.update(userId, educationId, {
      degree: 'Ingeniería Industrial',
    });
    expect(repository.findByIdAndUserId).toHaveBeenCalledWith(
      educationId,
      userId,
    );
    expect(repository.update).toHaveBeenCalledWith(educationId, userId, {
      degree: 'Ingeniería Industrial',
    }, {
      startDate: record.startDate,
      endDate: record.endDate,
    });
    expect(response.degree).toBe('Ingeniería Industrial');
  });

  it.each([
    { startDate: new Date('2025-01-01') },
    { endDate: new Date('2019-01-01') },
  ])('checks a partial date edit against stored dates', async (changes) => {
    repository.findByIdAndUserId.mockResolvedValue(record);
    await expect(
      service.update(userId, educationId, changes),
    ).rejects.toBeInstanceOf(InvalidEducationDateRangeException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('validates both new dates together', async () => {
    const changes = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
    };
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.update.mockResolvedValue({ ...record, ...changes });
    await expect(
      service.update(userId, educationId, changes),
    ).resolves.toMatchObject({
      startDate: '2025-01-01',
      endDate: '2026-01-01',
    });
  });

  it('allows clearing the optional description while preserving the end date', async () => {
    const changes = {
      description: null,
    };
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.update.mockResolvedValue({ ...record, ...changes });
    await expect(
      service.update(userId, educationId, changes),
    ).resolves.toMatchObject({ endDate: '2024-01-01', description: null });
  });

  it('rejects edits when no record belongs to the requester', async () => {
    repository.findByIdAndUserId.mockResolvedValue(null);
    await expect(
      service.update(userId, educationId, { degree: 'Ingeniería Industrial' }),
    ).rejects.toBeInstanceOf(EducationNotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('returns not found when the record disappears before the update', async () => {
    repository.findByIdAndUserId.mockResolvedValueOnce(record).mockResolvedValueOnce(null);
    repository.update.mockResolvedValue(null);
    await expect(
      service.update(userId, educationId, { degree: 'Ingeniería Industrial' }),
    ).rejects.toBeInstanceOf(EducationNotFoundException);
  });

  it('deletes a record using both its identifier and owner', async () => {
    repository.delete.mockResolvedValue(true);
    await expect(service.remove(userId, educationId)).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(educationId, userId);
  });

  it('returns not found for deletion when no owned record matches', async () => {
    repository.delete.mockResolvedValue(false);
    await expect(service.remove(userId, educationId)).rejects.toBeInstanceOf(
      EducationNotFoundException,
    );
  });

  it('uses standard domain error status codes', () => {
    expect(new EducationNotFoundException().statusCode).toBe(404);
    expect(new InvalidEducationDateRangeException().statusCode).toBe(400);
    expect(new EducationUpdateConflictException().statusCode).toBe(409);
  });

  it('preserves a missing end date when updating other fields', async () => {
    const legacy = { ...record, endDate: null };
    repository.findByIdAndUserId.mockResolvedValue(legacy);
    repository.update.mockResolvedValue({ ...legacy, description: 'Updated' });
    await expect(service.update(userId, educationId, { description: 'Updated' }))
      .resolves.toMatchObject({ endDate: null, description: 'Updated' });
    expect(repository.update).toHaveBeenCalledWith(educationId, userId,
      { description: 'Updated' }, { startDate: record.startDate, endDate: null });
  });

  it('returns a conflict instead of retrying a stale date update', async () => {
    repository.findByIdAndUserId.mockResolvedValueOnce(record).mockResolvedValueOnce({
      ...record, endDate: new Date('2022-01-01'),
    });
    repository.update.mockResolvedValue(null);
    await expect(service.update(userId, educationId, { startDate: new Date('2023-01-01') }))
      .rejects.toBeInstanceOf(EducationUpdateConflictException);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.findByIdAndUserId).toHaveBeenLastCalledWith(educationId, userId);
  });

  it('cannot merge two individually valid concurrent date edits into an invalid period', async () => {
    let stored = { ...record };
    repository.findByIdAndUserId.mockImplementation(async () => ({ ...stored }));
    repository.update.mockImplementation(async (_id, _userId, changes, expectedPeriod) => {
      if (stored.startDate.getTime() !== expectedPeriod.startDate.getTime()
        || stored.endDate?.getTime() !== expectedPeriod.endDate?.getTime()) return null;
      stored = { ...stored, ...changes };
      return { ...stored };
    });
    const results = await Promise.allSettled([
      service.update(userId, educationId, { startDate: new Date('2023-01-01') }),
      service.update(userId, educationId, { endDate: new Date('2022-01-01') }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected')).toMatchObject({
      reason: expect.any(EducationUpdateConflictException),
    });
    expect(stored.endDate! >= stored.startDate).toBe(true);
  });
});
