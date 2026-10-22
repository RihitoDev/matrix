import type { EventCategoryItem } from '@/modules/event-categories';

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
