import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { ChatView } from '../views/chat-view';
import ChatPage from '../../../app/chat/page';
import * as chatApi from '../services/chat-api';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockList = [
  {
    id: 'conv-1',
    contact: {
      id: 'u1',
      fullName: 'Maria Fernandez',
      avatarUrl: 'https://example.com/a.jpg',
      isOnline: true,
    },
    lastMessage: {
      id: 'm1',
      senderId: 'u1',
      content: 'Hola',
      isAttachment: false,
      createdAt: new Date().toISOString(),
    },
    unreadCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2',
    contact: {
      id: 'u2',
      fullName: 'Carlos Ramos',
      avatarUrl: null,
      isOnline: false,
    },
    lastMessage: null,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  },
];

const renderWithQueryClient = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
};

describe('ChatView & ChatPage', () => {
  it('debe renderizar ChatView con estado vacio y permitir seleccionar conversacion', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

    renderWithQueryClient(<ChatView />);

    await waitFor(() => {
      expect(screen.getByText('Maria Fernandez')).toBeDefined();
    });

    expect(
      screen.getByText(/Selecciona una conversacion/i),
    ).toBeDefined();

    const newChatButtons = screen.getAllByText(
      'Iniciar una nueva conversacion',
    );

    fireEvent.click(newChatButtons[0]);

    expect(
      await screen.findByText('Nueva conversación'),
    ).toBeDefined();

    const conversationItem = screen.getByText('Maria Fernandez');

    fireEvent.click(conversationItem);

    expect(
      screen.getByText('Sala de chat con Maria Fernandez'),
    ).toBeDefined();

    expect(screen.getByText('En linea')).toBeDefined();

    const backButton = screen.getByLabelText(
      'Volver a la lista de chats',
    );

    fireEvent.click(backButton);

    expect(
      screen.getByText(/Selecciona una conversacion/i),
    ).toBeDefined();
  });

  it('debe renderizar la conversacion seleccionada sin foto mostrando desconectado', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

    renderWithQueryClient(<ChatView />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Ramos')).toBeDefined();
    });

    const item = screen.getByText('Carlos Ramos');

    fireEvent.click(item);

    expect(
      screen.getByText('Sala de chat con Carlos Ramos'),
    ).toBeDefined();

    expect(screen.getByText('Desconectado')).toBeDefined();
  });

  it('debe conmutar de unread a all y abrir modal al pulsar nueva conversacion', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

    renderWithQueryClient(<ChatView />);

    await waitFor(() => {
      expect(screen.getByText('Maria Fernandez')).toBeDefined();
    });

    const unreadTab = screen.getByText('Sin leer');

    fireEvent.click(unreadTab);

    const newBtn = screen.getByText(
      'Iniciar una nueva conversacion',
    );

    fireEvent.click(newBtn);

    expect(
      await screen.findByText('Nueva conversación'),
    ).toBeDefined();
  });

  it('debe renderizar ChatPage montando ChatView', async () => {
    vi.spyOn(chatApi, 'getConversations').mockResolvedValue(mockList);

    renderWithQueryClient(<ChatPage />);

    expect(screen.getByText('Chats')).toBeDefined();
  });
});
