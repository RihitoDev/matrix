import type { EventItemResponse } from './event-item-response.types.js';

export interface EventDetailResponse extends EventItemResponse {
  modality: { id: string; title: string };
}
