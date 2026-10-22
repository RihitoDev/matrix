import { readLocalStorage, writeLocalStorage } from "@/shared/services/storage/browser-local-storage";
/**
 * HU-1: recuerda cuándo el usuario leyó cada conversación.
 */
import type { Conversation } from '../types/conversation.types';

export const CHAT_READ_AT_STORAGE_KEY = 'umssy_chat_read_at_v1';


function readMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = readLocalStorage(CHAT_READ_AT_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export function saveConversationReadAt(
  conversationId: string,
  readAt: string = new Date().toISOString(),
): void {
  if (typeof window === 'undefined') return;
  try {
    const map = readMap();
    map[conversationId] = readAt;
    writeLocalStorage(CHAT_READ_AT_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Sin almacenamiento disponible: se usa el contador del backend.
  }
}

export function applyStoredReadState(conversations: Conversation[]): Conversation[] {
  const map = readMap();

  return conversations.map((conversation) => {
    const readAt = map[conversation.id];
    if (!readAt || conversation.unreadCount === 0) return conversation;

    const lastActivity = new Date(
      conversation.lastMessage?.createdAt || conversation.updatedAt,
    ).getTime();

    return lastActivity <= new Date(readAt).getTime()
      ? { ...conversation, unreadCount: 0 }
      : conversation;
  });
}