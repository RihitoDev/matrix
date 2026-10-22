import type { REJECTION_REASONS } from "@/modules/request-review";

export type RejectionReason = (typeof REJECTION_REASONS)[number];
