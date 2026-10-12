import { describe, expect, it } from 'vitest';
import { GetEventsSchema, MAX_SEARCH_LENGTH } from '../requests/get-events.request.js';

describe('GetEventsSchema', () => {
  it('applies default page and limit when not provided', () => {
    const parsed = GetEventsSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(10);
    expect(parsed.search).toBeUndefined();
  });

  it('trims leading and trailing whitespace from search', () => {
    const parsed = GetEventsSchema.parse({ search: '   workshop   ' });
    expect(parsed.search).toBe('workshop');
  });

  it('transforms empty string search to undefined', () => {
    const parsed = GetEventsSchema.parse({ search: '' });
    expect(parsed.search).toBeUndefined();
  });

  it('transforms whitespace-only search to undefined', () => {
    const parsed = GetEventsSchema.parse({ search: '     ' });
    expect(parsed.search).toBeUndefined();
  });

  it('accepts search string up to MAX_SEARCH_LENGTH characters', () => {
    const validSearch = 'a'.repeat(MAX_SEARCH_LENGTH);
    const parsed = GetEventsSchema.parse({ search: validSearch });
    expect(parsed.search).toBe(validSearch);
  });

  it('rejects search string exceeding MAX_SEARCH_LENGTH characters', () => {
    const invalidSearch = 'a'.repeat(MAX_SEARCH_LENGTH + 1);
    const result = GetEventsSchema.safeParse({ search: invalidSearch });
    expect(result.success).toBe(false);
  });

  it('accepts valid categoryId and statusId UUIDs', () => {
    const parsed = GetEventsSchema.parse({
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      statusId: '123e4567-e89b-12d3-a456-426614174001',
    });
    expect(parsed.categoryId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(parsed.statusId).toBe('123e4567-e89b-12d3-a456-426614174001');
  });

  it('rejects invalid UUIDs', () => {
    const result = GetEventsSchema.safeParse({ categoryId: 'invalid-uuid' });
    expect(result.success).toBe(false);
  });
  it('accepts identifiers stored by the original PostgreSQL seed', () => {
    const parsed = GetEventsSchema.parse({
      categoryId: '22222222-2222-2222-2222-222222222221',
      statusId: '22222222-2222-2222-2222-222222222224',
    });
    expect(parsed.categoryId).toBe('22222222-2222-2222-2222-222222222221');
    expect(parsed.statusId).toBe('22222222-2222-2222-2222-222222222224');
  });

});
