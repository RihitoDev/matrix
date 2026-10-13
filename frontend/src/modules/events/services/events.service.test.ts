// @vitest-environment node
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/services/api-client';
import { eventsService } from './events.service';
import type { EventsListResponse } from '../types/event.types';

const MOCK_RESPONSE: EventsListResponse = {
  data: [],
  page: 1,
  offset: 0,
};

const originalBaseUrl = apiClient.defaults.baseURL;

describe('eventsService', () => {
  beforeEach(() => {
    apiClient.defaults.baseURL = 'http://localhost:8080/api';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    apiClient.defaults.baseURL = originalBaseUrl;
  });

  it('consulta GET /events con paginacion y devuelve el DTO del backend', async () => {
    const response = {
      data: {
        statusCode: 200,
        ok: true,
        detail: 'Operación exitosa',
        data: { items: MOCK_RESPONSE.data, total: 0, limit: 50, totalPages: 0 },
        page: MOCK_RESPONSE.page,
        offset: MOCK_RESPONSE.offset,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as unknown as AxiosResponse<EventsListResponse>;
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(response);
    const abortController = new AbortController();

    await expect(
      eventsService.getEvents({ page: 1, limit: 50 }, abortController.signal),
    ).resolves.toEqual(MOCK_RESPONSE);
    expect(getSpy).toHaveBeenCalledWith('/events', {
      params: { page: 1, limit: 50 },
      signal: abortController.signal,
      timeout: 10_000,
    });
  });

  it('falla claramente si falta configurar la URL del backend', async () => {
    apiClient.defaults.baseURL = undefined;

    await expect(
      eventsService.getEvents({ page: 1, limit: 50 }),
    ).rejects.toThrow('La URL del backend no está configurada.');
  });
  it('consults the detail endpoint with cancellation and returns the response data', async () => {
    const detail = {
      id: 'event-1',
      title: 'React',
      category: { id: 'cat-1', name: 'Tecnología' },
      description: null,
      instructorName: null,
      eventDate: '2026-10-20',
      startTime: '09:00',
      endTime: '12:00',
      location: null,
      capacity: 30,
      availableSpots: 20,
      registrationCount: 10,
      statusId: 'published',
      modalityId: 'm1',
      modality: { id: 'm1', title: 'Presencial' },
    };
    const spy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: { data: detail } });
    const signal = new AbortController().signal;
    await expect(eventsService.getEvent('event-1', signal)).resolves.toEqual(
      detail,
    );
    expect(spy).toHaveBeenCalledWith('/events/event-1', {
      signal,
      timeout: 10000,
    });
  });

  it('rejects detail requests when the backend URL is absent', async () => {
    apiClient.defaults.baseURL = undefined;
    await expect(eventsService.getEvent('event-1')).rejects.toThrow(
      'URL del backend',
    );
  });
});
