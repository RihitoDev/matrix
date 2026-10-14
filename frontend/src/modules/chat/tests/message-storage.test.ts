import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CHAT_MESSAGES_STORAGE_KEY,
  CHAT_READ_STATUS_STORAGE_KEY,
  getStoredMessages,
  getMessagesByConversation,
  saveStoredMessage,
  updateStoredMessageStatus,
  rehydrateStoredMessages,
  clearStoredMessages,
  getStoredConversationReadState,
  setStoredConversationUnreadCount,
  markStoredConversationAsRead,
  clearStoredConversationReadState,
} from '../services/message-storage';
import { Message } from '../types/conversation.types';
import { MOCK_MESSAGES } from '../mocks/mock-messages';

describe('message-storage (Persistencia Local - HU-03 Tarea 1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearStoredMessages();
  });

  it('debe cumplir con la interfaz Message y tipado estricto de atributos', () => {
    const testMessage: Message = {
      id: 'msg-test-1',
      conversationId: 'conv-test-1',
      senderId: 'current-user',
      content: 'Mensaje de prueba con tipado estricto',
      timestamp: new Date().toISOString(),
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    expect(testMessage.id).toBe('msg-test-1');
    expect(testMessage.conversationId).toBe('conv-test-1');
    expect(testMessage.senderId).toBe('current-user');
    expect(testMessage.content).toBe('Mensaje de prueba con tipado estricto');
    expect(typeof testMessage.timestamp).toBe('string');
    expect(['sending', 'sent', 'error']).toContain(testMessage.status);
    expect(typeof testMessage.createdAt).toBe('string');
  });

  it('debe inicializar el almacenamiento con los datos mock base si localStorage esta vacio', () => {
    window.localStorage.clear();

    const messages = getStoredMessages();

    expect(messages.length).toBe(MOCK_MESSAGES.length);
    const serialized = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    expect(serialized).not.toBeNull();
    const parsed = JSON.parse(serialized as string);
    expect(parsed.length).toBe(MOCK_MESSAGES.length);
  });

  it('debe guardar mensajes de forma serializada en localStorage', () => {
    const nowIso = new Date().toISOString();
    const newMessage: Message = {
      id: 'msg-new-123',
      conversationId: 'conv-1',
      senderId: 'current-user',
      content: 'Contenido guardado en localStorage',
      timestamp: nowIso,
      status: 'sent',
      createdAt: nowIso,
    };

    saveStoredMessage(newMessage);

    const serialized = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    expect(serialized).toContain('msg-new-123');
    expect(serialized).toContain('Contenido guardado en localStorage');

    const conversationMessages = getMessagesByConversation('conv-1');
    const saved = conversationMessages.find((m) => m.id === 'msg-new-123');
    expect(saved).toBeDefined();
    expect(saved?.content).toBe('Contenido guardado en localStorage');
    expect(saved?.status).toBe('sent');
  });

  it('debe mantener los mensajes intactos y rehidratarlos al simular recarga de pagina (F5)', () => {
    const nowIso = new Date().toISOString();
    const persistentMessage: Message = {
      id: 'msg-persist-456',
      conversationId: 'conv-2',
      senderId: 'current-user',
      content: 'Mensaje persistente tras recarga',
      timestamp: nowIso,
      status: 'sent',
      createdAt: nowIso,
    };

    saveStoredMessage(persistentMessage);

    // Simulacion de reinicio de contexto en memoria previo a F5
    const rehydrated = rehydrateStoredMessages();
    const found = rehydrated.find((m) => m.id === 'msg-persist-456');

    expect(found).toBeDefined();
    expect(found?.content).toBe('Mensaje persistente tras recarga');
    expect(found?.status).toBe('sent');
  });

  it('debe filtrar y ordenar cronologicamente los mensajes de una conversacion', () => {
    const dateOld = new Date('2026-03-01T10:00:00Z').toISOString();
    const dateMid = new Date('2026-03-01T11:00:00Z').toISOString();
    const dateNew = new Date('2026-03-01T12:00:00Z').toISOString();

    const msg1: Message = {
      id: 'msg-order-mid',
      conversationId: 'conv-order-test',
      senderId: 'user-1',
      content: 'Segundo mensaje',
      timestamp: dateMid,
      status: 'sent',
      createdAt: dateMid,
    };

    const msg2: Message = {
      id: 'msg-order-old',
      conversationId: 'conv-order-test',
      senderId: 'user-1',
      content: 'Primer mensaje',
      timestamp: dateOld,
      status: 'sent',
      createdAt: dateOld,
    };

    const msg3: Message = {
      id: 'msg-order-new',
      conversationId: 'conv-order-test',
      senderId: 'current-user',
      content: 'Tercer mensaje',
      timestamp: dateNew,
      status: 'sent',
      createdAt: dateNew,
    };

    saveStoredMessage(msg1);
    saveStoredMessage(msg2);
    saveStoredMessage(msg3);

    const ordered = getMessagesByConversation('conv-order-test');
    expect(ordered.length).toBe(3);
    expect(ordered[0].id).toBe('msg-order-old');
    expect(ordered[1].id).toBe('msg-order-mid');
    expect(ordered[2].id).toBe('msg-order-new');
  });

  it('debe permitir actualizar el estado de un mensaje existente', () => {
    const nowIso = new Date().toISOString();
    const sendingMessage: Message = {
      id: 'msg-status-check',
      conversationId: 'conv-1',
      senderId: 'current-user',
      content: 'Mensaje con cambio de estado',
      timestamp: nowIso,
      status: 'sending',
      createdAt: nowIso,
    };

    saveStoredMessage(sendingMessage);

    const updated = updateStoredMessageStatus('msg-status-check', 'sent');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('sent');

    const conversationList = getMessagesByConversation('conv-1');
    const found = conversationList.find((m) => m.id === 'msg-status-check');
    expect(found?.status).toBe('sent');
  });

  it('debe retornar null al intentar actualizar un mensaje inexistente', () => {
    const result = updateStoredMessageStatus('msg-inexistente', 'error');
    expect(result).toBeNull();
  });

  it('debe manejar de forma resiliente datos corruptos en localStorage reinicializando con mocks', () => {
    window.localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, 'invalid-json-data');

    const messages = getStoredMessages();
    expect(messages.length).toBe(MOCK_MESSAGES.length);
  });

  it('debe operar con memoria cache en caso de que localStorage no este disponible', () => {
    const originalGetItem = window.localStorage.getItem;
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: LocalStorage is blocked');
    });

    const messages = getStoredMessages();
    expect(messages.length).toBeGreaterThan(0);

    window.localStorage.getItem = originalGetItem;
  });

  it('debe persistir el estado leido de una conversacion en localStorage y recuperarlo', () => {
    markStoredConversationAsRead('conv-test-1');

    const state = getStoredConversationReadState();
    expect(state['conv-test-1']).toBe(0);

    const serialized = window.localStorage.getItem(CHAT_READ_STATUS_STORAGE_KEY);
    expect(serialized).not.toBeNull();
    expect(JSON.parse(serialized as string)['conv-test-1']).toBe(0);
  });

  it('debe actualizar el contador de no leidos y restablecerse al limpiar almacenamiento', () => {
    setStoredConversationUnreadCount('conv-test-2', 5);
    expect(getStoredConversationReadState()['conv-test-2']).toBe(5);

    clearStoredConversationReadState();
    expect(getStoredConversationReadState()['conv-test-2']).toBeUndefined();
    expect(window.localStorage.getItem(CHAT_READ_STATUS_STORAGE_KEY)).toBeNull();
  });

  it('debe manejar datos corruptos en CHAT_READ_STATUS_STORAGE_KEY de forma resiliente', () => {
    window.localStorage.setItem(CHAT_READ_STATUS_STORAGE_KEY, '{invalid json');
    expect(getStoredConversationReadState()).toEqual({});
  });
});
