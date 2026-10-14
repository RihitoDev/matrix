
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/shared/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import {
  getConversations,
  searchUsers,
  getMessages,
  getPaginatedMessages,
  getOrCreateConversation,
  sendMessage,
  markConversationAsRead,
} from '../services/chat-api';
import { apiClient } from '@/shared/services/api-client';
import {
  getStoredMessages,
  clearStoredMessages,
} from '../services/message-storage';

const apiClientMock = vi.mocked(apiClient);
beforeEach(() => {
  vi.resetAllMocks();
});

describe('chat-api', () => {
  it('debe retornar las conversaciones ordenadas cronologicamente descendente', async () => {
    const conversations = await getConversations();

    expect(conversations).toBeDefined();
    expect(conversations.length).toBeGreaterThan(0);

    for (let i = 0; i < conversations.length - 1; i++) {
      const dateCurrent = new Date(
        conversations[i].updatedAt,
      ).getTime();

      const dateNext = new Date(
        conversations[i + 1].updatedAt,
      ).getTime();

      expect(dateCurrent).toBeGreaterThanOrEqual(dateNext);
    }
  });

  it('debe llamar a GET /chat/conversations y retornar las conversaciones ordenadas', async () => {
    apiClientMock.get.mockResolvedValueOnce({
      data: [
        {
          id: 'conv-older',
          contact: { id: 'user-1', fullName: 'User 1', avatarUrl: null, isOnline: false },
          lastMessage: { id: 'm1', senderId: 'user-1', content: 'hola', isAttachment: false, attachmentType: null, createdAt: '2026-01-01T10:00:00.000Z' },
          unreadCount: 0,
          updatedAt: '2026-01-01T10:00:00.000Z',
        },
        {
          id: 'conv-newer',
          contact: { id: 'user-2', fullName: 'User 2', avatarUrl: null, isOnline: true },
          lastMessage: { id: 'm2', senderId: 'user-2', content: 'mundo', isAttachment: false, attachmentType: null, createdAt: '2026-01-02T10:00:00.000Z' },
          unreadCount: 1,
          updatedAt: '2026-01-02T10:00:00.000Z',
        },
      ],
    } as never);

    const result = await getConversations();

    expect(apiClientMock.get).toHaveBeenCalledWith('/chat/conversations');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('conv-newer');
    expect(result[1].id).toBe('conv-older');
  });
});

describe('chat-api — searchUsers (HU-2, backend integration)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar lista vacia si la query tiene menos de 2 caracteres sin llamar al backend', async () => {
    expect(await searchUsers('')).toEqual([]);
    expect(await searchUsers('a')).toEqual([]);
    expect(await searchUsers(' ')).toEqual([]);
    expect(await searchUsers('  a  ')).toEqual([]);

    expect(apiClientMock.get).not.toHaveBeenCalled();
  });

  it('debe llamar a GET /chat/users/search con el parametro q', async () => {
    apiClientMock.get.mockResolvedValue({ data: [] });

    await searchUsers('maria');

    expect(apiClientMock.get).toHaveBeenCalledWith('/chat/users/search', {
      params: { q: 'maria' },
    });
  });

  it('debe mapear la respuesta del backend al tipo User del frontend', async () => {
    apiClientMock.get.mockResolvedValue({
      data: [
        {
          id: 'user-1',
          fullName: 'Maria Peredo',
          avatarUrl: 'https://example.com/a.jpg',
          headline: 'Senior IT Recruiter',
          role: 'RECRUITER',
          isOnline: true,
        },
      ],
    });

    const result = await searchUsers('maria');

    expect(result).toEqual([
      {
        id: 'user-1',
        fullName: 'Maria Peredo',
        avatarUrl: 'https://example.com/a.jpg',
        headline: 'Senior IT Recruiter',
        role: 'RECRUITER',
        isActive: true,
      },
    ]);
  });

  it('debe propagar el error del backend cuando la peticion falla', async () => {
    apiClientMock.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(searchUsers('maria')).rejects.toThrow('Network Error');
  });
});

describe('chat-api — getOrCreateConversation (HU-2, backend integration)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe llamar a POST /chat/conversations con el contactId', async () => {
    apiClientMock.post.mockResolvedValue({
      data: {
        id: 'conv-1',
        contact: {
          id: 'user-1',
          fullName: 'Maria Peredo',
          avatarUrl: null,
          isOnline: false,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    await getOrCreateConversation('user-1');

    expect(apiClientMock.post).toHaveBeenCalledWith('/chat/conversations', {
      contactId: 'user-1',
    });
  });

  it('debe retornar la conversacion que devuelve el backend', async () => {
    const conversation = {
      id: 'conv-1',
      contact: {
        id: 'user-1',
        fullName: 'Maria Peredo',
        avatarUrl: 'https://example.com/a.jpg',
        isOnline: true,
      },
      lastMessage: {
        id: 'msg-1',
        senderId: 'user-1',
        content: 'Hola',
        isAttachment: false,
        attachmentType: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      unreadCount: 0,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    apiClientMock.post.mockResolvedValue({ data: conversation });

    const result = await getOrCreateConversation('user-1');

    expect(result).toEqual(conversation);
  });

  it('debe propagar el error del backend cuando el contacto no existe', async () => {
    apiClientMock.post.mockRejectedValue(new Error('UserNotFoundException'));

    await expect(
      getOrCreateConversation('user-inexistente'),
    ).rejects.toThrow('UserNotFoundException');
  });
});

describe('chat-api — getMessages', () => {
  it('debe retornar los mensajes de una conversacion ordenados del mas antiguo al mas reciente', async () => {
    const messages = await getMessages('conv-1');

    expect(messages.length).toBeGreaterThan(0);

    for (let i = 0; i < messages.length - 1; i++) {
      const current = new Date(
        messages[i].createdAt,
      ).getTime();

      const next = new Date(
        messages[i + 1].createdAt,
      ).getTime();

      expect(current).toBeLessThanOrEqual(next);
    }
  });

  it('debe retornar lista vacia si la conversacion no tiene mensajes', async () => {
    const messages = await getMessages('conv-empty');

    expect(messages).toEqual([]);
  });

  it('debe retornar lista vacia si la conversacion no existe', async () => {
    const messages = await getMessages(
      'conv-inexistente',
    );

    expect(messages).toEqual([]);
  });
});

describe('chat-api — getPaginatedMessages', () => {
it('debe retornar la pagina mas reciente del historial', async () => {
  clearStoredMessages();

  const messages = Array.from({ length: 10 }, (_, index) => {
    const number = index + 21;

    return {
      id: `msg-1-${number}`,
      conversationId: 'conv-1',
      senderId: 'user-101',
      content: `Mensaje ${number}`,
      createdAt: new Date(
        Date.UTC(2026, 9, 14, 10, number),
      ).toISOString(),
    };
  });

  apiClientMock.get.mockResolvedValueOnce({
    data: {
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data: {
        data: messages,
        nextCursor: 'msg-1-21',
        hasMore: true,
      },
    },
  } as never);

  const result = await getPaginatedMessages({
    conversationId: 'conv-1',
    limit: 10,
  });

  expect(result.data).toHaveLength(10);
  expect(result.data[0].id).toBe('msg-1-21');
  expect(result.data[9].id).toBe('msg-1-30');
  expect(result.hasMore).toBe(true);
  expect(result.nextCursor).toBe('msg-1-21');
});

  it('debe cargar la pagina anterior utilizando el cursor', async () => {
  clearStoredMessages();

  const messages = Array.from({ length: 10 }, (_, index) => {
    const number = index + 11;

    return {
      id: `msg-1-${number}`,
      conversationId: 'conv-1',
      senderId: 'user-101',
      content: `Mensaje ${number}`,
      createdAt: new Date(
        Date.UTC(2026, 9, 14, 10, number),
      ).toISOString(),
    };
  });

  apiClientMock.get.mockResolvedValueOnce({
    data: {
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data: {
        data: messages,
        nextCursor: 'msg-1-11',
        hasMore: true,
      },
    },
  } as never);

  const result = await getPaginatedMessages({
    conversationId: 'conv-1',
    cursor: 'msg-1-21',
    limit: 10,
  });

  expect(apiClientMock.get).toHaveBeenCalledWith(
    '/conversations/conv-1/messages',
    {
      params: {
        cursor: 'msg-1-21',
        limit: 10,
      },
    },
  );

  expect(result.data).toHaveLength(10);
  expect(result.data[0].id).toBe('msg-1-11');
  expect(result.data[9].id).toBe('msg-1-20');
  expect(result.hasMore).toBe(true);
  expect(result.nextCursor).toBe('msg-1-11');
});

  it('debe indicar cuando se alcanza el inicio del historial', async () => {
  clearStoredMessages();

  const messages = Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;

    return {
      id: `msg-1-${String(number).padStart(2, '0')}`,
      conversationId: 'conv-1',
      senderId: 'user-101',
      content: `Mensaje ${number}`,
      createdAt: new Date(
        Date.UTC(2026, 9, 14, 10, number),
      ).toISOString(),
    };
  });

  apiClientMock.get.mockResolvedValueOnce({
    data: {
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data: {
        data: messages,
        nextCursor: null,
        hasMore: false,
      },
    },
  } as never);

  const result = await getPaginatedMessages({
    conversationId: 'conv-1',
    cursor: 'msg-1-11',
    limit: 10,
  });

  expect(apiClientMock.get).toHaveBeenCalledWith(
    '/conversations/conv-1/messages',
    {
      params: {
        cursor: 'msg-1-11',
        limit: 10,
      },
    },
  );

  expect(result.data).toHaveLength(10);
  expect(result.data[0].id).toBe('msg-1-01');
  expect(result.data[9].id).toBe('msg-1-10');
  expect(result.hasMore).toBe(false);
  expect(result.nextCursor).toBeNull();
});

  it('debe retornar una pagina vacia si la conversacion no tiene mensajes', async () => {
    const result = await getPaginatedMessages({
      conversationId: 'conv-inexistente',
      limit: 10,
    });

    expect(result).toEqual({
      data: [],
      nextCursor: null,
      hasMore: false,
    });
  });

  it('debe rechazar si falta el conversationId', async () => {
    await expect(
      getPaginatedMessages({
        conversationId: '',
        limit: 10,
      }),
    ).rejects.toThrow(
      'El identificador de conversacion es requerido',
    );
  });

  it('debe rechazar limites invalidos', async () => {
    await expect(
      getPaginatedMessages({
        conversationId: 'conv-1',
        limit: 0,
      }),
    ).rejects.toThrow(
      'El limite debe ser un numero entero mayor a 0',
    );

    await expect(
      getPaginatedMessages({
        conversationId: 'conv-1',
        limit: -1,
      }),
    ).rejects.toThrow(
      'El limite debe ser un numero entero mayor a 0',
    );

    await expect(
      getPaginatedMessages({
        conversationId: 'conv-1',
        limit: 1.5,
      }),
    ).rejects.toThrow(
      'El limite debe ser un numero entero mayor a 0',
    );
  });

  it('debe rechazar un cursor que no pertenece al historial', async () => {
  apiClientMock.get.mockRejectedValueOnce(
    new Error('Cursor de mensajes no valido'),
  );

  await expect(
    getPaginatedMessages({
      conversationId: 'conv-1',
      cursor: 'cursor-inexistente',
      limit: 10,
    }),
  ).rejects.toThrow('Cursor de mensajes no valido');

  expect(apiClientMock.get).toHaveBeenCalledWith(
    '/conversations/conv-1/messages',
    {
      params: {
        cursor: 'cursor-inexistente',
        limit: 10,
      },
    },
  );
});

  it('debe llamar a GET /conversations/:conversationId/messages y retornar mensajes paginados mapeados', async () => {
    apiClientMock.get.mockResolvedValueOnce({
      data: {
        statusCode: 200,
        ok: true,
        detail: 'Operación exitosa',
        data: {
          data: [
            {
              id: 'msg-backend-1',
              conversationId: 'conv-real-uuid',
              senderId: 'user-sender',
              content: 'Hola desde backend',
              createdAt: '2026-10-14T03:00:00.000Z',
            },
            {
              id: 'msg-backend-2',
              conversationId: 'conv-real-uuid',
              senderId: 'user-sender',
              content: '[Archivo] Archivo adjunto',
              createdAt: '2026-10-14T03:05:00.000Z',
            },
          ],
          nextCursor: null,
          hasMore: false,
        },
      },
    } as never);

    const result = await getPaginatedMessages({
      conversationId: 'conv-real-uuid',
      limit: 10,
    });

    expect(apiClientMock.get).toHaveBeenCalledWith(
      '/conversations/conv-real-uuid/messages',
      {
        params: {
          cursor: undefined,
          limit: 10,
        },
      },
    );
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('msg-backend-1');
    expect(result.data[0].content).toBe('Hola desde backend');
    expect(result.data[0].status).toBe('sent');
    expect(result.data[1].isAttachment).toBe(true);
    expect(result.data[1].attachmentType).toBe('file');
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});

describe('chat-api — getOrCreateConversation ', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe llamar a POST /chat/conversations con el contactId', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 'conv-1',
        contact: {
          id: 'user-1',
          fullName: 'Maria Peredo',
          avatarUrl: null,
          isOnline: false,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    await getOrCreateConversation('user-1');

    expect(postSpy).toHaveBeenCalledWith('/chat/conversations', {
      contactId: 'user-1',
    });
  });

  it('debe retornar la conversacion que devuelve el backend', async () => {
    const conversation = {
      id: 'conv-1',
      contact: {
        id: 'user-1',
        fullName: 'Maria Peredo',
        avatarUrl: 'https://example.com/a.jpg',
        isOnline: true,
      },
      lastMessage: {
        id: 'msg-1',
        senderId: 'user-1',
        content: 'Hola',
        isAttachment: false,
        attachmentType: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      unreadCount: 0,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: conversation });

    const result = await getOrCreateConversation('user-1');

    expect(result).toEqual(conversation);
  });

  it('debe propagar el error del backend cuando el contacto no existe', async () => {
    const backendError = new Error('UserNotFoundException');
    vi.spyOn(apiClient, 'post').mockRejectedValue(backendError);

    await expect(
      getOrCreateConversation('user-inexistente'),
    ).rejects.toThrow('UserNotFoundException');
  });
});

describe('chat-api — sendMessage (HU-03 Tarea 2)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearStoredMessages();
  });

  it('debe responder dentro del umbral esperado (< 2 segundos)', async () => {
    const startTime = Date.now();

    const response = await sendMessage({
      conversationId: 'conv-1',
      content:
        'Mensaje con tiempo de respuesta controlado',
    });

    const elapsedTime =
      Date.now() - startTime;

    expect(elapsedTime).toBeLessThan(
      2000,
    );

    expect(response.ok).toBe(true);
  });

  it('debe retornar un payload estructurado con el mensaje registrado en operacion exitosa', async () => {
    const response = await sendMessage(
      {
        conversationId: 'conv-1',
        senderId: 'current-user',
        content:
          'Hola mundo desde el mock API',
      },
      {
        latencyMs: 10,
      },
    );

    expect(response.statusCode).toBe(
      201,
    );

    expect(response.ok).toBe(true);

    expect(response.detail).toBe(
      'Mensaje enviado exitosamente',
    );

    expect(response.data).toBeDefined();

    expect(response.data.id).toMatch(
      /^msg-/,
    );

    expect(
      response.data.conversationId,
    ).toBe('conv-1');

    expect(response.data.senderId).toBe(
      'current-user',
    );

    expect(response.data.content).toBe(
      'Hola mundo desde el mock API',
    );

    expect(response.data.status).toBe(
      'sent',
    );

    expect(
      typeof response.data.timestamp,
    ).toBe('string');

    expect(
      typeof response.data.createdAt,
    ).toBe('string');
  });

  it('debe persistir el mensaje enviado en el almacenamiento local', async () => {
    const response = await sendMessage(
      {
        conversationId: 'conv-2',
        content:
          'Mensaje persistido via sendMessage',
      },
      {
        latencyMs: 10,
      },
    );

    const stored =
      getStoredMessages();

    const found = stored.find(
      (message) =>
        message.id === response.data.id,
    );

    expect(found).toBeDefined();

    expect(found?.content).toBe(
      'Mensaje persistido via sendMessage',
    );
  });

  it('debe rechazar la promesa ante simulacion de caida de red (forceOffline)', async () => {
    await expect(
      sendMessage(
        {
          conversationId: 'conv-1',
          content:
            'Mensaje que fallara por modo offline',
        },
        {
          forceOffline: true,
          latencyMs: 10,
        },
      ),
    ).rejects.toThrow(
      'Error de red: Sin conexion a internet',
    );
  });

  it('debe rechazar la promesa ante simulacion de fallo del servidor (forceError)', async () => {
    await expect(
      sendMessage(
        {
          conversationId: 'conv-1',
          content:
            'Mensaje que fallara por error de servidor',
        },
        {
          forceError: true,
          latencyMs: 10,
        },
      ),
    ).rejects.toThrow(
      'Error del servidor: No se pudo procesar el envio del mensaje',
    );
  });

  it('debe detectar cuando el navegador no tiene conexion a internet (navigator.onLine === false)', async () => {
    const originalOnLine =
      navigator.onLine;

    Object.defineProperty(
      navigator,
      'onLine',
      {
        value: false,
        configurable: true,
        writable: true,
      },
    );

    try {
      await expect(
        sendMessage(
          {
            conversationId: 'conv-1',
            content:
              'Mensaje offline por navigator',
          },
          {
            latencyMs: 10,
          },
        ),
      ).rejects.toThrow(
        'Error de red: Sin conexion a internet',
      );
    } finally {
      Object.defineProperty(
        navigator,
        'onLine',
        {
          value: originalOnLine,
          configurable: true,
          writable: true,
        },
      );
    }
  });

  it('debe rechazar si el contenido del mensaje esta vacio o solo contiene espacios', async () => {
    await expect(
      sendMessage({
        conversationId: 'conv-1',
        content: '   ',
      }),
    ).rejects.toThrow(
      'El contenido del mensaje no puede estar vacio',
    );
  });

  it('debe rechazar si falta el conversationId', async () => {
    await expect(
      sendMessage({
        conversationId: '',
        content:
          'Mensaje sin conversacion',
      }),
    ).rejects.toThrow(
      'El identificador de conversacion es requerido',
    );
  });

  it('debe llamar a POST /chat/messages y retornar mensaje creado cuando el backend responde', async () => {
    apiClientMock.post.mockResolvedValueOnce({
      data: {
        statusCode: 201,
        ok: true,
        detail: 'Mensaje enviado exitosamente',
        data: {
          id: 'msg-created-backend',
          conversationId: 'conv-real-uuid',
          senderId: 'user-current',
          content: 'Mensaje en tiempo real',
          createdAt: '2026-10-14T03:10:00.000Z',
          timestamp: '2026-10-14T03:10:00.000Z',
          status: 'sent',
          isAttachment: false,
          attachmentType: null,
        },
      },
    } as never);

    const response = await sendMessage({
      conversationId: 'conv-real-uuid',
      content: 'Mensaje en tiempo real',
      senderId: 'user-current',
    });

    expect(apiClientMock.post).toHaveBeenCalledWith('/chat/messages', {
      conversationId: 'conv-real-uuid',
      content: 'Mensaje en tiempo real',
    });
    expect(response.data.id).toBe('msg-created-backend');
    expect(response.data.content).toBe('Mensaje en tiempo real');
  });
});

describe('chat-api — persistencia de estado leido y no redisparo de alertas tras recarga', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearStoredMessages();
  });

  it('debe mantener guardado el estado leido (unreadCount: 0) al simular recarga de pagina tras marcar conversacion como leida', async () => {
    // 1. Inicialmente conv-1 tiene unreadCount: 2
    const initialList = await getConversations();
    const conv1Initial = initialList.find((c) => c.id === 'conv-1');
    expect(conv1Initial?.unreadCount).toBe(2);

    // 2. El usuario revisa/marca la conversacion como leida
    await markConversationAsRead('conv-1');

    // 3. Simular recarga de pagina (F5) volviendo a invocar getConversations
    const reloadedList = await getConversations();
    const conv1Reloaded = reloadedList.find((c) => c.id === 'conv-1');

    // Debe conservar unreadCount: 0 sin redisparar la notificacion
    expect(conv1Reloaded?.unreadCount).toBe(0);

    // Otras conversaciones que no han sido leidas mantienen su conteo
    const conv3Reloaded = reloadedList.find((c) => c.id === 'conv-3');
    expect(conv3Reloaded?.unreadCount).toBe(1);
  });

  it('debe marcar la conversacion como leida de forma persistente al enviar un mensaje y conservarlo tras recargar', async () => {
    // Inicialmente conv-1 tiene mensajes no leidos
    const initialList = await getConversations();
    expect(initialList.find((c) => c.id === 'conv-1')?.unreadCount).toBe(2);

    // Enviar mensaje en conv-1
    await sendMessage({
      conversationId: 'conv-1',
      content: 'Mensaje de prueba de reordenamiento',
    });

    // Simular recarga de pagina (F5)
    const reloadedList = await getConversations();
    const conv1 = reloadedList.find((c) => c.id === 'conv-1');

    expect(conv1?.unreadCount).toBe(0);
  });
});