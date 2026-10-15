import type { ReviewApiResult } from "../types/request-review.types";

export function unwrapReviewResult<T>(result: ReviewApiResult<T>): T {
  if (!result.ok) throw new Error(result.message);
  return result.data;
}
