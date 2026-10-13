export const REPORTS_QUERY_KEYS = {
  all: ["reports"] as const,
  rejectedUsers: (page: number, search: string) => ["reports", "rejected-users", page, search] as const,
};
