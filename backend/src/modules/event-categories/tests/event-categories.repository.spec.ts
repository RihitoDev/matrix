import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventCategoriesRepository } from '../repositories/event-categories.repository.js';

describe('EventCategoriesRepository', () => {
  let repository: EventCategoriesRepository;
  let prismaMock: {
    eventCategory: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      eventCategory: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };
    repository = new EventCategoriesRepository(prismaMock as never);
  });

  it('calls findMany and count with empty where when no search is provided', async () => {
    prismaMock.eventCategory.findMany.mockResolvedValue([]);
    prismaMock.eventCategory.count.mockResolvedValue(0);

    const result = await repository.findAndCount({ skip: 0, take: 10 });

    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(prismaMock.eventCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 0, take: 10 }),
    );
    expect(prismaMock.eventCategory.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('applies case-insensitive search on name when search is provided', async () => {
    prismaMock.eventCategory.findMany.mockResolvedValue([]);
    prismaMock.eventCategory.count.mockResolvedValue(0);

    await repository.findAndCount({ search: 'tec', skip: 0, take: 10 });

    const expectedWhere = {
      name: { contains: 'tec', mode: 'insensitive' },
    };
    expect(prismaMock.eventCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.eventCategory.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('escapes wildcards in category search parameter', async () => {
    prismaMock.eventCategory.findMany.mockResolvedValue([]);
    prismaMock.eventCategory.count.mockResolvedValue(0);

    await repository.findAndCount({ search: 'IA_%', skip: 0, take: 10 });

    const expectedWhere = {
      name: { contains: 'IA\\_\\%', mode: 'insensitive' },
    };
    expect(prismaMock.eventCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
  });

  it('applies skip and take correctly for pagination', async () => {
    prismaMock.eventCategory.findMany.mockResolvedValue([]);
    prismaMock.eventCategory.count.mockResolvedValue(0);

    await repository.findAndCount({ skip: 20, take: 5 });

    expect(prismaMock.eventCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 5 }),
    );
  });

  it('orders by createdAt asc then id asc', async () => {
    prismaMock.eventCategory.findMany.mockResolvedValue([]);
    prismaMock.eventCategory.count.mockResolvedValue(0);

    await repository.findAndCount({ skip: 0, take: 10 });

    expect(prismaMock.eventCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('returns items and total from $transaction result', async () => {
    const fakeItems = [{ id: 'cat-1', name: 'Tecnologia' }];
    prismaMock.eventCategory.findMany.mockResolvedValue(fakeItems);
    prismaMock.eventCategory.count.mockResolvedValue(1);

    const result = await repository.findAndCount({ skip: 0, take: 10 });

    expect(result.items).toEqual(fakeItems);
    expect(result.total).toBe(1);
  });
});
