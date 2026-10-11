import type { AvailabilityBlock } from "./availability-block.types";
import type { WeekGridVariant } from "./week-grid-variant.types";

export interface WeekDayListProps {
  blocksByDay: AvailabilityBlock[][];
  dayDates: string[];
  variant: WeekGridVariant;
  selectedBlockId?: string;
  onBlockClick: (block: AvailabilityBlock) => void;
}
