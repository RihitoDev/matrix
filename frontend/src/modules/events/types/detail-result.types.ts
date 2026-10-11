import type { EventDetail } from './event-detail.types';
export type DetailResult = {
  id: string;
  version: number;
  event: EventDetail | null;
  error: string | null;
  notFound: boolean;
};
