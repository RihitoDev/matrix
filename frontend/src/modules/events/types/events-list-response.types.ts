import type { EventItem } from './event-item.types';

export interface EventsListResponse {
  data: EventItem[];
  page: number;
  offset: number;
}
