import { describe, expect, it } from 'vitest';
import { mapEventCategoriesToListResponse } from '../mappers/event-categories.mapper.js';
import type { EventCategoryWithFields } from '../types/event-categories.types.js';

function buildRecord(overrides: Partial<EventCategoryWithFields> = {}): EventCategoryWithFields {
  return {
    id: 'cat-uuid-1',
    name: 'Tecnologia',
    ...overrides,
  };
}

describe('mapEventCategoriesToListResponse', () => {
  it('returns items mapped with id and name', () => {
    const records = [buildRecord(), buildRecord({ id: 'cat-uuid-2', name: 'Negocios' })];
    const result = mapEventCategoriesToListResponse(records, 2, 1, 10);

    expect(result.data.items).toEqual([
      { id: 'cat-uuid-1', name: 'Tecnologia' },
      { id: 'cat-uuid-2', name: 'Negocios' },
    ]);
    expect(result.data.total).toBe(2);
    expect(result.data.limit).toBe(10);
    expect(result.data.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('calculates offset and totalPages correctly for page 2', () => {
    const records = [buildRecord()];
    const result = mapEventCategoriesToListResponse(records, 25, 3, 10);

    expect(result.offset).toBe(20);
    expect(result.page).toBe(3);
    expect(result.data.totalPages).toBe(3);
  });

  it('returns totalPages as 0 when total is 0', () => {
    const result = mapEventCategoriesToListResponse([], 0, 1, 10);

    expect(result.data.totalPages).toBe(0);
    expect(result.data.total).toBe(0);
    expect(result.data.items).toHaveLength(0);
  });

  it('returns an empty items array when records is empty', () => {
    const result = mapEventCategoriesToListResponse([], 0, 1, 10);
    expect(result.data.items).toEqual([]);
  });
});
