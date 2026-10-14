'use client';

import { Conversation, ConversationFilter } from '../types/conversation.types';
import { ConversationItem } from './conversation-item';
import { ConversationSkeleton } from './conversation-skeleton';
import { EmptyChatState } from './empty-chat-state';
import { ChatErrorState } from './chat-error-state';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string | null;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  hasMore: boolean;
  activeFilter: ConversationFilter;
  searchQuery: string;
  onSelectConversation: (conversation: Conversation) => void;
  onFilterChange: (filter: ConversationFilter) => void;
  onSearchChange: (query: string) => void;
  onLoadMore?: () => void;
  onStartNewChat?: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  isLoading,
  isError = false,
  onRetry,
  hasMore,
  activeFilter,
  searchQuery,
  onSelectConversation,
  onFilterChange,
  onSearchChange,
  onLoadMore,
  onStartNewChat,
}: ConversationListProps) {
  const isFiltered = Boolean(searchQuery.trim() || activeFilter === 'unread');

  const getEmptyMessage = () => {
    if (activeFilter === 'unread') {
      return 'No tienes mensajes sin leer.';
    }
    if (searchQuery.trim().length > 0) {
      return 'No se encontraron conversaciones que coincidan con tu busqueda.';
    }
    return 'Aun no tienes ninguna conversacion registrada.';
  };

  return (
    <div className="relative flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chats</h2>
          {onStartNewChat && activeFilter !== 'unread' && (
            <button
              type="button"
              onClick={onStartNewChat}
              className="hidden md:inline-flex items-center text-xs font-bold text-red-600 hover:text-red-700"
            >
              + Nuevo
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar personas..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0B2545] transition-all text-slate-800 placeholder-slate-400"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
              activeFilter === 'all'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('unread')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
              activeFilter === 'unread'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sin leer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div role="status" aria-label="Cargando conversaciones">
            <span className="sr-only">Cargando conversaciones...</span>
            <ConversationSkeleton />
          </div>
        ) : isError ? (
          <ChatErrorState
            message="No pudimos cargar tus conversaciones. Inténtalo de nuevo."
            onRetry={onRetry}
          />
        ) : conversations.length === 0 ? (
          <EmptyChatState
            description={getEmptyMessage()}
            actionLabel="Iniciar una nueva conversacion"
            onAction={isFiltered ? undefined : onStartNewChat}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {conversations.map((item) => (
              <ConversationItem
                key={item.id}
                conversation={item}
                isSelected={selectedId === item.id}
                onSelect={onSelectConversation}
              />
            ))}

            {hasMore && (
              <div className="p-3 text-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Cargar mas conversaciones
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {onStartNewChat && activeFilter !== 'unread' && (
        <button
          type="button"
          onClick={onStartNewChat}
          className="md:hidden absolute bottom-6 right-4 w-12 h-12 bg-red-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all focus:outline-none"
          aria-label="Iniciar nueva conversacion"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
