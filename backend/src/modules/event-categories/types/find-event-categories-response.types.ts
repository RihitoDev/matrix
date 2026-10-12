import type { EventCategoryWithFields } from './event-category-with-fields.types.js';

export interface FindEventCategoriesResponse {
  items: EventCategoryWithFields[];
  total: number;
}
