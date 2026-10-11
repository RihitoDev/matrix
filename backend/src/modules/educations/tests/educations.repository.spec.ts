import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { EducationsRepository } from '../repositories/educations.repository.js';
import type { EducationRecord } from '../types/education-record.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const educationId = '33333333-3333-4333-8333-333333333333';
const record: EducationRecord = {
  id: educationId,
  userId,
  institution: 'Universidad Mayor de San Simon',
  degree: 'Computer Science',
  startDate: new Date('2018-02-01T00:00:00.000Z'),
  endDate: null,
  description: null,
  createdAt: new Date('2024-05-11T10:00:00.000Z'),
  updatedAt: new Date('2024-05-12T10:00:00.000Z'),
};
const expectedSelect = {
  id: true,
  userId: true,
  institution: true,
  degree: true,
  startDate: true,
  endDate: true,
  description: true,
  createdAt: true,
  updatedAt: true,
};
const expectedPeriod = { startDate: record.startDate, endDate: record.endDate };

describe('EducationsRepository', () => {
  const education = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateManyAndReturn: vi.fn(),
    deleteMany: vi.fn(),
  };
  let repository: EducationsRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new EducationsRepository({
      education,
    } as unknown as PrismaService);
  });

  it('lists only the owner records with an explicit selection and stable ordering', async () => {
    const records = [record];
    education.findMany.mockResolvedValue(records);

    await expect(repository.findManyByUserId(userId)).resolves.toEqual(records);
    expect(education.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
      select: expectedSelect,
    });
  });

  it('returns an empty list when the user has no education records', async () => {
    education.findMany.mockResolvedValue([]);

    await expect(repository.findManyByUserId(userId)).resolves.toEqual([]);
  });

  it('looks up a record using both its id and its owner', async () => {
    education.findFirst.mockResolvedValue(record);

    await expect(
      repository.findByIdAndUserId(educationId, userId),
    ).resolves.toEqual(record);
    expect(education.findFirst).toHaveBeenCalledWith({
      where: { id: educationId, userId },
      select: expectedSelect,
    });
  });

  it('returns null when no record matches the id and owner', async () => {
    education.findFirst.mockResolvedValue(null);

    await expect(
      repository.findByIdAndUserId(educationId, userId),
    ).resolves.toBeNull();
  });

  it('keeps another user lookup scoped to that user', async () => {
    const otherUserId = '22222222-2222-4222-8222-222222222222';
    education.findFirst.mockResolvedValue(null);

    await expect(
      repository.findByIdAndUserId(educationId, otherUserId),
    ).resolves.toBeNull();
    expect(education.findFirst).toHaveBeenCalledWith({
      where: { id: educationId, userId: otherUserId },
      select: expectedSelect,
    });
  });

  it('creates an education attached to the authenticated user', async () => {
    const data = {
      institution: record.institution,
      degree: record.degree,
      startDate: record.startDate,
      endDate: new Date('2024-01-01'),
    };
    education.create.mockResolvedValue(record);

    await expect(repository.create(userId, data)).resolves.toEqual(record);
    expect(education.create).toHaveBeenCalledWith({
      data: { ...data, userId },
      select: expectedSelect,
    });
  });

  it('scopes updates to the owner and returns only selected fields', async () => {
    const data = { degree: 'Updated degree', endDate: new Date('2024-01-01') };
    education.updateManyAndReturn.mockResolvedValue([{ ...record, ...data }]);

    await expect(repository.update(educationId, userId, data, expectedPeriod)).resolves.toEqual(
      {
        ...record,
        ...data,
      },
    );
    expect(education.updateManyAndReturn).toHaveBeenCalledWith({
      where: { id: educationId, userId, ...expectedPeriod },
      data,
      select: expectedSelect,
    });
  });

  it('returns null when no owned record can be updated', async () => {
    education.updateManyAndReturn.mockResolvedValue([]);
    await expect(
      repository.update(educationId, userId, { degree: 'Updated' }, expectedPeriod),
    ).resolves.toBeNull();
  });

  it.each([0, 1])(
    'reports deletion using the affected row count %i',
    async (count) => {
      education.deleteMany.mockResolvedValue({ count });

      await expect(repository.delete(educationId, userId)).resolves.toBe(
        count === 1,
      );
      expect(education.deleteMany).toHaveBeenCalledWith({
        where: { id: educationId, userId },
      });
    },
  );

  it('matches non-null dates in the atomic update filter', async () => {
    const period = { startDate: record.startDate, endDate: new Date('2024-01-01') };
    education.updateManyAndReturn.mockResolvedValue([]);
    await expect(repository.update(educationId, userId, { degree: 'Updated' }, period)).resolves.toBeNull();
    expect(education.updateManyAndReturn).toHaveBeenCalledWith({
      where: { id: educationId, userId, ...period },
      data: { degree: 'Updated' },
      select: expectedSelect,
    });
  });
});
