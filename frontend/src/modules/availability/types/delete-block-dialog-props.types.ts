import type { AvailabilityBlock } from "./availability-block.types";

export interface DeleteBlockDialogProps {
  block: AvailabilityBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}
