import type { EventItemResponse } from './event-item-response.types.js';

export interface EventsListDataResponse {
  items: EventItemResponse[];
  total: number;
  limit: number;
  totalPages: number;
}
