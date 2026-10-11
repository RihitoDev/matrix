import type { EventCategoryItem } from './event-category-item.types';
export interface CategoriesResult {
  categories: EventCategoryItem[];
  error: string | null;
}
