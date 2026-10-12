export type InboxPeriod = "7d" | "30d" | "all";

export interface InboxFilters {
  search?: string;
  career?: string;
  period?: InboxPeriod;
}
