import type { ReviewListItem } from "./request-review.types";

export interface RequestTableProps {
  items?: ReviewListItem[];
  isLoading?: boolean;
}
