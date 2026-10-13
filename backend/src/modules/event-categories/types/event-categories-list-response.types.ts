import type { EventCategoriesListDataResponse } from './event-categories-list-data-response.types.js';

export interface EventCategoriesListResponse {
  data: EventCategoriesListDataResponse;
  page: number;
  offset: number;
}
