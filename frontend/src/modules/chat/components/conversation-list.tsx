
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type {
  Conversation,
  ConversationFilter,
} from '../types/conversation.types';

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
  const isFiltered = Boolean(
    searchQuery.trim() || activeFilter === 'unread'
  );

  const getEmptyMessage = () => {
    if (activeFilter === 'unread') {
      return 'No tienes mensajes sin leer.';
    }

    if (searchQuery.trim().length > 0) {
      return 'No se encontraron conversaciones que coincidan con tu búsqueda.';
    }

    return 'Aún no tienes ninguna conversación registrada.';
  };

  return (
    <div className="relative flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Chats
          </h2>

          {onStartNewChat && activeFilter !== 'unread' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onStartNewChat}
              className="hidden h-auto items-center px-0 text-xs font-bold text-red-600 hover:bg-transparent hover:text-red-700 md:inline-flex"
            >
              + Nuevo
            </Button>
          )}
        </div>

        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar personas..."
            aria-label="Buscar conversaciones"
            className="h-9 w-full rounded-lg border-transparent bg-slate-100 py-2 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-[#0B2545] focus-visible:bg-white"
          />

          <svg
            className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange('all')}
            aria-pressed={activeFilter === 'all'}
            className={`h-auto rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#0B2545] text-white shadow-xs hover:bg-[#16364B] hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange('unread')}
            aria-pressed={activeFilter === 'unread'}
            className={`h-auto rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              activeFilter === 'unread'
                ? 'bg-[#0B2545] text-white shadow-xs hover:bg-[#16364B] hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sin leer
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div
            role="status"
            aria-label="Cargando conversaciones"
          >
            <span className="sr-only">
              Cargando conversaciones...
            </span>

            <ConversationSkeleton />
          </div>
        ) : isError ? null : conversations.length === 0 ? (
          <EmptyChatState
            description={getEmptyMessage()}
            actionLabel="Iniciar una nueva conversación"
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={!onLoadMore}
                  className="h-auto text-xs font-semibold text-blue-600 hover:bg-transparent hover:text-blue-800"
                >
                  Cargar más conversaciones
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {onStartNewChat && activeFilter !== 'unread' && (
        <Button
          type="button"
          variant="default"
          size="icon-lg"
          onClick={onStartNewChat}
          className="absolute right-4 bottom-6 flex size-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 md:hidden"
          aria-label="Iniciar nueva conversación"
        >
          <svg
            className="size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
