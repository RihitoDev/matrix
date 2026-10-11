import type { ReviewStatus } from "./request-review.types";

export type StatusCounts = Partial<Record<ReviewStatus, number>>;
