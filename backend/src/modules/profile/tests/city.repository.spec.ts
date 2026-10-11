import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CityRepository } from '../repositories/city.repository.js';

const cityId = '22222222-2222-4222-8222-222222222222';

describe('CityRepository', () => {
  let repository: CityRepository;
  let city: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    city = { findMany: vi.fn(), findUnique: vi.fn() };
    repository = new CityRepository({ city } as unknown as PrismaService);
  });

  it('lists the cities ordered by title', async () => {
    const cities = [{ id: cityId, title: 'Cochabamba' }];
    city.findMany.mockResolvedValue(cities);

    await expect(repository.findAll()).resolves.toBe(cities);
    expect(city.findMany).toHaveBeenCalledWith({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    });
  });

  it('tells whether a city exists', async () => {
    city.findUnique.mockResolvedValueOnce({ id: cityId }).mockResolvedValueOnce(null);

    await expect(repository.exists(cityId)).resolves.toBe(true);
    await expect(repository.exists(cityId)).resolves.toBe(false);
    expect(city.findUnique).toHaveBeenCalledWith({ where: { id: cityId }, select: { id: true } });
  });
});
