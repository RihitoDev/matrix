import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ChatRoom } from '../components/chat-room';
import { MessageInputBar } from '../components/message-input-bar';
import { Conversation, Message } from '../types/conversation.types';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockConversation: Conversation = {
  id: 'conv-test-1',
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

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-test-1',
    senderId: 'user-contact-1',
    content: 'Hola, buenas tardes',
    timestamp: new Date().toISOString(),
    status: 'sent',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-test-1',
    senderId: 'current-user',
    content: 'Hola Maria, como estas?',
    timestamp: new Date().toISOString(),
    status: 'sent',
    createdAt: new Date().toISOString(),
  },
];

describe('ChatRoom Layout y Componentes Responsivos (HU-03 Tarea 3)', () => {
  it('debe mantener la barra de redaccion fija en la parte inferior con clases shrink-0 y border-t', () => {
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(
      <MessageInputBar
        value="Texto de prueba"
        onChange={onChange}
        onSend={onSend}
      />
    );

    const inputBar = screen.getByTestId('message-input-bar');
    expect(inputBar).toBeDefined();
    expect(inputBar.className).toContain('shrink-0');
    expect(inputBar.className).toContain('border-t');
    expect(inputBar.className).toContain('bg-white');

    const textarea = screen.getByTestId('message-textarea');
    expect(textarea).toBeDefined();
    expect(textarea.getAttribute('placeholder')).toBe('Escribe un mensaje...');

    const counter = screen.getByTestId('character-counter');
    expect(counter.textContent).toBe('15/500');

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDefined();
  });

  it('debe contar con contenedor de mensajes con scroll vertical independiente (overflow-y-auto)', () => {
    const onBack = vi.fn();
    const onSend = vi.fn();

    render(
      <ChatRoom
        conversation={mockConversation}
        messages={mockMessages}
        currentUserId="current-user"
        onBack={onBack}
        onSendMessage={onSend}
      />
    );

    const messagesContainer = screen.getByTestId('messages-container');
    expect(messagesContainer).toBeDefined();
    expect(messagesContainer.className).toContain('overflow-y-auto');
    expect(messagesContainer.className).toContain('flex-1');
    expect(messagesContainer.className).toContain('min-h-0');

    expect(screen.getByText('Hola, buenas tardes')).toBeDefined();
    expect(screen.getByText('Hola Maria, como estas?')).toBeDefined();
    expect(screen.getByTestId('messages-scroll-anchor')).toBeDefined();
  });

  it('debe responder adecuadamente en resoluciones moviles y permitir volver atras con el boton', () => {
    const onBack = vi.fn();
    const onSend = vi.fn();

    render(
      <ChatRoom
        conversation={mockConversation}
        messages={[]}
        currentUserId="current-user"
        onBack={onBack}
        onSendMessage={onSend}
      />
    );

    const backButton = screen.getByTestId('chat-back-button');
    expect(backButton).toBeDefined();
    expect(backButton.className).toContain('md:hidden');

    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);

    expect(screen.getByText('Maria Fernandez')).toBeDefined();
    expect(screen.getByText('En linea')).toBeDefined();
  });

  it('debe deshabilitar el boton de enviar cuando el input esta vacio', () => {
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(
      <MessageInputBar
        value="   "
        onChange={onChange}
        onSend={onSend}
      />
    );

    const sendButton = screen.getByTestId('send-button') as HTMLButtonElement;
    expect(sendButton.disabled).toBe(true);

    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });
});

