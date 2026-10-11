import type {
  EventWithRelations,
  EventItemResponse,
} from '../types/events.types.js';
import { formatUtcDate, formatUtcTime } from '../utils/event-date-time.js';

export function mapEventToResponse(
  record: EventWithRelations,
  availableSpots: number | null,
): EventItemResponse {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    eventDate: formatUtcDate(record.eventDate),
    startTime: formatUtcTime(record.startTime),
    endTime: formatUtcTime(record.endTime),
    location: record.location,
    capacity: record.capacity,
    availableSpots,
    registrationCount: record._count.registrations,
    instructorName: record.instructorName ?? null,
    modalityId: record.modalityId ?? null,
    category: {
      id: record.category.id,
      name: record.category.name,
    },
    statusId: record.statusId,
  };
}
