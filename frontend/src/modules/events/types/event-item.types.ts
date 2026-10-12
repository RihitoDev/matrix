import type { EventCategoryItem } from '../../event-categories/types/event-category-item.types';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategoryItem;
  description: string | null;
  instructorName: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string | null;
  capacity: number | null;
  availableSpots: number | null;
  registrationCount: number;
  statusId: string;
  modalityId: string;
}
