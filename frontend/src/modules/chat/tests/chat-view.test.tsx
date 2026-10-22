
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import type { ReactNode } from 'react';

import { ChatView } from '../views/chat-view';
import ChatPage from '@/app/(app)/chat/page';
import AppLayout from '@/app/(app)/layout';

import { stubMatchMedia } from '@/shared/testing/stub-match-media';

import * as chatApi from '../services/chat-api';

import type { Conversation } from '../types/conversation.types';

vi.mock('next/navigation', () => ({
  usePathname: () => '/chat',
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/modules/auth', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/modules/auth')>();

  return {
    ...actual,
    SessionUserCard: () => null,
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

// Usuarios genéricos exclusivos de las pruebas.
// No se consultan ni se insertan en la base de datos.
const testConversations: Conversation[] = [
  {
    id: 'test-conversation-1',
    contact: {
      id: 'test-user-1',
      fullName: 'Usuario de Prueba 1',
      avatarUrl: null,
      isOnline: true,
    },
    lastMessage: null,
    unreadCount: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-conversation-2',
    contact: {
      id: 'test-user-2',
      fullName: 'Usuario de Prueba 2',
      avatarUrl: null,
      isOnline: false,
    },
    lastMessage: null,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  },
];

function renderWithQueryClient(ui: ReactNode) {
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
}

describe('ChatView & ChatPage', () => {
  it('debe mostrar las conversaciones obtenidas mediante el servicio', async () => {
    vi.spyOn(chatApi, 'getConversations')
      .mockResolvedValue(testConversations);

    renderWithQueryClient(<ChatView />);

    expect(
      await screen.findByText('Usuario de Prueba 1'),
    ).toBeDefined();

    expect(
      screen.getByText('Usuario de Prueba 2'),
    ).toBeDefined();
  });

  it('debe seleccionar una conversación y mostrar el contacto conectado', async () => {
    vi.spyOn(chatApi, 'getConversations')
      .mockResolvedValue(testConversations);

    renderWithQueryClient(<ChatView />);

    const conversationItem =
      await screen.findByText('Usuario de Prueba 1');

    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(
        screen.getByTestId('chat-contact-name')
          .textContent,
      ).toBe('Usuario de Prueba 1');
    });

    expect(
      screen.getByText('En línea'),
    ).toBeDefined();

    expect(
      screen.getByTestId('chat-room'),
    ).toBeDefined();
  });

  it('debe seleccionar una conversación y mostrar el contacto desconectado', async () => {
    vi.spyOn(chatApi, 'getConversations')
      .mockResolvedValue(testConversations);

    renderWithQueryClient(<ChatView />);

    const conversationItem =
      await screen.findByText('Usuario de Prueba 2');

    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(
        screen.getByTestId('chat-contact-name')
          .textContent,
      ).toBe('Usuario de Prueba 2');
    });

    expect(
      screen.getByText('Desconectado'),
    ).toBeDefined();
  });

  it('debe cambiar el filtro y abrir el modal de nueva conversación', async () => {
    vi.spyOn(chatApi, 'getConversations')
      .mockResolvedValue(testConversations);

    renderWithQueryClient(<ChatView />);

    await screen.findByText('Usuario de Prueba 1');

    const unreadTab = screen.getByText('Sin leer');

    fireEvent.click(unreadTab);

    const newChatButton = screen.getByText(
      'Iniciar una nueva conversacion',
    );

    fireEvent.click(newChatButton);

    expect(
      await screen.findByText(/Nueva conversación/i),
    ).toBeDefined();
  });

  it('debe renderizar la página de chat con una sola navegación principal', async () => {
    stubMatchMedia();

    sessionStorage.setItem(
      'accessToken',
      `h.${btoa(JSON.stringify({
        roleTag: 'titulado',
      }))}.s`,
    );

    vi.spyOn(chatApi, 'getConversations')
      .mockResolvedValue(testConversations);

    renderWithQueryClient(
      <AppLayout>
        <ChatPage />
      </AppLayout>,
    );

    expect(
      screen.getByText('Chats'),
    ).toBeDefined();

    expect(
      screen.getAllByRole('navigation', {
        name: 'Menú principal',
      }),
    ).toHaveLength(1);

    expect(
      screen.getByRole('link', {
        name: 'Chat',
      }),
    ).toHaveAttribute('href', '/chat');

    expect(
      await screen.findByText('Usuario de Prueba 1'),
    ).toBeDefined();
  });
});
