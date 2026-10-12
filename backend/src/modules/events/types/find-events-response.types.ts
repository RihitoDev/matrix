import type { EventWithRelations } from './event-with-relations.types.js';

export interface FindEventsResponse {
  items: EventWithRelations[];
  total: number;
}
