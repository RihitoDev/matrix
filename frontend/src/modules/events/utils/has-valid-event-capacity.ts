import type { EventItem } from '../types/event-item.types';

export function hasValidEventCapacity(
  event: Pick<EventItem, 'capacity' | 'availableSpots' | 'registrationCount'>,
): boolean {
  const { capacity, availableSpots, registrationCount } = event;

  if (!Number.isSafeInteger(registrationCount) || registrationCount < 0) {
    return false;
  }

  if (capacity === null && availableSpots === null) return true;

  return (
    capacity !== null &&
    Number.isSafeInteger(capacity) &&
    capacity >= 0 &&
    availableSpots !== null &&
    Number.isSafeInteger(availableSpots) &&
    availableSpots >= 0 &&
    availableSpots === Math.max(0, capacity - registrationCount)
  );
}
