import { describe, it, expect, beforeEach } from 'vitest';

import {
  getConversations,
  searchUsers,
  getMessages,
  getPaginatedMessages,
  getOrCreateConversation,
  sendMessage,
  markConversationAsRead,
} from '../services/chat-api';

import { CURRENT_USER_ID } from '../mocks/mock-users';
import { MOCK_CONVERSATIONS } from '../mocks/mock-conversations';
import {
  getStoredMessages,
  clearStoredMessages,
} from '../services/message-storage';

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
});

describe('chat-api — searchUsers', () => {
  it('debe retornar lista vacia si la query tiene menos de 2 caracteres', async () => {
    expect(await searchUsers('')).toEqual([]);
    expect(await searchUsers('a')).toEqual([]);
    expect(await searchUsers(' ')).toEqual([]);
    expect(await searchUsers('  a  ')).toEqual([]);
  });

  it('debe encontrar usuarios por coincidencia parcial de nombre', async () => {
    const results = await searchUsers('maria');

    expect(results.length).toBeGreaterThan(0);

    results.forEach((user) => {
      expect(
        user.fullName.toLowerCase(),
      ).toContain('maria');
    });
  });

  it('debe ignorar mayusculas y tildes', async () => {
    const lower = await searchUsers('maria');
    const upper = await searchUsers('MARIA');
    const accented = await searchUsers('maría');

    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBe(accented.length);

    const lowerIds = lower.map((u) => u.id).sort();
    const upperIds = upper.map((u) => u.id).sort();
    const accentedIds = accented.map((u) => u.id).sort();

    expect(lowerIds).toEqual(upperIds);
    expect(lowerIds).toEqual(accentedIds);
  });

  it('no debe incluir al currentUser en los resultados', async () => {
    const results = await searchUsers('yo');

    expect(
      results.find((u) => u.id === CURRENT_USER_ID),
    ).toBeUndefined();
  });

  it('no debe incluir usuarios inactivos', async () => {
    const results = await searchUsers('ar');

    expect(results.length).toBeGreaterThan(0);

    results.forEach((user) => {
      expect(user.isActive).toBe(true);
    });
  });

  it('debe retornar lista vacia si la conversacion no tiene mensajes', async () => {
    const messages = await getMessages('conv-empty');

    expect(messages).toEqual([]);
  });

  it('debe tratar caracteres especiales como texto plano', async () => {
    await expect(searchUsers("'")).resolves.toEqual([]);
    await expect(searchUsers('"')).resolves.toEqual([]);
    await expect(searchUsers(';')).resolves.toEqual([]);
    await expect(searchUsers('%')).resolves.toEqual([]);
    await expect(
      searchUsers("' OR 1=1 --"),
    ).resolves.toEqual([]);
    await expect(
      searchUsers('<script>'),
    ).resolves.toEqual([]);
  });

  it('no debe exponer campos sensibles como email o telefono', async () => {
    const results = await searchUsers('ar');

    expect(results.length).toBeGreaterThan(0);

    results.forEach((user) => {
      const keys = Object.keys(user);

      expect(keys).not.toContain('email');
      expect(keys).not.toContain('phone');
      expect(keys).not.toContain('phoneNumber');
    });
  });

  it('debe filtrar 100+ usuarios en menos de 50 ms de computo', async () => {
    const start = performance.now();

    await searchUsers('ar');

    const elapsed = performance.now() - start;
    const computeTime = elapsed - 200;

    expect(computeTime).toBeLessThan(50);
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

/*
 * Pruebas de la tarea #383.
 *
 * Verifican el servicio paginado utilizado para cargar
 * el historial de mensajes de una conversacion.
 */
describe('chat-api — getPaginatedMessages', () => {
  it('debe retornar la pagina mas reciente del historial', async () => {
    const result = await getPaginatedMessages({
      conversationId: 'conv-1',
      limit: 10,
    });

    expect(result.data).toHaveLength(10);

    expect(result.data[0].id).toBe(
      'msg-1-21',
    );

    expect(result.data[9].id).toBe(
      'msg-1-30',
    );

    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe(
      'msg-1-21',
    );
  });

  it('debe cargar la pagina anterior utilizando el cursor', async () => {
    const result = await getPaginatedMessages({
      conversationId: 'conv-1',
      cursor: 'msg-1-21',
      limit: 10,
    });

    expect(result.data).toHaveLength(10);

    expect(result.data[0].id).toBe(
      'msg-1-11',
    );

    expect(result.data[9].id).toBe(
      'msg-1-20',
    );

    expect(result.hasMore).toBe(true);

    expect(result.nextCursor).toBe(
      'msg-1-11',
    );
  });

  it('debe indicar cuando se alcanza el inicio del historial', async () => {
    const result = await getPaginatedMessages({
      conversationId: 'conv-1',
      cursor: 'msg-1-11',
      limit: 10,
    });

    expect(result.data).toHaveLength(10);

    expect(result.data[0].id).toBe(
      'msg-1-01',
    );

    expect(result.data[9].id).toBe(
      'msg-1-10',
    );

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
    await expect(
      getPaginatedMessages({
        conversationId: 'conv-1',
        cursor: 'cursor-inexistente',
        limit: 10,
      }),
    ).rejects.toThrow(
      'Cursor de mensajes no valido',
    );
  });
});

describe('chat-api — getOrCreateConversation', () => {
  it('debe retornar la conversacion existente si ya hay una con ese contacto', async () => {
    const existing = MOCK_CONVERSATIONS[0];

    const result =
      await getOrCreateConversation(
        existing.contact.id,
      );

    expect(result.id).toBe(existing.id);
    expect(result.contact.id).toBe(
      existing.contact.id,
    );
  });

  it('debe crear una conversacion nueva si no existe con ese contacto', async () => {
    const result =
      await getOrCreateConversation(
        'user-105',
      );

    expect(result.id).toBeDefined();
    expect(result.contact.id).toBe(
      'user-105',
    );
    expect(result.contact.fullName).toBeTruthy();
    expect(result.lastMessage).toBeNull();
    expect(result.unreadCount).toBe(0);
    expect(result.contact.isOnline).toBe(
      false,
    );
  });

  it('debe lanzar error si el contacto no existe', async () => {
    await expect(
      getOrCreateConversation(
        'user-inexistente',
      ),
    ).rejects.toThrow(
      'UserNotFoundException',
    );
  });

  it('no debe mutar MOCK_CONVERSATIONS al crear una conversacion nueva', async () => {
    const before =
      MOCK_CONVERSATIONS.length;

    await getOrCreateConversation(
      'user-106',
    );

    expect(
      MOCK_CONVERSATIONS.length,
    ).toBe(before);
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