
'use client';

/* eslint-disable @next/next/no-img-element */

import { Button } from '@/components/ui/button';

import type { Conversation } from '../types/conversation.types';
import { formatConversationDate, getInitials } from '../utils/date-formatter';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const { contact, lastMessage, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;

  const renderMessagePreview = () => {
    if (!lastMessage) {
      return (
        <span className="text-slate-400 italic">
          Conversación iniciada
        </span>
      );
    }

    if (lastMessage.isAttachment) {
      const label =
        lastMessage.attachmentType === 'image'
          ? 'Foto'
          : lastMessage.attachmentType === 'audio'
            ? 'Audio'
            : 'Archivo';

      return (
        <span className="font-medium text-blue-700">
          [{label}] {lastMessage.content}
        </span>
      );
    }

    return <span>{lastMessage.content}</span>;
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(conversation)}
      aria-pressed={isSelected}
      className={`h-auto w-full justify-start gap-3 rounded-none border-x-0 border-t-0 border-b border-slate-100 bg-transparent p-3.5 text-left font-normal whitespace-normal transition-all hover:bg-slate-50 focus:outline-none ${
        isSelected
          ? 'border-l-4 border-l-[#0B2545] bg-blue-50/80 hover:bg-blue-50/80'
          : 'border-l-4 border-l-transparent'
      }`}
    >
      <div className="relative shrink-0">
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={contact.fullName}
            className="size-12 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-sm font-bold text-slate-700">
            {getInitials(contact.fullName)}
          </div>
        )}

        {contact.isOnline && (
          <span
            className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs"
            title="En línea"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-1">
          <h4
            className={`truncate text-sm ${
              hasUnread
                ? 'font-bold text-slate-900'
                : 'font-semibold text-slate-800'
            }`}
          >
            {contact.fullName}
          </h4>

          <span
            className={`shrink-0 text-xs whitespace-nowrap ${
              hasUnread
                ? 'font-semibold text-red-600'
                : 'text-slate-400'
            }`}
          >
            {formatConversationDate(
              lastMessage?.createdAt || conversation.updatedAt
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`min-w-0 flex-1 truncate text-xs ${
              hasUnread
                ? 'font-medium text-slate-900'
                : 'text-slate-500'
            }`}
          >
            {renderMessagePreview()}
          </p>

          {hasUnread && (
            <span className="min-w-4 shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Button>
  );
}
