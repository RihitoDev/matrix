import { Message, MessageStatus } from '../types/conversation.types';
import { MOCK_MESSAGES } from '../mocks/mock-messages';

export const CHAT_MESSAGES_STORAGE_KEY = 'umssy_chat_messages_v1';
export const CHAT_READ_STATUS_STORAGE_KEY = 'umssy_chat_read_status_v1';

// Memoria cache en caso de entorno SSR o indisponibilidad de localStorage
let memoryMessageCache: Message[] | null = null;
let memoryConversationReadStateCache: Record<string, number> | null = null;

/**
 * Determina si el entorno actual dispone de la API de localStorage
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clona profundamente una coleccion de mensajes para evitar mutaciones externas
 */
function cloneMessages(messages: Message[]): Message[] {
  return messages.map((msg) => ({ ...msg }));
}

/**
 * Obtiene la lista completa de mensajes almacenados.
 * Si el almacenamiento local esta vacio, se inicializa con los datos mock base.
 */
export function getStoredMessages(): Message[] {
  if (!isLocalStorageAvailable()) {
    if (!memoryMessageCache) {
      memoryMessageCache = cloneMessages(MOCK_MESSAGES);
    }
    return cloneMessages(memoryMessageCache);
  }

  try {
    const serializedData = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (!serializedData) {
      // Inicializacion con los datos mock por defecto
      const initialMessages = cloneMessages(MOCK_MESSAGES);
      window.localStorage.setItem(
        CHAT_MESSAGES_STORAGE_KEY,
        JSON.stringify(initialMessages)
      );
      memoryMessageCache = initialMessages;
      return cloneMessages(initialMessages);
    }

    const parsedData = JSON.parse(serializedData);
    if (Array.isArray(parsedData)) {
      memoryMessageCache = parsedData;
      return cloneMessages(parsedData);
    }

    // Si los datos eran invalidos, reiniciar con los datos mock
    const fallbackMessages = cloneMessages(MOCK_MESSAGES);
    window.localStorage.setItem(
      CHAT_MESSAGES_STORAGE_KEY,
      JSON.stringify(fallbackMessages)
    );
    memoryMessageCache = fallbackMessages;
    return cloneMessages(fallbackMessages);
  } catch {
    if (!memoryMessageCache) {
      memoryMessageCache = cloneMessages(MOCK_MESSAGES);
    }
    return cloneMessages(memoryMessageCache);
  }
}

/**
 * Recupera los mensajes correspondientes a una conversacion especifica,
 * ordenados cronologicamente de forma ascendente (del mas antiguo al mas reciente).
 */
export function getMessagesByConversation(conversationId: string): Message[] {
  const allMessages = getStoredMessages();
  return allMessages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || '').getTime();
      const timeB = new Date(b.timestamp || b.createdAt || '').getTime();
      return timeA - timeB;
    });
}

/**
 * Guarda o actualiza un mensaje en el almacenamiento local serializado.
 */
export function saveStoredMessage(message: Message): Message {
  const allMessages = getStoredMessages();
  const existingIndex = allMessages.findIndex((item) => item.id === message.id);

  let updatedMessages: Message[];
  if (existingIndex >= 0) {
    updatedMessages = [...allMessages];
    updatedMessages[existingIndex] = { ...message };
  } else {
    updatedMessages = [...allMessages, { ...message }];
  }

  memoryMessageCache = updatedMessages;

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(
        CHAT_MESSAGES_STORAGE_KEY,
        JSON.stringify(updatedMessages)
      );
    } catch {
      // En caso de cuota excedida se mantiene en memoria
    }
  }

  return { ...message };
}

/**
 * Actualiza el estado de entrega de un mensaje registrado.
 */
export function updateStoredMessageStatus(
  messageId: string,
  newStatus: MessageStatus
): Message | null {
  const allMessages = getStoredMessages();
  const targetMessage = allMessages.find((item) => item.id === messageId);

  if (!targetMessage) {
    return null;
  }

  const updatedMessage: Message = {
    ...targetMessage,
    status: newStatus,
  };

  saveStoredMessage(updatedMessage);
  return updatedMessage;
}

/**
 * Rehidrata la memoria con el estado actual del almacenamiento local.
 * Util para sincronizar tras recargas de pagina (F5).
 */
export function rehydrateStoredMessages(): Message[] {
  return getStoredMessages();
}

/**
 * Restablece el almacenamiento local a los datos mock base y limpia el estado de lectura.
 */
export function clearStoredMessages(): void {
  const initialMessages = cloneMessages(MOCK_MESSAGES);
  memoryMessageCache = initialMessages;
  clearStoredConversationReadState();

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(
        CHAT_MESSAGES_STORAGE_KEY,
        JSON.stringify(initialMessages)
      );
    } catch {
      // Manejo silencioso ante bloqueo de almacenamiento
    }
  }
}

/**
 * Obtiene el mapa de estados de lectura persistidos por conversacion.
 * Devuelve un diccionario donde la clave es conversationId y el valor es unreadCount.
 */
export function getStoredConversationReadState(): Record<string, number> {
  if (!isLocalStorageAvailable()) {
    return memoryConversationReadStateCache ? { ...memoryConversationReadStateCache } : {};
  }

  try {
    const serialized = window.localStorage.getItem(CHAT_READ_STATUS_STORAGE_KEY);
    if (!serialized) {
      return memoryConversationReadStateCache ? { ...memoryConversationReadStateCache } : {};
    }
    const parsed = JSON.parse(serialized);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      memoryConversationReadStateCache = parsed;
      return { ...parsed };
    }
    return {};
  } catch {
    return memoryConversationReadStateCache ? { ...memoryConversationReadStateCache } : {};
  }
}

/**
 * Guarda el numero de mensajes no leidos para una conversacion en el almacenamiento persistente.
 */
export function setStoredConversationUnreadCount(
  conversationId: string,
  unreadCount: number
): void {
  const currentState = getStoredConversationReadState();
  currentState[conversationId] = Math.max(0, unreadCount);
  memoryConversationReadStateCache = currentState;

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(
        CHAT_READ_STATUS_STORAGE_KEY,
        JSON.stringify(currentState)
      );
    } catch {
      // Manejo silencioso ante cuota excedida o almacenamiento bloqueado
    }
  }
}

/**
 * Marca una conversacion como leida (unreadCount = 0) de forma persistente,
 * garantizando que al recargar la pagina (F5) no se vuelva a disparar la alerta
 * visual ni el badge de "nuevo mensaje".
 */
export function markStoredConversationAsRead(conversationId: string): void {
  setStoredConversationUnreadCount(conversationId, 0);
}

/**
 * Restablece el almacenamiento persistente del estado de lectura de conversaciones.
 */
export function clearStoredConversationReadState(): void {
  memoryConversationReadStateCache = null;
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(CHAT_READ_STATUS_STORAGE_KEY);
    } catch {
      // Manejo silencioso
    }
  }
}


