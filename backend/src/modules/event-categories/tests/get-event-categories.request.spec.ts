import { describe, expect, it } from 'vitest';
import {
  GetEventCategoriesSchema,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../requests/get-event-categories.request.js';

describe('GetEventCategoriesSchema', () => {
  it('applies default values for page (1) and limit (10)', () => {
    const result = GetEventCategoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.search).toBeUndefined();
    }
  });

  it('coerces string page and limit into numbers', () => {
    const result = GetEventCategoriesSchema.safeParse({ page: '2', limit: '20' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it('trims search string', () => {
    const result = GetEventCategoriesSchema.safeParse({ search: '  tech  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe('tech');
    }
  });

  it('transforms empty or whitespace search into undefined', () => {
    const result = GetEventCategoriesSchema.safeParse({ search: '   ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBeUndefined();
    }
  });

  it('rejects limit greater than MAX_PAGE_SIZE', () => {
    const result = GetEventCategoriesSchema.safeParse({ limit: MAX_PAGE_SIZE + 1 });
    expect(result.success).toBe(false);
  });

  it('rejects search longer than MAX_SEARCH_LENGTH', () => {
    const result = GetEventCategoriesSchema.safeParse({
      search: 'a'.repeat(MAX_SEARCH_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = GetEventCategoriesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});
