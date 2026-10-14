import {
  AttachmentType,
  Conversation,
  Message,
  MessageStatus,
  SendMessagePayload,
  SendMessageOptions,
  SendMessageResponse,
  StandardApiResponse,
} from '../types/conversation.types';
import { MOCK_CONVERSATIONS } from '../mocks/mock-conversations';
import { User } from '../types/user.types';
import {
  CURRENT_USER_ID
} from '../mocks/mock-users';
import {
  getMessagesByConversation,
  getStoredMessages,
  saveStoredMessage,
  getStoredConversationReadState,
  markStoredConversationAsRead,
} from './message-storage';
import { apiClient } from '@/shared/services/api-client';
import { getAccessToken } from '@/shared/services/storage/access-token-storage';
import type { UserRole } from '../types/user.types';
const MIN_SEARCH_CHARS = 2;
const DEFAULT_MESSAGE_PAGE_SIZE = 10;

export function getCurrentSessionUserId(): string {
  const token = getAccessToken();
  if (!token) return CURRENT_USER_ID;

  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed.sub === 'string' && parsed.sub.length > 0) {
        return parsed.sub;
      }
    }
  } catch {
  }

  return CURRENT_USER_ID;
}

export interface GetPaginatedMessagesParams {
  conversationId: string;
  cursor?: string | null;
  limit?: number;
}

export interface PaginatedMessagesResponse {
  data: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface RawBackendMessageItem {
  id?: string;
  conversationId?: string;
  senderId?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
  sentAt?: string;
  status?: string;
  isAttachment?: boolean;
  attachmentType?: AttachmentType | null;
}

interface ChatUserResponse {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  role: string;
  isOnline: boolean;
}
export async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await apiClient.get<Conversation[] | { data: Conversation[] }>(
      '/chat/conversations',
    );

    const body = response.data;
    const items = Array.isArray(body)
      ? body
      : Array.isArray((body as { data?: Conversation[] })?.data)
        ? (body as { data: Conversation[] }).data
        : [];

    return items.sort((a, b) => {
      const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
      const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
      return dateB - dateA;
    });
  } catch {
    const readState = getStoredConversationReadState();
    const storedMessages = getStoredMessages();

    const conversations = MOCK_CONVERSATIONS.map((conv) => {
      const unread = conv.id in readState ? readState[conv.id] : conv.unreadCount;

      const convMessages = Array.isArray(storedMessages)
        ? storedMessages.filter((m) => m && m.conversationId === conv.id)
        : [];

      if (convMessages.length === 0) {
        return {
          ...conv,
          unreadCount: unread,
        };
      }

      const lastMsg = convMessages[convMessages.length - 1];
      const lastDate = lastMsg.timestamp || lastMsg.createdAt || conv.updatedAt;

      return {
        ...conv,
        unreadCount: unread,
        updatedAt: lastDate,
        lastMessage: {
          id: lastMsg.id,
          senderId: lastMsg.senderId,
          content: lastMsg.content,
          isAttachment: Boolean(lastMsg.isAttachment),
          attachmentType: lastMsg.attachmentType,
          createdAt: lastDate,
        },
      };
    });

    return conversations.sort((a, b) => {
      const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
      const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
      return dateB - dateA;
    });
  }
}



/**
 * HU-2: búsqueda de contactos.
 * Llama a GET /chat/users/search?q=... en el backend.
 * El backend excluye al usuario de la sesión, filtra inactivos
 * y no expone email/teléfono.
 */
export async function searchUsers(rawQuery: string): Promise<User[]> {
  const query = rawQuery.trim();

  if (query.length < MIN_SEARCH_CHARS) {
    return [];
  }

  const response = await apiClient.get<
    ChatUserResponse[] | StandardApiResponse<ChatUserResponse[]>
  >('/chat/users/search', { params: { q: query } });

  const body = response.data;
  const items: ChatUserResponse[] = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: ChatUserResponse[] })?.data)
      ? (body as { data: ChatUserResponse[] }).data
      : [];

  return items.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    avatarUrl: u.avatarUrl,
    headline: u.headline,
    role: u.role as UserRole,
    isActive: true,
  }));
}

export async function getMessages(
  conversationId: string,
): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return getMessagesByConversation(conversationId);
}


export async function getPaginatedMessages({
  conversationId,
  cursor = null,
  limit = DEFAULT_MESSAGE_PAGE_SIZE,
}: GetPaginatedMessagesParams): Promise<PaginatedMessagesResponse> {
  if (!conversationId) {
    throw new Error(
      'El identificador de conversacion es requerido',
    );
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(
      'El limite debe ser un numero entero mayor a 0',
    );
  }

  try {
    const response = await apiClient.get<
      | StandardApiResponse<PaginatedMessagesResponse>
      | PaginatedMessagesResponse
    >(`/conversations/${conversationId}/messages`, {
      params: {
        cursor: cursor ?? undefined,
        limit,
      },
    });

    const body = response?.data;
    if (body) {
      const payload =
        typeof body === 'object' &&
        body !== null &&
        'data' in body &&
        body.data !== null &&
        typeof body.data === 'object' &&
        'data' in body.data &&
        Array.isArray((body.data as { data?: unknown[] }).data)
          ? (body.data as PaginatedMessagesResponse)
          : (body as PaginatedMessagesResponse);

      const rawMessages = (
        Array.isArray(payload.data) ? payload.data : []
      ) as RawBackendMessageItem[];
      const stored = getMessagesByConversation(conversationId);
      const localOnly = stored.filter(
        (localMsg) =>
          !rawMessages.some(
            (rm: RawBackendMessageItem) =>
              rm.id === localMsg.id ||
              (rm.content === localMsg.content &&
                Math.abs(
                  new Date(rm.createdAt || rm.timestamp || '').getTime() -
                    new Date(
                      localMsg.createdAt || localMsg.timestamp || '',
                    ).getTime(),
                ) < 10000),
          ),
      );
      const combined = [...rawMessages, ...localOnly].sort(
        (a, b) =>
          new Date(a.timestamp || a.createdAt || a.sentAt || '').getTime() -
          new Date(b.timestamp || b.createdAt || b.sentAt || '').getTime(),
      );

      if (
        combined.length > 0 ||
        payload.nextCursor !== undefined ||
        payload.hasMore !== undefined
      ) {
        const mappedMessages: Message[] = combined.map(
          (m: RawBackendMessageItem) => ({
            id: m.id || '',
            conversationId: m.conversationId || conversationId,
            senderId: m.senderId || '',
            content: m.content || '',
            timestamp:
              m.timestamp || m.createdAt || m.sentAt || new Date().toISOString(),
            createdAt:
              m.createdAt || m.sentAt || m.timestamp || new Date().toISOString(),
            status: (m.status as MessageStatus) || 'sent',
            isAttachment: Boolean(
              m.isAttachment ?? m.content?.startsWith('[Archivo]'),
            ),
            attachmentType:
              m.attachmentType ??
              (m.content?.startsWith('[Archivo]') ? 'file' : null),
          }),
        );

        return {
          data: mappedMessages,
          nextCursor: payload.nextCursor ?? null,
          hasMore: Boolean(payload.hasMore),
        };
      }
    }
  } catch (error){
    throw error;
  }

  const messages = getMessagesByConversation(conversationId);

  if (messages.length === 0) {
    return {
      data: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  const chronologicalMessages = [...messages].sort(
    (a, b) =>
      new Date(a.timestamp || a.createdAt || '').getTime() -
      new Date(b.timestamp || b.createdAt || '').getTime(),
  );

  let endIndex = chronologicalMessages.length;

  if (cursor) {
    const cursorIndex = chronologicalMessages.findIndex(
      (message) => message.id === cursor,
    );

    if (cursorIndex === -1) {
      throw new Error('Cursor de mensajes no valido');
    }

    endIndex = cursorIndex;
  }

  const startIndex = Math.max(0, endIndex - limit);

  const pageMessages = chronologicalMessages.slice(
    startIndex,
    endIndex,
  );

  const hasMore = startIndex > 0;

  const nextCursor =
    hasMore && pageMessages.length > 0
      ? pageMessages[0].id
      : null;

  return {
    data: pageMessages,
    nextCursor,
    hasMore,
  };
}


/**
 * HU-2: obtiene o crea la conversación con un contacto.
 * Llama a POST /chat/conversations.
 * El backend usa el JWT para saber quién es el usuario de la sesión,
 * y aplica la regla del par ordenado (no duplica conversaciones).
 */
export async function getOrCreateConversation(
  contactId: string,
): Promise<Conversation> {
  const { data } = await apiClient.post<Conversation>(
    '/chat/conversations',
    { contactId },
  );

  return data;
}

export async function sendMessage(
  payload: SendMessagePayload,
  options?: SendMessageOptions,
): Promise<SendMessageResponse> {
  const isBrowserOffline =
    typeof navigator !== 'undefined' && !navigator.onLine;

  if (options?.forceOffline || isBrowserOffline) {
    throw new Error(
      'Error de red: Sin conexion a internet',
    );
  }

  if (options?.forceError) {
    throw new Error(
      'Error del servidor: No se pudo procesar el envio del mensaje',
    );
  }

  if (!payload.conversationId) {
    throw new Error(
      'El identificador de conversacion es requerido',
    );
  }

  const trimmedContent = payload.content.trim();

  if (trimmedContent.length === 0) {
    throw new Error(
      'El contenido del mensaje no puede estar vacio',
    );
  }

  try {
    const response = await apiClient.post<
      | StandardApiResponse<Message>
      | Message
    >('/chat/messages', {
      conversationId: payload.conversationId,
      content: trimmedContent,
    });

    const body = response?.data;
    if (body) {
      const msg =
        typeof body === 'object' &&
        body !== null &&
        'data' in body &&
        body.data !== null &&
        typeof body.data === 'object' &&
        'id' in body.data
          ? (body.data as Message)
          : (body as Message);

      if (msg && msg.id) {
        const createdMessage: Message = {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId:
            msg.senderId || payload.senderId || getCurrentSessionUserId(),
          content: msg.content,
          timestamp:
            msg.timestamp || msg.createdAt || new Date().toISOString(),
          status: 'sent',
          createdAt:
            msg.createdAt || msg.timestamp || new Date().toISOString(),
          isAttachment: Boolean(msg.isAttachment),
          attachmentType: msg.attachmentType || null,
        };

        saveStoredMessage(createdMessage);
        markStoredConversationAsRead(payload.conversationId);

        return {
          statusCode: 201,
          ok: true,
          detail: 'Mensaje enviado exitosamente',
          data: createdMessage,
        };
      }
    }
  } catch {
  }

  const minLatency = 300;
  const maxLatency = 600;

  const latency =
    options?.latencyMs ??
    Math.floor(
      Math.random() * (maxLatency - minLatency + 1),
    ) +
      minLatency;

  await new Promise((resolve) =>
    setTimeout(resolve, latency),
  );

  const nowIso = new Date().toISOString();

  const createdMessage: Message = {
    id: `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`,
    conversationId: payload.conversationId,
    senderId: payload.senderId || getCurrentSessionUserId(),
    content: payload.content,
    timestamp: nowIso,
    status: 'sent',
    createdAt: nowIso,
    isAttachment: false,
  };

  saveStoredMessage(createdMessage);
  markStoredConversationAsRead(payload.conversationId);

  return {
    statusCode: 201,
    ok: true,
    detail: 'Mensaje enviado exitosamente',
    data: createdMessage,
  };
}

export async function markConversationAsRead(
  conversationId: string,
): Promise<void> {
  markStoredConversationAsRead(conversationId);
}