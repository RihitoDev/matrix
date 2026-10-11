import type { ReviewDetail } from "./request-review.types";

export interface RejectDialogProps {
  detail: ReviewDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: (notificationSent: boolean) => void;
}
