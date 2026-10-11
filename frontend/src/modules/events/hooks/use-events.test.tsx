import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEvents } from './use-events';
import type { EventsListResponse } from '../types/event.types';

const getEventsMock = vi.hoisted(() => vi.fn());

vi.mock('../services/events.service', () => ({
  eventsService: { getEvents: getEventsMock },
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  getEventsMock.mockReset();
});

describe('useEvents', () => {
  it('carga la primera pagina y actualiza el estado', async () => {
    const response: EventsListResponse = {
      data: [],
      page: 1,
      offset: 0,
    };
    getEventsMock.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useEvents());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getEventsMock).toHaveBeenCalledWith(
      { page: 1, limit: 50 },
      expect.any(AbortSignal),
    );
    expect(result.current.events).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it('carga pagina adicional al recibir una pagina completa', async () => {
    const firstPage: EventsListResponse = {
      data: Array.from({ length: 50 }, (_, index) => ({
        id: `event-${index}`,
      })) as EventsListResponse['data'],
      page: 1,
      offset: 0,
    };
    const secondPage: EventsListResponse = {
      data: [
        {
          ...firstPage.data[0],
          id: 'event-50',
        },
      ],
      page: 2,
      offset: 50,
    };
    getEventsMock
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    const { result } = renderHook(() => useEvents());
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.events).toHaveLength(51));

    expect(getEventsMock).toHaveBeenLastCalledWith(
      { page: 2, limit: 50 },
      expect.any(AbortSignal),
    );
    expect(result.current.hasMore).toBe(false);
  });

  it('expone error y permite volver a solicitar la primera pagina', async () => {
    getEventsMock
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValueOnce({ data: [], page: 1, offset: 0 });

    const { result } = renderHook(() => useEvents());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.error).toBeNull());

    expect(getEventsMock).toHaveBeenCalledTimes(2);
  });

  it('aborta una peticion pendiente al desmontarse', async () => {
    let requestSignal: AbortSignal | undefined;
    getEventsMock.mockImplementationOnce(
      (_params: unknown, signal: AbortSignal) => {
        requestSignal = signal;
        return new Promise(() => {});
      },
    );

    const { unmount } = renderHook(() => useEvents());
    await waitFor(() => expect(requestSignal).toBeDefined());
    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});