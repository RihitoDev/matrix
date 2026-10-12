import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './use-debounced-value';

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('keeps the previous value before the delay finishes', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: {
          value: 'React',
        },
      },
    );

    rerender({
      value: 'Python',
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe('React');
  });

  it('updates the value after the delay finishes', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: {
          value: 'React',
        },
      },
    );

    rerender({
      value: 'Python',
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('Python');
  });

  it('keeps only the latest value when changes happen quickly', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: {
          value: '',
        },
      },
    );

    rerender({ value: 'R' });
    rerender({ value: 'Re' });
    rerender({ value: 'React' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('React');
  });
});