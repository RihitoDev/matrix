import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatView } from '../views/chat-view';
import { ChatRoom } from '../components/chat-room';
import * as chatApi from '../services/chat-api';
import type { Conversation } from '../types/conversation.types';

const conversation: Conversation = {
  id: 'empty-chat',
  contact: { id: 'contact', fullName: 'Ana Pérez', avatarUrl: null, isOnline: false },
  lastMessage: null,
  unreadCount: 0,
  updatedAt: '2026-10-05T12:00:00Z',
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderChat() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><ChatView /></QueryClientProvider>);
}

describe('Estados del chat', () => {
  it('muestra carga, error y permite recuperar la lista sin mostrar un falso vacío', async () => {
    let rejectLoad!: (reason: Error) => void;
    vi.spyOn(chatApi, 'getConversations')
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectLoad = reject; }))
      .mockResolvedValueOnce([conversation]);
    renderChat();
    expect(screen.getByRole('status', { name: 'Cargando conversaciones' })).toBeDefined();
    await act(async () => { rejectLoad(new Error('network')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus conversaciones');
    expect(screen.queryByText('Aun no tienes ninguna conversacion registrada.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Ana Pérez')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('distingue carga y error del historial vacío y recupera la conversación al reintentar', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue([conversation]);
    let rejectLoad!: (reason: Error) => void;
    vi.spyOn(chatApi, 'getPaginatedMessages')
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectLoad = reject; }))
      .mockResolvedValue({ data: [], hasMore: false, nextCursor: null });
    renderChat();
    fireEvent.click(await screen.findByText('Ana Pérez'));
    expect(screen.getByText('Cargando mensajes...')).toBeDefined();
    expect(screen.queryByText(/Aún no hay mensajes/)).toBeNull();
    await act(async () => { rejectLoad(new Error('network')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los mensajes');
    expect(screen.queryByText(/Aún no hay mensajes/)).toBeNull();
    expect(screen.getByTestId('message-textarea')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText(/Aún no hay mensajes/)).toBeDefined();
    expect(screen.getByTestId('message-textarea')).not.toBeDisabled();
  });

  it('conserva el borrador tras fallar el envío y lo limpia solo cuando se envía correctamente', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue([conversation]);
    vi.spyOn(chatApi, 'getPaginatedMessages').mockResolvedValue({ data: [], hasMore: false, nextCursor: null });
    const send = vi.spyOn(chatApi, 'sendMessage')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ statusCode: 201, ok: true, detail: 'ok', data: {
        id: 'sent', conversationId: conversation.id, senderId: 'me', content: 'Hola', status: 'sent',
        timestamp: conversation.updatedAt, createdAt: conversation.updatedAt,
      } });
    renderChat();
    fireEvent.click(await screen.findByText('Ana Pérez'));
    await screen.findByText(/Aún no hay mensajes/);
    fireEvent.change(screen.getByTestId('message-textarea'), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo enviar');
    expect(screen.getByTestId('message-textarea')).toHaveValue('Hola');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    await waitFor(() => expect(screen.getByTestId('message-textarea')).toHaveValue(''));
    expect(send).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('conserva mensajes visibles y evita reintentos automáticos de una página que falló', () => {
    const retry = vi.fn();
    render(<ChatRoom
      conversation={conversation}
      messages={[{
        id: 'message', conversationId: conversation.id, senderId: 'contact', content: 'Mensaje conservado',
        timestamp: conversation.updatedAt, createdAt: conversation.updatedAt, status: 'sent',
      }]}
      currentUserId="me" onBack={vi.fn()} onSendMessage={vi.fn()}
      hasMoreMessages isMessagesError isLoadingOlderError onLoadMoreMessages={retry}
    />);
    expect(screen.getByText('Mensaje conservado')).toBeDefined();
    fireEvent.scroll(screen.getByTestId('messages-container'));
    expect(retry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
