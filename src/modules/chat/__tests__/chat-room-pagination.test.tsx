import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ChatRoom } from '../components/chat-room';
import {
  Conversation,
  Message,
} from '../types/conversation.types';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockConversation: Conversation = {
  id: 'conv-test-pagination',
  contact: {
    id: 'user-contact-1',
    fullName: 'Maria Fernandez',
    avatarUrl: null,
    isOnline: true,
  },
  lastMessage: null,
  unreadCount: 0,
  updatedAt: new Date().toISOString(),
};

const createMessage = (
  id: string,
  content: string,
): Message => ({
  id,
  conversationId: 'conv-test-pagination',
  senderId: 'user-contact-1',
  content,
  timestamp: new Date().toISOString(),
  status: 'sent',
  createdAt: new Date().toISOString(),
});

const initialMessages: Message[] = [
  createMessage('msg-11', 'Mensaje 11'),
  createMessage('msg-12', 'Mensaje 12'),
];

describe('ChatRoom - carga de mensajes anteriores (#387)', () => {
  it('debe solicitar mensajes anteriores al hacer scroll cerca del inicio', async () => {
    const onLoadMoreMessages = vi
      .fn()
      .mockResolvedValue(undefined);

    const { rerender } = render(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages={false}
        onLoadMoreMessages={onLoadMoreMessages}
      />,
    );

    const container =
      screen.getByTestId('messages-container');

    Object.defineProperty(container, 'clientHeight', {
      configurable: true,
      value: 400,
    });

    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      value: 1000,
    });

    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 50,
    });

    rerender(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages
        onLoadMoreMessages={onLoadMoreMessages}
      />,
    );

    onLoadMoreMessages.mockClear();

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(
      onLoadMoreMessages,
    ).toHaveBeenCalledTimes(1);
  });

  it('no debe solicitar mensajes anteriores si el usuario no esta cerca del inicio', async () => {
    const onLoadMoreMessages = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages
        onLoadMoreMessages={onLoadMoreMessages}
      />,
    );

    const container =
      screen.getByTestId('messages-container');

    Object.defineProperty(container, 'clientHeight', {
      configurable: true,
      value: 400,
    });

    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      value: 1000,
    });

    onLoadMoreMessages.mockClear();

    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 200,
    });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(
      onLoadMoreMessages,
    ).not.toHaveBeenCalled();
  });

  it('no debe cargar mensajes anteriores cuando no existen mas paginas', async () => {
    const onLoadMoreMessages = vi
      .fn()
      .mockResolvedValue(undefined);

    render(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages={false}
        onLoadMoreMessages={onLoadMoreMessages}
      />,
    );

    const container =
      screen.getByTestId('messages-container');

    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });

    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(
      onLoadMoreMessages,
    ).not.toHaveBeenCalled();
  });

  it('debe mostrar el indicador mientras se cargan mensajes anteriores', () => {
    render(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages
        onLoadMoreMessages={vi.fn()}
        isLoadingMoreMessages
      />,
    );

    expect(
      screen.getByTestId('loading-older-messages'),
    ).toBeDefined();

    expect(
      screen.getByText(
        'Cargando mensajes anteriores...',
      ),
    ).toBeDefined();
  });

  it('debe mostrar el inicio de la conversacion cuando ya no existen mensajes anteriores', () => {
    render(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages={false}
        onLoadMoreMessages={vi.fn()}
        isLoadingMessages={false}
        isLoadingMoreMessages={false}
      />,
    );

    expect(
      screen.getByTestId('start-of-conversation'),
    ).toBeDefined();

    expect(
      screen.getByText(
        'Inicio de la conversacion',
      ),
    ).toBeDefined();
  });

  it('debe mantener la posicion del scroll al agregar mensajes anteriores', async () => {
    let resolveLoad: (() => void) | undefined;

    const onLoadMoreMessages = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    
    const { rerender } = render(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages={false}
        onLoadMoreMessages={onLoadMoreMessages}
      />,
    );

    const container =
      screen.getByTestId('messages-container');

    Object.defineProperty(container, 'clientHeight', {
      configurable: true,
      value: 400,
    });

    let scrollHeight = 500;

    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 50,
    });

    
    rerender(
      <ChatRoom
        conversation={mockConversation}
        messages={initialMessages}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={vi.fn()}
        hasMoreMessages
        onLoadMoreMessages={onLoadMoreMessages}
      />,
    );

    expect(
      onLoadMoreMessages,
    ).not.toHaveBeenCalled();


    await act(async () => {
      fireEvent.scroll(container);
    });

    expect(
      onLoadMoreMessages,
    ).toHaveBeenCalledTimes(1);

    const previousMessages: Message[] = [
      createMessage('msg-09', 'Mensaje 9'),
      createMessage('msg-10', 'Mensaje 10'),
      ...initialMessages,
    ];


    scrollHeight = 700;

    await act(async () => {
      rerender(
        <ChatRoom
          conversation={mockConversation}
          messages={previousMessages}
          currentUserId="current-user"
          onBack={vi.fn()}
          onSendMessage={vi.fn()}
          hasMoreMessages={false}
          onLoadMoreMessages={onLoadMoreMessages}
          isLoadingMoreMessages={false}
        />,
      );
    });

    await act(async () => {
      resolveLoad?.();
    });

    expect(container.scrollTop).toBe(250);
  });
});