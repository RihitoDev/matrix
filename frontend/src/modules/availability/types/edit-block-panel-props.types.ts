import type { AvailabilityBlock } from "./availability-block.types";

export interface EditBlockPanelProps {
  block: AvailabilityBlock | null;
  onClose: () => void;
}
