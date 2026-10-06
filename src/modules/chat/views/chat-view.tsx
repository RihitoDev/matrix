'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useConversations } from '../hooks/use-conversations';
import { useMessages, messagesQueryKey } from '../hooks/use-messages';

import { ConversationList } from '../components/conversation-list';
import { EmptyChatState } from '../components/empty-chat-state';
import { ContactSearchModal } from '../components/contact-search-modal';
import { ChatRoom } from '../components/chat-room';

import { Conversation } from '../types/conversation.types';
import { User } from '../types/user.types';
import { sendMessage } from '../services/chat-api';
import { CURRENT_USER_ID } from '../mocks/mock-users';

export function ChatView() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
    setActiveFilter,
    setSearchQuery,
    handleSelectConversation,
    clearSelectedConversation,
    startConversationWithContact,
  } = useConversations();

  const {
  data: messages = [],
  isLoading: isLoadingMessages,
  hasMoreMessages,
  loadMoreMessages,
  isLoadingMoreMessages,
} = useMessages(selectedId);

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

  const handleSendMessage = async (content: string) => {
    if (!selectedId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        conversationId: selectedId,
        content,
        senderId: CURRENT_USER_ID,
      });

      await queryClient.invalidateQueries({
        queryKey: messagesQueryKey(selectedId),
      });
    } catch {
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full max-w-full bg-slate-50 overflow-hidden font-sans">
      <aside
        className={`w-full md:w-80 lg:w-96 h-full shrink-0 overflow-hidden ${
          selectedId ? 'hidden md:block' : 'block'
        }`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          isLoading={isLoading}
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
        className={`flex-1 h-full min-w-0 min-h-0 bg-white flex flex-col overflow-hidden ${
          !selectedId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <ChatRoom
            conversation={selectedConversation}
            messages={messages}
            currentUserId={CURRENT_USER_ID}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            hasMoreMessages={hasMoreMessages}
            onLoadMoreMessages={loadMoreMessages}
            isLoadingMoreMessages={isLoadingMoreMessages}
          />
        ) : (
          <EmptyChatState
            description="Selecciona una conversacion existente en el panel izquierdo o inicia una nueva para comenzar a comunicarte."
            actionLabel="Iniciar una nueva conversacion"
            onAction={handleStartNewChat}
          />
        )}
      </main>

      <ContactSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectContact={handleStartChatWithContact}
      />
    </div>
  );
}
