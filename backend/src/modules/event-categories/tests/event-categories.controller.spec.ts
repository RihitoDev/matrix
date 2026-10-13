import { describe, expect, it, vi } from 'vitest';
import { EventCategoriesController } from '../controllers/event-categories.controller.js';
import type { EventCategoriesService } from '../services/event-categories.service.js';

describe('EventCategoriesController', () => {
  it('delegates findAll to EventCategoriesService with query params', async () => {
    const expectedResult = {
      data: {
        items: [{ id: 'cat-1', name: 'Tecnologia' }],
        total: 1,
        limit: 10,
        totalPages: 1,
      },
      page: 1,
      offset: 0,
    };

    const findAll = vi.fn().mockResolvedValue(expectedResult);
    const serviceMock = {
      findAll,
    } as unknown as EventCategoriesService;

    const controller = new EventCategoriesController(serviceMock);
    const query = { page: 1, limit: 10, search: 'Tec' };

    const result = await controller.findAll(query);

    expect(findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(expectedResult);
  });
});
