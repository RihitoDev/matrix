import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidWorkExperienceDateRangeException } from '../exceptions/invalid-work-experience-date-range.exception.js';
import { WorkExperienceEndDateRequiredException } from '../exceptions/work-experience-end-date-required.exception.js';
import { WorkExperienceNotFoundException } from '../exceptions/work-experience-not-found.exception.js';
import { WorkExperienceUpdateConflictException } from '../exceptions/work-experience-update-conflict.exception.js';
import { WorkExperienceMapper } from '../mappers/work-experience.mapper.js';
import type { WorkExperienceRepository } from '../repositories/work-experience.repository.js';
import { WorkExperienceService } from '../services/work-experience.service.js';
import type { WorkExperienceRecord } from '../types/work-experience-record.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const workExperienceId = '33333333-3333-4333-8333-333333333333';
const record: WorkExperienceRecord = {
  id: workExperienceId,
  userId,
  position: 'Junior web developer',
  startDate: new Date('2025-03-01T00:00:00.000Z'),
  endDate: null,
  isCurrent: true,
  description: null,
  createdAt: new Date('2025-03-02T10:00:00.000Z'),
  updatedAt: new Date('2025-03-02T10:00:00.000Z'),
  company: {
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Synapse Labs',
  },
};

describe('WorkExperienceService', () => {
  const repository = {
    findManyByUserId: vi.fn(),
    findByIdAndUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const mapper = new WorkExperienceMapper();
  let service: WorkExperienceService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new WorkExperienceService(
      repository as unknown as WorkExperienceRepository,
      mapper,
    );
  });

  it('lists the records of the user as responses', async () => {
    repository.findManyByUserId.mockResolvedValue([record]);

    await expect(service.findAll(userId)).resolves.toEqual([
      mapper.toResponse(record),
    ]);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);
  });

  it('creates a record and fills the optional fields with null', async () => {
    repository.create.mockResolvedValue(record);

    await expect(
      service.create(userId, {
        companyName: 'Synapse Labs',
        position: 'Junior web developer',
        startDate: record.startDate,
        isCurrent: true,
      }),
    ).resolves.toEqual(mapper.toResponse(record));
    expect(repository.create).toHaveBeenCalledWith(userId, {
      companyName: 'Synapse Labs',
      position: 'Junior web developer',
      startDate: record.startDate,
      endDate: null,
      isCurrent: true,
      description: null,
    });
  });

  it('ignores the end date of a current job', async () => {
    repository.create.mockResolvedValue(record);

    await service.create(userId, {
      companyName: 'Synapse Labs',
      position: 'Junior web developer',
      startDate: record.startDate,
      endDate: new Date('2025-06-30T00:00:00.000Z'),
      isCurrent: true,
    });

    expect(repository.create).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ endDate: null, isCurrent: true }),
    );
  });

  it('requires an end date when the job is not current', async () => {
    await expect(
      service.create(userId, {
        companyName: 'Synapse Labs',
        position: 'Junior web developer',
        startDate: record.startDate,
        isCurrent: false,
      }),
    ).rejects.toBeInstanceOf(WorkExperienceEndDateRequiredException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects an end date earlier than the start date', async () => {
    await expect(
      service.create(userId, {
        companyName: 'Synapse Labs',
        position: 'Junior web developer',
        startDate: new Date('2024-07-01T00:00:00.000Z'),
        endDate: new Date('2024-06-30T00:00:00.000Z'),
        isCurrent: false,
      }),
    ).rejects.toBeInstanceOf(InvalidWorkExperienceDateRangeException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('updates a record of the user', async () => {
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.update.mockResolvedValue({ ...record, position: 'Lead' });

    const response = await service.update(userId, workExperienceId, {
      position: 'Lead',
    });

    expect(response.position).toBe('Lead');
    expect(repository.update).toHaveBeenCalledWith(
      workExperienceId,
      userId,
      { position: 'Lead', endDate: null },
      {
        startDate: record.startDate,
        endDate: record.endDate,
        isCurrent: record.isCurrent,
      },
    );
  });

  it('fails with not found when the record to update is not from the user', async () => {
    repository.findByIdAndUserId.mockResolvedValue(null);

    await expect(
      service.update(userId, workExperienceId, { position: 'Lead' }),
    ).rejects.toBeInstanceOf(WorkExperienceNotFoundException);
    expect(repository.findByIdAndUserId).toHaveBeenCalledWith(
      workExperienceId,
      userId,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('fails with not found when the record disappears before updating', async () => {
    repository.findByIdAndUserId
      .mockResolvedValueOnce(record)
      .mockResolvedValueOnce(null);
    repository.update.mockResolvedValue(null);

    await expect(
      service.update(userId, workExperienceId, { position: 'Lead' }),
    ).rejects.toBeInstanceOf(WorkExperienceNotFoundException);
  });

  it('fails with a conflict when the period changed after it was validated', async () => {
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.update.mockResolvedValue(null);

    await expect(
      service.update(userId, workExperienceId, { position: 'Lead' }),
    ).rejects.toBeInstanceOf(WorkExperienceUpdateConflictException);
  });

  it('clears the end date when a job becomes current', async () => {
    repository.findByIdAndUserId.mockResolvedValue({
      ...record,
      isCurrent: false,
      endDate: new Date('2025-06-30T00:00:00.000Z'),
    });
    repository.update.mockResolvedValue(record);

    await service.update(userId, workExperienceId, { isCurrent: true });

    expect(repository.update).toHaveBeenCalledWith(
      workExperienceId,
      userId,
      { isCurrent: true, endDate: null },
      expect.objectContaining({ isCurrent: false }),
    );
  });

  it('validates the period with the saved values when only one date changes', async () => {
    repository.findByIdAndUserId.mockResolvedValue({
      ...record,
      isCurrent: false,
      endDate: new Date('2025-06-30T00:00:00.000Z'),
    });
    repository.update.mockResolvedValue(record);

    await expect(
      service.update(userId, workExperienceId, {
        endDate: new Date('2025-01-31T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(InvalidWorkExperienceDateRangeException);
    await expect(
      service.update(userId, workExperienceId, { isCurrent: false }),
    ).resolves.toBeDefined();
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('deletes a record of the user', async () => {
    repository.delete.mockResolvedValue(true);

    await expect(
      service.remove(userId, workExperienceId),
    ).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(workExperienceId, userId);
  });

  it('fails with not found when the record to delete is not from the user', async () => {
    repository.delete.mockResolvedValue(false);

    await expect(
      service.remove(userId, workExperienceId),
    ).rejects.toBeInstanceOf(WorkExperienceNotFoundException);
  });
});