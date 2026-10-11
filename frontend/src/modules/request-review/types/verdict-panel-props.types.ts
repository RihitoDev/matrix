import type { ReviewDetail, ReviewStatus } from "./request-review.types";

export interface VerdictPanelProps {
  detail: ReviewDetail;
  status: ReviewStatus;
  onStatusChange: (status: ReviewStatus) => void;
}
