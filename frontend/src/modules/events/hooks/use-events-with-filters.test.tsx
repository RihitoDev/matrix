import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

import { useEvents } from './use-events';
import { eventsService } from '../services/events.service';

import type {
  EventItem,
  EventsListResponse,
} from '../types/event.types';

vi.mock('../services/events.service', () => ({
  eventsService: {
    getEvents: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const buildListResponse = (
  items: EventItem[] = [],
  page = 1,
  offset = 0,
): EventsListResponse => ({
  data: items,
  page,
  offset,
});

describe('useEvents with filters', () => {
  it('sends search and categoryId when filters are provided', async () => {
    vi.mocked(eventsService.getEvents).mockResolvedValue(
      buildListResponse(),
    );

    renderHook(() =>
      useEvents({
        search: 'React',
        categoryId: 'category-1',
      }),
    );

    await waitFor(() => {
      expect(eventsService.getEvents).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 50,
          search: 'React',
          categoryId: 'category-1',
        },
        expect.any(AbortSignal),
      );
    });
  });

  it('does not send empty filters', async () => {
    vi.mocked(eventsService.getEvents).mockResolvedValue(
      buildListResponse(),
    );

    renderHook(() =>
      useEvents({
        search: '',
        categoryId: null,
      }),
    );

    await waitFor(() => {
      expect(eventsService.getEvents).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 50,
        },
        expect.any(AbortSignal),
      );
    });
  });

  it('requests events again when filters change', async () => {
    vi.mocked(eventsService.getEvents).mockResolvedValue(
      buildListResponse(),
    );

    const { rerender } = renderHook(
      ({ search, categoryId }) =>
        useEvents({
          search,
          categoryId,
        }),
      {
        initialProps: {
          search: '',
          categoryId: null as string | null,
        },
      },
    );

    await waitFor(() => {
      expect(eventsService.getEvents).toHaveBeenCalledTimes(1);
    });

    rerender({
      search: 'Python',
      categoryId: 'category-2',
    });

    await waitFor(() => {
      expect(eventsService.getEvents).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 50,
          search: 'Python',
          categoryId: 'category-2',
        },
        expect.any(AbortSignal),
      );
    });
  });

  it('resets pagination to page 1 when filters change', async () => {
    const eventItems: EventItem[] = Array.from(
      { length: 50 },
      (_, index) => ({
        id: `event-${index}`,
        title: `Event ${index}`,
        category: {
          id: 'category-1',
          name: 'Tecnología',
        },
        description: `Description ${index}`,
        instructorName: 'Instructor Test',
        eventDate: '2026-10-04',
        startTime: '10:00',
        endTime: '12:00',
        location: 'UMSS',
        capacity: 50,
        availableSpots: 10,
        registrationCount: 40,
        statusId: 'published',
        modalityId: 'presencial',
      }),
    );

    vi.mocked(eventsService.getEvents).mockResolvedValue(
      buildListResponse(eventItems),
    );

    const { result, rerender } = renderHook(
      ({ search, categoryId }) =>
        useEvents({
          search,
          categoryId,
        }),
      {
        initialProps: {
          search: '',
          categoryId: null as string | null,
        },
      },
    );

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });

    result.current.loadMore();

    await waitFor(() => {
      expect(eventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        }),
        expect.any(AbortSignal),
      );
    });

    rerender({
      search: 'React',
      categoryId: null,
    });

    await waitFor(() => {
      expect(eventsService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          search: 'React',
        }),
        expect.any(AbortSignal),
      );
    });
  });
});