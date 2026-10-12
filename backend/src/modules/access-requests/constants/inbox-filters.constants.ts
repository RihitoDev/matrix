export const INBOX_PERIODS = ['7d', '30d', 'all'] as const;

export const DEFAULT_INBOX_PERIOD = 'all';

export const INBOX_PERIOD_DAYS: Record<string, number | undefined> = { '7d': 7, '30d': 30 };

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 100;
export const MAX_SEARCH_TERMS = 5;
