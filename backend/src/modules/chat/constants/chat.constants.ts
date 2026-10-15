export const MIN_SEARCH_CHARS = 2;
export const MAX_SEARCH_QUERY_LENGTH = 100;
export const MAX_SEARCH_RESULTS = 20;

export const DEFAULT_MESSAGE_PAGE_SIZE = 20;
export const MAX_MESSAGE_PAGE_SIZE = 50;

export const DEFAULT_CONVERSATION_PAGE_SIZE = 20;
export const MAX_CONVERSATION_PAGE_SIZE = 50;

export const MAX_MESSAGE_LENGTH = 500;
export const MIN_MESSAGE_LENGTH = 1;

export const MESSAGE_STATUS_TITLES = {
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
} as const;

export type MessageStatusTitle =
  (typeof MESSAGE_STATUS_TITLES)[keyof typeof MESSAGE_STATUS_TITLES];