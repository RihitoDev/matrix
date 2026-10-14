import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConversations } from '../hooks/use-conversations';
import * as chatApi from '../services/chat-api';
import { User } from '../types/user.types';
import { Conversation } from '../types/conversation.types';

const mockList = [
  {
    id: 'c1',
    contact: { id: 'u1', fullName: 'Ana Gomez', avatarUrl: null, isOnline: true },
    lastMessage: { id: 'm1', senderId: 'u1', content: 'Msg 1', isAttachment: false, createdAt: '2026-03-01T10:00:00Z' },
    unreadCount: 2,
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'c2',
    contact: { id: 'u2', fullName: 'Beto Lopez', avatarUrl: null, isOnline: false },
    lastMessage: { id: 'm2', senderId: 'u2', content: 'Msg 2', isAttachment: false, createdAt: '2026-03-02T10:00:00Z' },
    unreadCount: 0,
    updatedAt: '2026-03-02T10:00:00Z',
  },
];

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'u-default',
  fullName: 'Default User',
  role: 'GRADUATE',
  avatarUrl: null,
  headline: null,
  isActive: true,
  ...overrides,
});

describe('useConversations Hook', () => {
  it('debe cargar conversaciones, filtrar por texto y por no leidos', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

    const { result } = renderHook(() => useConversations());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations.length).toBe(2);

    act(() => {
      result.current.setActiveFilter('unread');
    });
    expect(result.current.conversations.length).toBe(1);
    expect(result.current.conversations[0].contact.fullName).toBe('Ana Gomez');

    act(() => {
      result.current.setActiveFilter('all');
      result.current.setSearchQuery('beto');
    });
    expect(result.current.conversations.length).toBe(1);
    expect(result.current.conversations[0].contact.fullName).toBe('Beto Lopez');
  });

  it('debe resetear los no leidos al seleccionar una conversacion y permitir limpiar seleccion', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);
    const markSpy = vi.spyOn(chatApi, 'markConversationAsRead');

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleSelectConversation(mockList[0]);
    });

    expect(result.current.selectedId).toBe('c1');
    expect(markSpy).toHaveBeenCalledWith('c1');
    const selectedItem = result.current.conversations.find((c) => c.id === 'c1');
    expect(selectedItem?.unreadCount).toBe(0);

    act(() => {
      result.current.clearSelectedConversation();
    });
    expect(result.current.selectedId).toBeNull();
  });

  it('debe simular mensajes entrantes reordenando al inicio', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.simulateIncomingMessage('c1', 'Nuevo mensaje');
    });

    expect(result.current.conversations[0].id).toBe('c1');
    expect(result.current.conversations[0].lastMessage?.content).toBe('Nuevo mensaje');
  });

  it('debe manejar error si falla la peticion al servicio', async () => {
    vi.spyOn(chatApi, 'getConversations').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });

  it('debe permitir paginacion y cargar mas elementos', async () => {
    const manyItems = Array.from({ length: 15 }, (_, i) => ({
      id: `item-${i}`,
      contact: { id: `u-${i}`, fullName: `Usuario ${i}`, avatarUrl: null, isOnline: false },
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date(Date.now() - i * 1000).toISOString(),
    }));

    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(manyItems);

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations.length).toBe(10);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.conversations.length).toBe(15);
    expect(result.current.hasMore).toBe(false);
  });

  it('debe abrir la conversacion existente al iniciar chat con un contacto ya presente', async () => {
  vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);
  const existing = mockList[0];
  const spy = vi.spyOn(chatApi, 'getOrCreateConversation').mockResolvedValue(existing);

  const { result } = renderHook(() => useConversations());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.startConversationWithContact(
      buildUser({ id: existing.contact.id, fullName: existing.contact.fullName })
    );
  });

  expect(result.current.selectedId).toBe(existing.id);
  expect(spy).not.toHaveBeenCalled();

  // No duplicados
  const matches = result.current.conversations.filter(
    (c) => c.contact.id === existing.contact.id
  );
  expect(matches.length).toBe(1);
});

it('debe crear y abrir una conversacion nueva sin duplicarla en la lista', async () => {
  vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

  const brandNew = {
    id: 'c-new',
    contact: { id: 'u-new', fullName: 'Nuevo Contacto', avatarUrl: null, isOnline: false },
    lastMessage: null,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  };
  vi.spyOn(chatApi, 'getOrCreateConversation').mockResolvedValue(brandNew);

  const { result } = renderHook(() => useConversations());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.startConversationWithContact(
      buildUser({ id: 'u-new', fullName: 'Nuevo Contacto' })
    );
  });

  expect(result.current.selectedId).toBe('c-new');
  expect(result.current.conversations.find((c) => c.id === 'c-new')).toBeDefined();
});

it('debe ignorar clics rapidos mientras una seleccion esta en proceso', async () => {
  vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

  let resolveFirst: (value: Conversation) => void = () => {};
const pendingPromise = new Promise<Conversation>((resolve) => {
  resolveFirst = resolve;
});
const spy = vi
  .spyOn(chatApi, 'getOrCreateConversation')
  .mockReturnValue(pendingPromise);

  const { result } = renderHook(() => useConversations());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // primera llamada
  act(() => {
    result.current.startConversationWithContact(buildUser({ id: 'u-extra-1' }));
  });

  // ignorar seguna llamada
  await act(async () => {
    await result.current.startConversationWithContact(buildUser({ id: 'u-extra-2' }));
  });

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith('u-extra-1');

  resolveFirst({
    id: 'c-cleanup',
    contact: { id: 'u-extra-1', fullName: 'X', avatarUrl: null, isOnline: false },
    lastMessage: null,
    unreadCount: 0,
    updatedAt: '',
  });
});
});

