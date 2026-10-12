import type { InboxSummary } from "./inbox-summary.types";

export interface SummaryCardsProps {
  summary: InboxSummary | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}
