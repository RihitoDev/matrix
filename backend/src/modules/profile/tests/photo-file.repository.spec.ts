import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { PhotoFileRepository } from '../repositories/photo-file.repository.js';

const recordNotFoundError = new Prisma.PrismaClientKnownRequestError('Record not found', {
  code: 'P2025',
  clientVersion: 'test',
});

const userId = '11111111-1111-4111-8111-111111111111';
const content = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

describe('PhotoFileRepository', () => {
  let repository: PhotoFileRepository;
  let user: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    user = { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() };
    repository = new PhotoFileRepository({ user } as unknown as PrismaService);
  });

  it('saves the photo bytes on the user without returning the user data', async () => {
    await repository.save(userId, content);

    expect(user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { photoUrl: new Uint8Array(content) },
      select: { id: true },
    });
  });

  it('reads only the photo column and returns it as a buffer', async () => {
    user.findUnique.mockResolvedValue({ photoUrl: new Uint8Array(content) });

    const result = await repository.read(userId);

    expect(user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { photoUrl: true },
    });
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(content);
  });

  it('returns null when the user has no photo', async () => {
    user.findUnique.mockResolvedValue({ photoUrl: null });

    await expect(repository.read(userId)).resolves.toBeNull();
  });

  it('checks the photo without loading its bytes', async () => {
    user.findFirst.mockResolvedValueOnce({ id: userId }).mockResolvedValueOnce(null);

    await expect(repository.exists(userId)).resolves.toBe(true);
    await expect(repository.exists(userId)).resolves.toBe(false);
    expect(user.findFirst).toHaveBeenCalledWith({
      where: { id: userId, photoUrl: { not: null } },
      select: { id: true },
    });
  });

  it('removes the photo', async () => {
    await repository.remove(userId);

    expect(user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { photoUrl: null },
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
