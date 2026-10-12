import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventsRepository } from '../repositories/events.repository.js';

describe('EventsRepository', () => {
  let repository: EventsRepository;
  let prismaMock: {
    event: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      event: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };
    repository = new EventsRepository(prismaMock as never);
  });

  it('calls findMany and count with empty where when no filters are provided', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    const result = await repository.findAndCount({ skip: 10, take: 5 });

    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 10, take: 5 }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('applies published status filter when isPublishedOnly is true and statusId is undefined', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ isPublishedOnly: true, skip: 0, take: 10 });

    const expectedWhere = {
      status: { title: 'Publicado' },
    };

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('applies only search filter with case-insensitive partial match to where', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ search: 'Tech', skip: 0, take: 10 });

    const expectedWhere = {
      title: {
        contains: 'Tech',
        mode: 'insensitive',
      },
    };

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('escapes wildcards percent (%) and underscore (_) in search', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ search: '100%_test', skip: 0, take: 10 });

    const expectedWhere = {
      title: {
        contains: '100\\%\\_test',
        mode: 'insensitive',
      },
    };

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
  });

  it('applies categoryId filter to where in both queries', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ categoryId: 'cat-abc', skip: 0, take: 10 });

    const expectedWhere = { categoryId: 'cat-abc' };
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('applies statusId filter to where in both queries', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ statusId: 'status-abc', skip: 0, take: 10 });

    const expectedWhere = { statusId: 'status-abc' };
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('combines search and categoryId with AND in where clause', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ search: 'workshop', categoryId: 'cat-123', skip: 0, take: 10 });

    const expectedWhere = {
      categoryId: 'cat-123',
      title: {
        contains: 'workshop',
        mode: 'insensitive',
      },
    };

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('combines search, categoryId, and statusId in where clause', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({
      search: 'workshop',
      categoryId: 'cat-123',
      statusId: 'status-456',
      skip: 0,
      take: 10,
    });

    const expectedWhere = {
      categoryId: 'cat-123',
      statusId: 'status-456',
      title: {
        contains: 'workshop',
        mode: 'insensitive',
      },
    };

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prismaMock.event.count).toHaveBeenCalledWith({ where: expectedWhere });
  });

  it('orders by eventDate asc and startTime asc', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await repository.findAndCount({ skip: 0, take: 10 });

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
      }),
    );
  });
  it('counts only confirmed registrations that have not been cancelled', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);
    await repository.findAndCount({ isPublishedOnly: true, skip: 0, take: 10 });
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({
        _count: { select: { registrations: { where: { cancelledAt: null, status: { title: 'Confirmada' } } } } },
      }),
    }));
  });

});
