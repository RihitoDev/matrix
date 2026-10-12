import type {
  EventWithRelations,
  EventsListResponse,
} from '../types/events.types.js';
import { mapEventToResponse } from './event.mapper.js';

export function mapEventsToListResponse(
  records: EventWithRelations[],
  total: number,
  page: number,
  limit: number,
): EventsListResponse {
  const offset = (page - 1) * limit;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const items = records.map((record) => {
    const registrationCount = record._count.registrations;
    const availableSpots =
      record.capacity === null
        ? null
        : Math.max(0, record.capacity - registrationCount);

    return mapEventToResponse(record, availableSpots);
  });

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
