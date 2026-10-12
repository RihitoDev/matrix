import type { EventItem } from './event-item.types';
export interface EventDetail extends EventItem {
  modality: { id: string; title: string };
}
