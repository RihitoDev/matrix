import type { REJECTION_REASONS } from "@/modules/request-review/constants/request-review.constants";

export type RejectionReason = (typeof REJECTION_REASONS)[number];
