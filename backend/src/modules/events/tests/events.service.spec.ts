import { EventNotFoundException } from '../exceptions/event-not-found.exception.js';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventsService } from '../services/events.service.js';
import type { EventWithRelations } from '../types/events.types.js';

function buildRecord(): EventWithRelations {
  return {
    id: 'uuid-1',
    title: 'Evento',
    description: null,
    eventDate: new Date('2026-06-15T00:00:00.000Z'),
    startTime: new Date('1970-01-01T10:00:00.000Z'),
    endTime: new Date('1970-01-01T12:00:00.000Z'),
    location: null,
    capacity: 10,
    statusId: 'status-1',
    instructorName: null,
    modalityId: 'modality-1',
    category: { id: 'cat-1', name: 'Tecnologia' },
    _count: { registrations: 3 },
  };
}

describe('EventsService', () => {
  let service: EventsService;
  let repositoryMock: {
    findAndCount: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repositoryMock = { findAndCount: vi.fn(), findById: vi.fn() };
    service = new EventsService(repositoryMock as never);
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
    expect(result.data.items[0].availableSpots).toBe(7);
    expect(result.data.items[0].registrationCount).toBe(3);
  });

  it('calculates totalPages as 0 when total is 0', async () => {
    repositoryMock.findAndCount.mockResolvedValue({
      items: [],
      total: 0,
    });

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data.items).toHaveLength(0);
    expect(result.data.total).toBe(0);
    expect(result.data.totalPages).toBe(0);
  });

  it('passes search, categoryId, statusId, skip and take to repository', async () => {
    repositoryMock.findAndCount.mockResolvedValue({ items: [], total: 0 });

    await service.findAll({
      page: 3,
      limit: 5,
      categoryId: 'cat-uuid',
      statusId: 'status-uuid',
      search: 'workshop',
    });

    expect(repositoryMock.findAndCount).toHaveBeenCalledWith({
      categoryId: 'cat-uuid',
      statusId: 'status-uuid',
      isPublishedOnly: false,
      search: 'workshop',
      skip: 10,
      take: 5,
    });
  });

  it('calculates correct offset and totalPages when search and categoryId are provided', async () => {
    repositoryMock.findAndCount.mockResolvedValue({
      items: [buildRecord()],
      total: 25,
    });

    const result = await service.findAll({
      page: 2,
      limit: 10,
      search: 'Node',
      categoryId: 'cat-uuid',
    });

    expect(result.page).toBe(2);
    expect(result.offset).toBe(10);
    expect(result.data.total).toBe(25);
    expect(result.data.totalPages).toBe(3);
    expect(repositoryMock.findAndCount).toHaveBeenCalledWith({
      categoryId: 'cat-uuid',
      statusId: undefined,
      isPublishedOnly: true,
      search: 'Node',
      skip: 10,
      take: 10,
    });
  });
  it.each([10, 3, 0, null])(
    'normalizes detail and capacity %s',
    async (capacity) => {
      repositoryMock.findById.mockResolvedValue({
        ...buildRecord(),
        capacity,
        modality: { id: 'modality-1', title: 'Presencial' },
      });
      const detail = await service.findOne('uuid-1');
      expect(detail.eventDate).toBe('2026-06-15');
      expect(detail.startTime).toBe('10:00');
      expect(detail.registrationCount).toBe(3);
      expect(detail.availableSpots).toBe(
        capacity === null ? null : Math.max(0, capacity - 3),
      );
      expect(detail.modality.title).toBe('Presencial');
      expect(detail).not.toHaveProperty('_count');
    },
  );

  it('returns 404 for a missing workshop', async () => {
    repositoryMock.findById.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      EventNotFoundException,
    );
  });
});
