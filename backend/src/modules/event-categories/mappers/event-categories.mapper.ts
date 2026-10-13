import type {
  EventCategoryWithFields,
  EventCategoriesListResponse,
} from '../types/event-categories.types.js';

export function mapEventCategoriesToListResponse(
  records: EventCategoryWithFields[],
  total: number,
  page: number,
  limit: number,
): EventCategoriesListResponse {
  const offset = (page - 1) * limit;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const items = records.map((record) => ({
    id: record.id,
    name: record.name,
  }));

  return {
    data: {
      items,
      total,
      limit,
      totalPages,
    },
    page,
    offset,
  };
}
