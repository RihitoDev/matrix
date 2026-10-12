import {
  readRecord,
  readArray,
  readString,
} from '../../events/utils/response-validation';
import type { EventCategoryItem } from '../types/event-category-item.types';
import { apiClient } from '@/shared/services/api-client';

import { REQUEST_TIMEOUT_MS } from '../../events/constants/events.constants';

export const eventCategoriesService = {
  async getAll(): Promise<EventCategoryItem[]> {
    if (!apiClient.defaults.baseURL) {
      throw new Error('La URL del backend no está configurada.');
    }

    const response = await apiClient.get<{
      data: { items: EventCategoryItem[] };
    }>('/event-categories', {
      params: { page: 1, limit: 50 },
      timeout: REQUEST_TIMEOUT_MS,
    });

    return readArray(readRecord(readRecord(response.data).data).items).map(
      (value) => {
        const category = readRecord(value);
        return { id: readString(category.id), name: readString(category.name) };
      },
    );
  },
};
