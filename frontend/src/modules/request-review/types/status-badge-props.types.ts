import type { ReviewStatus } from "./request-review.types";

export interface StatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}
