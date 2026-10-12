import type { EventItem } from './event-item.types';

export interface EventCardProps {
  event: EventItem;
  isSelected?: boolean;
  onSelect?: (event: EventItem) => void;
}
