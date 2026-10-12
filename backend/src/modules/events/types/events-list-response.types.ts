import type { EventsListDataResponse } from './events-list-data-response.types.js';

export interface EventsListResponse {
  data: EventsListDataResponse;
  page: number;
  offset: number;
}
