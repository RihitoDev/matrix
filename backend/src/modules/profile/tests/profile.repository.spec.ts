import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ProfileRepository } from '../repositories/profile.repository.js';

const recordNotFoundError = new Prisma.PrismaClientKnownRequestError('Record not found', {
  code: 'P2025',
  clientVersion: 'test',
});

const userId = '11111111-1111-4111-8111-111111111111';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    user = { findUnique: vi.fn(), update: vi.fn() };
    repository = new ProfileRepository({ user } as unknown as PrismaService);
  });

  it('reads only the profile columns of the user with the city', async () => {
    user.findUnique.mockResolvedValue(null);

    await repository.findByUserId(userId);

    expect(user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        personalEmail: true,
        phone: true,
        headline: true,
        aboutMe: true,
        updatedAt: true,
        city: { select: { id: true, title: true } },
      },
    });
  });

  it('never selects the password or the file columns', async () => {
    user.findUnique.mockResolvedValue(null);

    await repository.findByUserId(userId);

    const [{ select }] = user.findUnique.mock.calls[0] as [{ select: object }];
    expect(select).not.toHaveProperty('password');
    expect(select).not.toHaveProperty('photoUrl');
    expect(select).not.toHaveProperty('cvPdfUrl');
  });

  it('returns the record found', async () => {
    const record = { id: userId, firstName: 'Valeria' };
    user.findUnique.mockResolvedValue(record);

    await expect(repository.findByUserId(userId)).resolves.toBe(record);
  });

  it('returns null when the user does not exist', async () => {
    user.findUnique.mockResolvedValue(null);

    await expect(repository.findByUserId(userId)).resolves.toBeNull();
  });

  it('updates the user and returns only the profile columns', async () => {
    const data = { headline: 'Junior web developer', aboutMe: 'Graduate.' };
    const record = { id: userId, ...data };
    user.update.mockResolvedValue(record);

    await expect(repository.update(userId, data)).resolves.toBe(record);

    const [args] = user.update.mock.calls[0] as [{ where: object; data: object; select: object }];
    expect(args.where).toEqual({ id: userId });
    expect(args.data).toBe(data);
    expect(args.select).not.toHaveProperty('password');
  });

  it('fails with a domain exception when the user to update does not exist', async () => {
    user.update.mockRejectedValue(recordNotFoundError);

    await expect(
      repository.update(userId, { headline: 'Junior web developer', aboutMe: 'Graduate.' }),
    ).rejects.toBeInstanceOf(ProfileNotFoundException);
  });
});
