import type { EventCategoryResponse } from './event-category-response.types.js';

export interface EventCategoriesListDataResponse {
  items: EventCategoryResponse[];
  total: number;
  limit: number;
  totalPages: number;
}
