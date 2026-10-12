export interface InboxSummary {
  pendingCount: number;
  pendingOver24hCount: number;
  decidedTodayCount: number;
  approvedTodayCount: number;
  rejectedTodayCount: number;
  averageReviewHours: number | null;
  reviewTimeGoalHours: number;
  rejectedThisMonthCount: number;
  topRejectionReason: string | null;
}
