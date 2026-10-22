'use client';

import { useState, useMemo } from 'react';
import { Conversation, ConversationFilter } from '../types/conversation.types';
import { User } from '../types/user.types';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  getConversations,
  getOrCreateConversation,
  markConversationAsRead,
} from '../services/chat-api';
import { setStoredConversationUnreadCount } from '../services/message-storage';

const PAGE_SIZE = 10;

export function useConversations() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [keptInUnreadId, setKeptInUnreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();
  const queryKey = ['chat', 'conversations'];
  const query = useQuery({ queryKey, queryFn: () => getConversations() });
  const conversationsData = useMemo(() => query.data ?? [], [query.data]);
  const isLoading = query.isFetching;
  const isError = query.isError && !query.isFetching;
  function setConversationsData(update: (current: Conversation[]) => Conversation[]) {
    queryClient.setQueryData<Conversation[]>(queryKey, (current) => update(current ?? []));
  }
  const startMutation = useMutation({ mutationFn: (id: string) => getOrCreateConversation(id) });
  const readMutation = useMutation({ mutationFn: (id: string) => markConversationAsRead(id) });
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [pendingContactId, setPendingContactId] = useState<string | null>(null);
  const retryConversations = () => { void query.refetch(); };

  const sortedConversations = useMemo(() => {
    return [...conversationsData].sort((a, b) => {
      const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
      const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
      return dateB - dateA;
    });
  }, [conversationsData]);

  const filteredConversations = useMemo(() => {
    let list = sortedConversations;

    if (filter === 'unread') {
      list = list.filter((item) => item.unreadCount > 0 || item.id === keptInUnreadId);
    }

    if (searchQuery.trim().length > 0) {
      const normalizedQuery = searchQuery
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      list = list.filter((item) => {
        const normalizedName = (item.contact?.fullName || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normalizedContent = (item.lastMessage?.content || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedContent.includes(normalizedQuery)
        );
      });
    }

    return list;
  }, [sortedConversations, filter, searchQuery, keptInUnreadId]);

  const paginatedConversations = useMemo(() => {
    return filteredConversations.slice(0, visibleCount);
  }, [filteredConversations, visibleCount]);

  const selectedConversation = useMemo(() => {
    if (!selectedId) return null;
    return conversationsData.find((item) => item.id === selectedId) || null;
  }, [conversationsData, selectedId]);

  const hasMore = visibleCount < filteredConversations.length;

  const loadMore = () => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  };

  const setActiveFilter = (newFilter: ConversationFilter) => {
    setFilter(newFilter);
    setSelectedId(null);
    setKeptInUnreadId(null);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedId(conversation.id);

    if (filter === 'unread' && conversation.unreadCount > 0) {
      setKeptInUnreadId(conversation.id);
    } else if (filter === 'all') {
      setKeptInUnreadId(null);
    }

    readMutation.mutate(conversation.id);

    if (conversation.unreadCount > 0) {
      setConversationsData((prev) =>
        prev.map((item) =>
          item.id === conversation.id ? { ...item, unreadCount: 0 } : item
        )
      );
    }
  };

  const clearSelectedConversation = () => {
    setSelectedId(null);
    setKeptInUnreadId(null);
  };

  const simulateIncomingMessage = (conversationId: string, newContent: string) => {
    const timestamp = new Date().toISOString();
    setConversationsData((prev) => {
      return prev.map((item) => {
        if (item.id === conversationId) {
          const newUnread = selectedId === conversationId ? 0 : item.unreadCount + 1;
          setStoredConversationUnreadCount(conversationId, newUnread);
          return {
            ...item,
            updatedAt: timestamp,
            unreadCount: newUnread,
            lastMessage: {
              id: `msg-${Date.now()}`,
              senderId: item.contact.id,
              content: newContent,
              isAttachment: false,
              createdAt: timestamp,
            },
          };
        }
        return item;
      });
    });
  };

  const updateConversationLastMessage = (
    conversationId: string,
    content: string,
    senderId: string
  ) => {
    const timestamp = new Date().toISOString();
    setConversationsData((prev) => {
      return prev.map((item) => {
        if (item.id === conversationId) {
          return {
            ...item,
            updatedAt: timestamp,
            lastMessage: {
              id: `msg-${Date.now()}`,
              senderId,
              content,
              isAttachment: false,
              createdAt: timestamp,
            },
          };
        }
        return item;
      });
    });
  };

  const startConversationWithContact = async (contactUser: User) => {
    if (pendingContactId) return;

    const alreadyInList = conversationsData.find(
      (conv) => conv.contact.id === contactUser.id
    );
    if (alreadyInList) {
      handleSelectConversation(alreadyInList);
      return;
    }

    setPendingContactId(contactUser.id);
    try {
      const conversation = await startMutation.mutateAsync(contactUser.id);

      setConversationsData((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);
        return exists ? prev : [conversation, ...prev];
      });

      setSelectedId(conversation.id);
    } finally {
      setPendingContactId(null);
    }
  };

  return {
    conversations: paginatedConversations,
    selectedConversation,
    totalCount: filteredConversations.length,
    hasMore,
    selectedId,
    activeFilter: filter,
    searchQuery,
    isLoading,
    isError,
    retryConversations,
    loadMore,
    setActiveFilter,
    setSearchQuery,
    handleSelectConversation,
    clearSelectedConversation,
    simulateIncomingMessage,
    updateConversationLastMessage,
    startConversationWithContact,
  };
}
