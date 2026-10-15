import type { InboxFilters } from "../types/inbox-filters.types";
import type { ReviewStatus } from "../types/request-review.types";

const ROOT = ["request-review"] as const;
const INBOX = [...ROOT, "inbox"] as const;

export const REQUEST_REVIEW_QUERY_KEYS = {
  all: ROOT,
  inbox: INBOX,
  list: (status: ReviewStatus, page: number, filters: InboxFilters) => [...INBOX, "list", status, page, filters] as const,
  count: (status: ReviewStatus) => [...INBOX, "count", status] as const,
  summary: [...INBOX, "summary"] as const,
  detail: (id: string) => [...ROOT, "detail", id] as const,
};
