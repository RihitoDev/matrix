'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { getPaginatedMessages } from '../services/chat-api';
import { Message } from '../types/conversation.types';

const PAGE_SIZE = 10;

export interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const messagesQueryKey = (conversationId: string | null) => [
  'messages',
  conversationId,
];

export function useMessages(conversationId: string | null) {
  const query = useInfiniteQuery({
    queryKey: messagesQueryKey(conversationId),

    queryFn: async ({ pageParam }): Promise<MessagesPage> => {
      if (!conversationId) {
        return {
          messages: [],
          hasMore: false,
          nextCursor: null,
        };
      }

      const response = await getPaginatedMessages({
        conversationId,
        cursor: pageParam,
        limit: PAGE_SIZE,
      });

      return {
        messages: response.data,
        hasMore: response.hasMore,
        nextCursor: response.nextCursor,
      };
    },

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    enabled: Boolean(conversationId),
  });

  const messages = query.data
    ? [...query.data.pages]
        .reverse()
        .flatMap((page) => page.messages)
    : [];

  return {
    ...query,
    data: messages,

    hasMoreMessages: Boolean(
      query.data?.pages[query.data.pages.length - 1]?.hasMore,
    ),

    loadMoreMessages: query.fetchNextPage,

    isLoadingMoreMessages: query.isFetchingNextPage,
  };
}