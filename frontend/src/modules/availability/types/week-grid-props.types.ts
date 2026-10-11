import type { WeekRange } from "@/shared/types/week-range.types";
import type { AvailabilityBlock } from "./availability-block.types";
import type { WeekGridVariant } from "./week-grid-variant.types";

export interface WeekGridProps {
  blocks: AvailabilityBlock[];
  weekRange: WeekRange;
  variant: WeekGridVariant;
  startHour?: number;
  endHour?: number;
  selectedBlockId?: string;
  onSelectBlock?: (block: AvailabilityBlock) => void;
  onEditBlock?: (block: AvailabilityBlock) => void;
}