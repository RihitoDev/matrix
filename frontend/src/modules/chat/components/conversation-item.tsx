/* eslint-disable @next/next/no-img-element */
'use client';

import { Conversation } from '../types/conversation.types';
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
      return <span className="text-text-secondary italic">Conversación iniciada</span>;
    }

    if (lastMessage.isAttachment) {
      const label =
        lastMessage.attachmentType === 'image'
          ? 'Foto'
          : lastMessage.attachmentType === 'audio'
          ? 'Audio'
          : 'Archivo';
      return (
        <span className="text-ink-soft font-medium">
          [{label}] {lastMessage.content}
        </span>
      );
    }

    return <span>{lastMessage.content}</span>;
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      aria-pressed={isSelected}
      className={`w-full text-left p-3.5 flex items-center gap-3 transition-all border-b border-border hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
        isSelected
          ? 'bg-interaction ring-1 ring-inset ring-border-strong'
          : 'bg-surface'
      }`}
    >
      <div className="relative shrink-0">
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={contact.fullName}
            className="w-12 h-12 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-border text-ink-soft flex items-center justify-center font-bold text-sm border border-border-strong">
            {getInitials(contact.fullName)}
          </div>
        )}

        {contact.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-ink-soft border-2 border-white rounded-full shadow-xs"
            title="En línea"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4
            className={`text-sm truncate ${
              hasUnread ? 'font-bold text-ink' : 'font-semibold text-ink'
            }`}
          >
            {contact.fullName}
          </h4>
          <span
            className={`text-xs whitespace-nowrap shrink-0 ${
              hasUnread ? 'text-accent font-semibold' : 'text-text-secondary'
            }`}
          >
            {formatConversationDate(lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate flex-1 ${
              hasUnread ? 'text-ink font-medium' : 'text-text-secondary'
            }`}
          >
            {renderMessagePreview()}
          </p>

              {hasUnread && (
            <span className="shrink-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}