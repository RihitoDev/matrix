import type { EventCategoryItem } from './event-category-item.types';

export interface CategoryFilterChipsProps {
  categories: EventCategoryItem[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}
