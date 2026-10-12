import type { EventItem } from '../types/event-item.types';
import type { EventDetail } from '../types/event-detail.types';
import {
  readRecord,
  readString,
  readNullableString,
  readCount,
  readNullableCount,
} from './response-validation';

export function parseEventItem(value: unknown): EventItem {
  const event = readRecord(value);
  const category = readRecord(event.category);
  return {
    id: readString(event.id),
    title: readString(event.title),
    category: { id: readString(category.id), name: readString(category.name) },
    description: readNullableString(event.description),
    instructorName: readNullableString(event.instructorName),
    eventDate: readString(event.eventDate),
    startTime: readString(event.startTime),
    endTime: readString(event.endTime),
    location: readNullableString(event.location),
    capacity: readNullableCount(event.capacity),
    availableSpots: readNullableCount(event.availableSpots),
    registrationCount: readCount(event.registrationCount),
    statusId: readString(event.statusId),
    modalityId: readString(event.modalityId),
  };
}
export function parseEventDetail(value: unknown): EventDetail {
  const event = readRecord(value);
  const modality = readRecord(event.modality);
  return {
    ...parseEventItem(event),
    modality: {
      id: readString(modality.id),
      title: readString(modality.title),
    },
  };
}
