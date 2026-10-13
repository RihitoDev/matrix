import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { EducationsRepository } from '../repositories/educations.repository.js';
import type { EducationRecord } from '../types/education-record.type.js';
import type { Prisma } from '../../../prisma/client.js';
import { DuplicateEducationException } from '../exceptions/duplicate-education.exception.js';
import { EducationWriteConflictException } from '../exceptions/education-write-conflict.exception.js';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';

const userId = '11111111-1111-4111-8111-111111111111';
const educationId = '33333333-3333-4333-8333-333333333333';
const record: EducationRecord = {
  id: educationId,
  userId,
  institution: 'Universidad Mayor de San Simon',
  degree: 'Ingeniería Informática',
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
  const transaction = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    education.findMany.mockResolvedValue([]);
    education.findFirst.mockResolvedValue(record);
    transaction.mockImplementation((operation: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
      operation({ education } as unknown as Prisma.TransactionClient));
    repository = new EducationsRepository({
      education,
      $transaction: transaction,
    } as unknown as PrismaService);
  });

  it('rejects a degree invalidated by a concurrent institution change before writing', async () => {
    education.findFirst.mockResolvedValue({ ...record, institution: 'UMSS' });
    await expect(repository.update(educationId, userId, { degree: 'Ingeniería en Inteligencia Artificial' }, expectedPeriod))
      .rejects.toBeInstanceOf(RequestValidationException);
    expect(education.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it('rejects equivalent institution names and titles despite case, accents and extra spaces', async () => {
    education.findMany.mockResolvedValue([{ institution: '  UNIVERSIDAD   MAYOR DE SAN SIMON ', degree: '  INGENIERIA   QUIMICA ' }]);
    await expect(repository.create(userId, {
      institution: 'Universidad Mayor de San Simón', degree: 'Ingeniería Química',
      startDate: record.startDate, endDate: new Date('2024-01-01'),
    })).rejects.toBeInstanceOf(DuplicateEducationException);
    expect(education.create).not.toHaveBeenCalled();
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'Serializable' });
    expect(education.findMany).toHaveBeenCalledWith({
      where: { userId, startDate: record.startDate, endDate: new Date('2024-01-01') },
      select: { institution: true, degree: true },
    });
  });

  it('rejects an edit that becomes another record, excluding only the edited ID', async () => {
    education.findMany.mockResolvedValue([{ institution: record.institution, degree: 'Ingeniería Civil' }]);
    await expect(repository.update(educationId, userId, { degree: 'Ingeniería Civil' }, expectedPeriod))
      .rejects.toBeInstanceOf(DuplicateEducationException);
    expect(education.updateManyAndReturn).not.toHaveBeenCalled();
    expect(education.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId, startDate: record.startDate, endDate: null, id: { not: educationId } },
    }));
  });

  it('does not overwrite a newer period after retrying a transaction conflict', async () => {
    transaction.mockRejectedValueOnce({ code: 'P2034' });
    education.findFirst.mockResolvedValue(null);
    await expect(repository.update(educationId, userId, { degree: 'Ingeniería Industrial' }, expectedPeriod)).resolves.toBeNull();
    expect(transaction).toHaveBeenCalledTimes(2);
    expect(education.create).not.toHaveBeenCalled();
    expect(education.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it.each(['UMSS', 'universidad mayor de san simon', 'Universidad Mayor de San Simón (UMSS)'])('keeps duplicate protection for legacy alias %s on create and edit', async (institution) => {
    education.findMany.mockResolvedValue([{ institution, degree: record.degree }]);
    const data = { institution: 'Universidad Mayor de San Simón (UMSS)', degree: record.degree };
    await expect(repository.create(userId, { ...data, startDate: record.startDate, endDate: new Date('2024-01-01') }))
      .rejects.toBeInstanceOf(DuplicateEducationException);
    await expect(repository.update(educationId, userId, data, expectedPeriod)).rejects.toBeInstanceOf(DuplicateEducationException);
    expect(education.create).not.toHaveBeenCalled();
    expect(education.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it('rechecks for duplicates after a serializable conflict instead of repeating just the write', async () => {
    transaction.mockRejectedValueOnce({ code: 'P2034' });
    education.findMany.mockResolvedValue([{ institution: record.institution, degree: record.degree }]);
    await expect(repository.create(userId, { ...record, endDate: new Date('2024-01-01') }))
      .rejects.toBeInstanceOf(DuplicateEducationException);
    expect(transaction).toHaveBeenCalledTimes(2);
    expect(education.create).not.toHaveBeenCalled();
  });

  it('bounds transaction retries and propagates unrelated database errors', async () => {
    transaction.mockRejectedValue({ code: 'P2034' });
    await expect(repository.create(userId, { ...record, endDate: new Date('2024-01-01') }))
      .rejects.toBeInstanceOf(EducationWriteConflictException);
    expect(transaction).toHaveBeenCalledTimes(3);
    transaction.mockClear();
    const error = new Error('Connection unavailable');
    transaction.mockRejectedValue(error);
    await expect(repository.create(userId, { ...record, endDate: new Date('2024-01-01') })).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledOnce();
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
    const data = { degree: 'Ingeniería Química', endDate: new Date('2024-01-01') };
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
      repository.update(educationId, userId, { degree: 'Ingeniería Industrial' }, expectedPeriod),
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
    await expect(repository.update(educationId, userId, { degree: 'Ingeniería Industrial' }, period)).resolves.toBeNull();
    expect(education.updateManyAndReturn).toHaveBeenCalledWith({
      where: { id: educationId, userId, ...period },
      data: { degree: 'Ingeniería Industrial' },
      select: expectedSelect,
    });
  });
});
