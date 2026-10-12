import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useEventsFilters } from './use-events-filters';

afterEach(() => {
  vi.useRealTimers();
});

describe('useEventsFilters', () => {
  it('starts with empty search and no category selected', () => {
    const { result } = renderHook(() => useEventsFilters());

    expect(result.current.searchInput).toBe('');
    expect(result.current.categoryId).toBeNull();

    expect(result.current.filters).toEqual({
      search: '',
      categoryId: null,
    });
  });

  it('updates the selected category immediately', () => {
    const { result } = renderHook(() => useEventsFilters());

    act(() => {
      result.current.setCategoryId('category-1');
    });

    expect(result.current.categoryId).toBe('category-1');
    expect(result.current.filters.categoryId).toBe('category-1');
  });

  it('updates the search filter after the debounce delay', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useEventsFilters());

    act(() => {
      result.current.setSearchInput('React');
    });

    expect(result.current.searchInput).toBe('React');
    expect(result.current.filters.search).toBe('');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.filters.search).toBe('React');
  });
});