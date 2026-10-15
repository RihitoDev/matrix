import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { ProfileNotFoundException } from '../../profile/exceptions/profile-not-found.exception.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CvFileRepository } from '../repositories/cv-file.repository.js';

const recordNotFoundError = new Prisma.PrismaClientKnownRequestError('Record not found', {
  code: 'P2025',
  clientVersion: 'test',
});

const userId = '11111111-1111-4111-8111-111111111111';
const content = Buffer.from([0x25, 0x50, 0x44, 0x46]);

describe('CvFileRepository', () => {
  let repository: CvFileRepository;
  let userCvFile: {
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    userCvFile = {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    };
    repository = new CvFileRepository({ userCvFile } as unknown as PrismaService);
  });

  it('upserts the cv as base64 with its file name and a fresh upload date', async () => {
    userCvFile.upsert.mockResolvedValue({ id: 'cv-id' });
    const before = Date.now();

    await expect(repository.save(userId, content, 'resume.pdf')).resolves.toBeUndefined();

    const [args] = userCvFile.upsert.mock.calls[0] as [
      {
        where: object;
        create: { userId: string; cvUploadedAt: Date };
        update: { cvUploadedAt: Date };
        select: object;
      },
    ];
    expect(args.where).toEqual({ userId });
    expect(args.select).toEqual({ id: true });
    expect(args.create).toMatchObject({
      userId,
      cvFileName: 'resume.pdf',
      cvPdfData: content.toString('base64'),
    });
    expect(args.update).toMatchObject({
      cvFileName: 'resume.pdf',
      cvPdfData: content.toString('base64'),
    });
    expect(args.create.cvUploadedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(args.update.cvUploadedAt).toBeInstanceOf(Date);
  });

  it('stores a null file name when none is given', async () => {
    userCvFile.upsert.mockResolvedValue({ id: 'cv-id' });

    await repository.save(userId, content);

    const [args] = userCvFile.upsert.mock.calls[0] as [{ update: { cvFileName: null } }];
    expect(args.update.cvFileName).toBeNull();
  });

  it('reads only the pdf column and returns it decoded as a buffer', async () => {
    userCvFile.findUnique.mockResolvedValue({ cvPdfData: content.toString('base64') });

    const result = await repository.read(userId);

    expect(userCvFile.findUnique).toHaveBeenCalledWith({
      where: { userId },
      select: { cvPdfData: true },
    });
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(content);
  });

  it('returns null when the cv has no data', async () => {
    userCvFile.findUnique.mockResolvedValue({ cvPdfData: null });

    await expect(repository.read(userId)).resolves.toBeNull();
  });

  it('returns null when the user has no cv row', async () => {
    userCvFile.findUnique.mockResolvedValue(null);

    await expect(repository.read(userId)).resolves.toBeNull();
  });

  it('removes the cv row of the user', async () => {
    userCvFile.delete.mockResolvedValue({ id: 'cv-id' });

    await expect(repository.remove(userId)).resolves.toBeUndefined();
    expect(userCvFile.delete).toHaveBeenCalledWith({
      where: { userId },
      select: { id: true },
    });
  });

  it('fails with a domain exception when there is no cv to remove', async () => {
    userCvFile.delete.mockRejectedValue(recordNotFoundError);

    await expect(repository.remove(userId)).rejects.toBeInstanceOf(ProfileNotFoundException);
  });
});
