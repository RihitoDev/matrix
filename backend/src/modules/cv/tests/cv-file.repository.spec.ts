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
  let user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    user = {
      findUnique: vi.fn(),
      update: vi.fn(),
    };
    repository = new CvFileRepository({ user } as unknown as PrismaService);
  });

  it('saves the cv bytes on the user without returning the user data', async () => {
    user.update.mockResolvedValue({ id: userId });

    await expect(repository.save(userId, content)).resolves.toBeUndefined();
    expect(user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { cvPdfUrl: new Uint8Array(content) },
      select: { id: true },
    });
  });

  it('reads only the cv column and returns it as a buffer', async () => {
    user.findUnique.mockResolvedValue({ cvPdfUrl: new Uint8Array(content) });

    const result = await repository.read(userId);

    expect(user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { cvPdfUrl: true },
    });
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(content);
  });

  it('returns null when the user has no cv', async () => {
    user.findUnique.mockResolvedValue({ cvPdfUrl: null });

    await expect(repository.read(userId)).resolves.toBeNull();
  });

  it('returns null when the user does not exist', async () => {
    user.findUnique.mockResolvedValue(null);

    await expect(repository.read(userId)).resolves.toBeNull();
  });

  it('removes the cv by clearing the column', async () => {
    user.update.mockResolvedValue({ id: userId });

    await expect(repository.remove(userId)).resolves.toBeUndefined();
    expect(user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { cvPdfUrl: null },
      select: { id: true },
    });
  });

  it('fails with a domain exception when the user does not exist', async () => {
    user.update.mockRejectedValue(recordNotFoundError);

    await expect(repository.save(userId, content)).rejects.toBeInstanceOf(
      ProfileNotFoundException,
    );
    await expect(repository.remove(userId)).rejects.toBeInstanceOf(ProfileNotFoundException);
  });
});
