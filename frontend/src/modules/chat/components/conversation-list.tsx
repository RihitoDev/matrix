
'use client';

import { Plus, Search } from 'lucide-react';
import { Conversation, ConversationFilter } from '../types/conversation.types';
import { ConversationItem } from './conversation-item';
import { ConversationSkeleton } from './conversation-skeleton';
import { EmptyChatState } from './empty-chat-state';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string | null;
  isLoading: boolean;
  isError?: boolean;
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
    <div className="relative flex flex-col h-full bg-white border-r border-border">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink tracking-tight">Chats</h2>
          {onStartNewChat && activeFilter !== 'unread' && (
            <button
              type="button"
              onClick={onStartNewChat}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-brand-hover"
            >
              <Plus className="size-4" aria-hidden="true" /> Nuevo
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar conversaciones"
            placeholder="Buscar personas..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:bg-white focus:border-accent transition-all text-ink placeholder-text-secondary"
          />
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-text-secondary" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-interaction text-accent'
                : 'bg-surface text-text-secondary hover:bg-surface-soft'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('unread')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeFilter === 'unread'
                ? 'bg-interaction text-accent'
                : 'bg-surface text-text-secondary hover:bg-surface-soft'
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
        ) : isError ? null : conversations.length === 0 ? (
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
                  className="text-xs font-semibold text-ink-soft hover:text-ink-soft"
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
          className="md:hidden absolute bottom-6 right-4 w-12 h-12 bg-accent text-white rounded-xl shadow-sm flex items-center justify-center hover:bg-brand-hover active:scale-95 transition-all focus:outline-none"
          aria-label="Iniciar nueva conversacion"
        >
          <Plus className="size-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
