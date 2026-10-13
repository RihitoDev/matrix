import type { EventCategoryResponse } from '../../event-categories/types/event-category-response.types.js';

export interface EventItemResponse {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string | null;
  capacity: number | null;
  availableSpots: number | null;
  registrationCount: number;
  instructorName: string | null;
  modalityId: string | null;
  category: EventCategoryResponse;
  statusId: string;
}
