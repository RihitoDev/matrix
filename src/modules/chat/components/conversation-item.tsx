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
      return <span className="text-slate-400 italic">Conversacion iniciada</span>;
    }

    if (lastMessage.isAttachment) {
      const label =
        lastMessage.attachmentType === 'image'
          ? 'Foto'
          : lastMessage.attachmentType === 'audio'
          ? 'Audio'
          : 'Archivo';
      return (
        <span className="text-blue-700 font-medium">
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
      className={`w-full text-left p-3.5 flex items-center gap-3 transition-all border-b border-slate-100 hover:bg-slate-50 focus:outline-none ${
        isSelected
          ? 'bg-blue-50/80 border-l-4 border-l-[#0B2545]'
          : 'border-l-4 border-l-transparent'
      }`}
    >
      {}
      <div className="relative shrink-0">
        {contact.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={contact.fullName}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-300">
            {getInitials(contact.fullName)}
          </div>
        )}

        {contact.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
            title="En linea"
          />
        )}
      </div>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4
            className={`text-sm truncate ${
              hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
            }`}
          >
            {contact.fullName}
          </h4>
          <span
            className={`text-xs whitespace-nowrap shrink-0 ${
              hasUnread ? 'text-red-600 font-semibold' : 'text-slate-400'
            }`}
          >
            {formatConversationDate(lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate flex-1 ${
              hasUnread ? 'text-slate-900 font-medium' : 'text-slate-500'
            }`}
          >
            {renderMessagePreview()}
          </p>

          {}
          {hasUnread && (
            <span className="shrink-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}