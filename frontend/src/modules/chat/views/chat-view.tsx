
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useConversations } from '../hooks/use-conversations';
import { useMessages, messagesQueryKey } from '../hooks/use-messages';

import { ConversationList } from '../components/conversation-list';
import { EmptyChatState } from '../components/empty-chat-state';
import { ContactSearchModal } from '../components/contact-search-modal';
import { ChatRoom } from '../components/chat-room';
import { ChatConnectionDialog } from '../components/chat-connection-dialog';

import type { Conversation } from '../types/conversation.types';
import type { User } from '../types/user.types';

import {
  sendMessage,
  getCurrentSessionUserId,
} from '../services/chat-api';

export function ChatView() {
  const currentUserId = getCurrentSessionUserId();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  const queryClient = useQueryClient();

  const {
    conversations,
    selectedConversation,
    hasMore,
    loadMore,
    selectedId,
    activeFilter,
    searchQuery,
    isLoading,
    isError,
    retryConversations,
    setActiveFilter,
    setSearchQuery,
    handleSelectConversation,
    clearSelectedConversation,
    startConversationWithContact,
    updateConversationLastMessage,
  } = useConversations();

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    isLoadingMoreMessages,
    isError: isMessagesError,
    isFetchNextPageError,
    refetch: retryMessages,
  } = useMessages(selectedId);

  const showConnectionDialog = isError && !dismissedError;

  const handleBackToList = () => {
    clearSelectedConversation();
  };

  const handleSelectChat = (conversation: Conversation) => {
    handleSelectConversation(conversation);
  };

  const handleStartNewChat = () => {
    if (activeFilter !== 'all') {
      setActiveFilter('all');
    }

    setIsSearchModalOpen(true);
  };

  const handleStartChatWithContact = async (contactUser: User) => {
    if (activeFilter !== 'all') {
      setActiveFilter('all');
    }

    await startConversationWithContact(contactUser);
    setIsSearchModalOpen(false);
  };

  const handleSendMessage = async (content: string): Promise<void> => {
    if (!selectedId || isSending) {
      throw new Error(
        'No hay una conversación seleccionada o ya se está enviando un mensaje.',
      );
    }

    const conversationId = selectedId;

    setIsSending(true);

    try {
      await sendMessage({
        conversationId,
        content,
        senderId: currentUserId,
      });

      updateConversationLastMessage(
        conversationId,
        content,
        currentUserId,
      );

      await queryClient.invalidateQueries({
        queryKey: messagesQueryKey(conversationId),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryConversations = async () => {
    setDismissedError(true);

    try {
      await retryConversations();
    } catch {
    } finally {
      setDismissedError(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 overflow-hidden bg-surface-soft font-sans">
      <aside
        className={`h-full w-full shrink-0 overflow-hidden md:w-80 lg:w-96 ${
          selectedId ? 'hidden md:block' : 'block'
        }`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          isLoading={isLoading}
          isError={false}
          onRetry={retryConversations}
          hasMore={hasMore}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onSelectConversation={handleSelectChat}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchQuery}
          onLoadMore={loadMore}
          onStartNewChat={handleStartNewChat}
        />
      </aside>

      <main
        className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white ${
          !selectedId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <ChatRoom
            key={selectedConversation.id}
            conversation={selectedConversation}
            messages={messages}
            currentUserId={currentUserId}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            hasMoreMessages={hasMoreMessages}
            onLoadMoreMessages={loadMoreMessages}
            isLoadingMoreMessages={isLoadingMoreMessages}
            isMessagesError={isMessagesError}
            isLoadingOlderError={isFetchNextPageError}
            onRetryMessages={() => {
              void retryMessages();
            }}
          />
        ) : (
          <EmptyChatState
            description="Selecciona una conversacion existente en el panel izquierdo o inicia una nueva para comenzar a comunicarte."
            actionLabel="Iniciar una nueva conversacion"
            onAction={handleStartNewChat}
          />
        )}
      </main>

      <ChatConnectionDialog
        open={showConnectionDialog}
        onClose={() => setDismissedError(true)}
        onRetry={() => {
          void handleRetryConversations();
        }}
      />

      <ContactSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectContact={handleStartChatWithContact}
      />
    </div>
  );
}
