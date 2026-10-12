import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventCategoriesService } from '../services/event-categories.service.js';
import type { EventCategoryWithFields } from '../types/event-categories.types.js';

function buildRecord(overrides: Partial<EventCategoryWithFields> = {}): EventCategoryWithFields {
  return {
    id: 'cat-uuid-1',
    name: 'Tecnologia',
    ...overrides,
  };
}

describe('EventCategoriesService', () => {
  let service: EventCategoriesService;
  let repositoryMock: { findAndCount: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repositoryMock = { findAndCount: vi.fn() };
    service = new EventCategoriesService(repositoryMock as never);
  });

  it('returns formatted list with offset, totalPages and items', async () => {
    repositoryMock.findAndCount.mockResolvedValue({
      items: [buildRecord()],
      total: 1,
    });

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.offset).toBe(0);
    expect(result.data.total).toBe(1);
    expect(result.data.totalPages).toBe(1);
    expect(result.data.items[0]).toEqual({ id: 'cat-uuid-1', name: 'Tecnologia' });
  });

  it('calculates totalPages as 0 when total is 0', async () => {
    repositoryMock.findAndCount.mockResolvedValue({ items: [], total: 0 });

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data.items).toHaveLength(0);
    expect(result.data.total).toBe(0);
    expect(result.data.totalPages).toBe(0);
  });

  it('passes search, skip, and take to repository', async () => {
    repositoryMock.findAndCount.mockResolvedValue({ items: [], total: 0 });

    await service.findAll({ page: 3, limit: 5, search: 'tec' });

    expect(repositoryMock.findAndCount).toHaveBeenCalledWith({
      search: 'tec',
      skip: 10,
      take: 5,
    });
  });

  it('calculates correct offset for page 2', async () => {
    repositoryMock.findAndCount.mockResolvedValue({
      items: [buildRecord()],
      total: 25,
    });

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(result.page).toBe(2);
    expect(result.offset).toBe(10);
    expect(result.data.totalPages).toBe(3);
  });
});
