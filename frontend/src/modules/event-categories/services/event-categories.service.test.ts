// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/services/api-client';
import { eventCategoriesService } from './event-categories.service';
const originalBaseUrl = apiClient.defaults.baseURL;
beforeEach(() => {
  apiClient.defaults.baseURL = 'http://localhost:8080/api';
});
afterEach(() => {
  vi.restoreAllMocks();
  apiClient.defaults.baseURL = originalBaseUrl;
});
describe('eventCategoriesService', () => {
  it('reads real categories from the paginated API envelope', async () => {
    const items = [{ id: 'category-1', name: 'Tecnología' }];
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { data: { items } } });
    await expect(eventCategoriesService.getAll()).resolves.toEqual(items);
  });
  it.each([
    null,
    { data: null },
    { data: { items: null } },
    { data: { items: [{ id: '1', name: null }] } },
  ])('rejects malformed responses before rendering: %s', async (body) => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: body });
    await expect(eventCategoriesService.getAll()).rejects.toThrow(
      'La respuesta del backend no es válida.',
    );
  });
  it('does not send a request without an API URL', async () => {
    apiClient.defaults.baseURL = undefined;
    const spy = vi.spyOn(apiClient, 'get');
    await expect(eventCategoriesService.getAll()).rejects.toThrow(
      'URL del backend',
    );
    expect(spy).not.toHaveBeenCalled();
  });
});
