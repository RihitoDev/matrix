import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Prisma } from '../../../prisma/client.js';
import { WorkExperienceRepository } from '../repositories/work-experience.repository.js';
import type { WorkExperienceRecord } from '../types/work-experience-record.type.js';
import type { WorkExperienceWriteData } from '../types/work-experience-write-data.type.js';

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
const writeData: WorkExperienceWriteData = {
  companyName: 'Synapse Labs',
  position: 'Junior web developer',
  startDate: new Date('2025-03-01T00:00:00.000Z'),
  endDate: null,
  isCurrent: true,
  description: null,
};
const expectedSelect = {
  id: true,
  userId: true,
  position: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, title: true } },
};
const expectedPeriod = {
  startDate: new Date('2025-03-01T00:00:00.000Z'),
  endDate: null,
  isCurrent: true,
};
const expectedWhere = {
  id: workExperienceId,
  userId,
  startDate: expectedPeriod.startDate,
  endDate: null,
  isCurrent: true,
};
const expectedCompanyWrite = {
  connectOrCreate: {
    where: { title: 'Synapse Labs' },
    create: { title: 'Synapse Labs' },
  },
};

const buildPrismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Prisma error', {
    code,
    clientVersion: 'test',
  });

describe('WorkExperienceRepository', () => {
  const workExperience = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };
  let repository: WorkExperienceRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new WorkExperienceRepository({
      workExperience,
    } as unknown as PrismaService);
  });

  it('lists only the owner records with current jobs first and the most recent next', async () => {
    workExperience.findMany.mockResolvedValue([record]);

    await expect(repository.findManyByUserId(userId)).resolves.toEqual([
      record,
    ]);
    expect(workExperience.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }, { id: 'desc' }],
      select: expectedSelect,
    });
  });

  it('looks up a record using both its id and its owner', async () => {
    workExperience.findFirst.mockResolvedValue(record);

    await expect(
      repository.findByIdAndUserId(workExperienceId, userId),
    ).resolves.toEqual(record);
    expect(workExperience.findFirst).toHaveBeenCalledWith({
      where: { id: workExperienceId, userId },
      select: expectedSelect,
    });
  });

  it('returns null when no record matches the id and owner', async () => {
    workExperience.findFirst.mockResolvedValue(null);

    await expect(
      repository.findByIdAndUserId(workExperienceId, userId),
    ).resolves.toBeNull();
  });

  it('creates the record for the owner and links the company by its name', async () => {
    workExperience.create.mockResolvedValue(record);

    await expect(repository.create(userId, writeData)).resolves.toEqual(
      record,
    );
    expect(workExperience.create).toHaveBeenCalledWith({
      data: {
        position: 'Junior web developer',
        startDate: writeData.startDate,
        endDate: null,
        isCurrent: true,
        description: null,
        user: { connect: { id: userId } },
        company: expectedCompanyWrite,
      },
      select: expectedSelect,
    });
  });

  it('updates only the owner record with the period it was validated against and relinks the company', async () => {
    workExperience.update.mockResolvedValue(record);

    await expect(
      repository.update(
        workExperienceId,
        userId,
        { companyName: 'Synapse Labs', position: 'Web developer' },
        expectedPeriod,
      ),
    ).resolves.toEqual(record);
    expect(workExperience.update).toHaveBeenCalledWith({
      where: expectedWhere,
      data: { position: 'Web developer', company: expectedCompanyWrite },
      select: expectedSelect,
    });
  });

  it('keeps the company when the update does not include a company name', async () => {
    workExperience.update.mockResolvedValue(record);

    await repository.update(
      workExperienceId,
      userId,
      { isCurrent: false },
      expectedPeriod,
    );

    expect(workExperience.update).toHaveBeenCalledWith({
      where: expectedWhere,
      data: { isCurrent: false },
      select: expectedSelect,
    });
  });

  it('returns null when the record does not exist or its period changed', async () => {
    workExperience.update.mockRejectedValue(buildPrismaError('P2025'));

    await expect(
      repository.update(
        workExperienceId,
        userId,
        { position: 'Web developer' },
        expectedPeriod,
      ),
    ).resolves.toBeNull();
  });

  it('rethrows unexpected errors while updating', async () => {
    const error = buildPrismaError('P2002');
    workExperience.update.mockRejectedValue(error);

    await expect(
      repository.update(
        workExperienceId,
        userId,
        { position: 'Web developer' },
        expectedPeriod,
      ),
    ).rejects.toBe(error);
  });

  it('deletes only the owner record and reports whether it existed', async () => {
    workExperience.deleteMany.mockResolvedValueOnce({ count: 1 });
    workExperience.deleteMany.mockResolvedValueOnce({ count: 0 });

    await expect(repository.delete(workExperienceId, userId)).resolves.toBe(
      true,
    );
    await expect(repository.delete(workExperienceId, userId)).resolves.toBe(
      false,
    );
    expect(workExperience.deleteMany).toHaveBeenCalledWith({
      where: { id: workExperienceId, userId },
    });
  });
});