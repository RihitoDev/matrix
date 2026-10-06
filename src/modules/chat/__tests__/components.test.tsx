import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EmptyChatState } from '../components/empty-chat-state';
import { ConversationSkeleton } from '../components/conversation-skeleton';
import { ConversationItem } from '../components/conversation-item';
import { ConversationList } from '../components/conversation-list';
import { Conversation } from '../types/conversation.types';

afterEach(() => {
  cleanup();
});

const mockConversationWithAvatar: Conversation = {
  id: 'conv-1',
  contact: {
    id: 'user-1',
    fullName: 'Maria Fernandez',
    avatarUrl: 'https://example.com/avatar.jpg',
    isOnline: true,
  },
  lastMessage: {
    id: 'msg-1',
    senderId: 'user-1',
    content: 'Hola mundo',
    isAttachment: false,
    createdAt: new Date().toISOString(),
  },
  unreadCount: 3,
  updatedAt: new Date().toISOString(),
};

const mockConversationWithInitialsAndAttachment: Conversation = {
  id: 'conv-2',
  contact: {
    id: 'user-2',
    fullName: 'Pablo Perez',
    avatarUrl: null,
    isOnline: false,
  },
  lastMessage: {
    id: 'msg-2',
    senderId: 'user-2',
    content: 'archivo.pdf',
    isAttachment: true,
    attachmentType: 'file',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  unreadCount: 0,
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};

const mockConversationWithAudio: Conversation = {
  id: 'conv-3',
  contact: {
    id: 'user-3',
    fullName: 'Mario Alcocer',
    avatarUrl: null,
    isOnline: false,
  },
  lastMessage: {
    id: 'msg-3',
    senderId: 'user-3',
    content: 'audio.mp3',
    isAttachment: true,
    attachmentType: 'audio',
    createdAt: new Date().toISOString(),
  },
  unreadCount: 0,
  updatedAt: new Date().toISOString(),
};

const mockConversationWithoutMessages: Conversation = {
  id: 'conv-4',
  contact: {
    id: 'user-4',
    fullName: 'Claudia Torrico',
    avatarUrl: null,
    isOnline: false,
  },
  lastMessage: null,
  unreadCount: 0,
  updatedAt: new Date().toISOString(),
};

describe('Chat Components', () => {
  it('EmptyChatState debe renderizar texto y responder al boton', () => {
    const handleAction = vi.fn();
    render(
      <EmptyChatState
        description="Sin conversaciones"
        actionLabel="Iniciar chat"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('Sin conversaciones')).toBeDefined();
    const button = screen.getByText('Iniciar chat');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('ConversationSkeleton debe renderizarse sin errores', () => {
    const { container } = render(<ConversationSkeleton />);
    expect(container.querySelectorAll('.animate-pulse').length).toBe(4);
  });

  it('ConversationItem debe renderizar avatar, nombre, badge y disparar seleccion', () => {
    const handleSelect = vi.fn();
    const { container } = render(
      <ConversationItem
        conversation={mockConversationWithAvatar}
        isSelected={false}
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText('Maria Fernandez')).toBeDefined();
    expect(screen.getByText('Hola mundo')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();

    const button = container.querySelector('button')!;
    fireEvent.click(button);
    expect(handleSelect).toHaveBeenCalledWith(mockConversationWithAvatar);
  });

  it('ConversationItem debe mostrar iniciales y etiqueta de adjunto archivo', () => {
    render(
      <ConversationItem
        conversation={mockConversationWithInitialsAndAttachment}
        isSelected={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('PP')).toBeDefined();
    expect(screen.getByText(/\[Archivo\]/)).toBeDefined();
  });

  it('ConversationItem debe mostrar etiqueta de audio y texto de conversacion iniciada', () => {
    const { unmount } = render(
      <ConversationItem
        conversation={mockConversationWithAudio}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText(/\[Audio\]/)).toBeDefined();
    unmount();

    render(
      <ConversationItem
        conversation={mockConversationWithoutMessages}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('Conversacion iniciada')).toBeDefined();
  });

  it('ConversationList debe permitir buscar, cambiar filtros y cargar mas', () => {
    const handleSearch = vi.fn();
    const handleFilter = vi.fn();
    const handleLoadMore = vi.fn();

    render(
      <ConversationList
        conversations={[mockConversationWithAvatar]}
        selectedId={null}
        isLoading={false}
        hasMore={true}
        activeFilter="all"
        searchQuery=""
        onSelectConversation={vi.fn()}
        onFilterChange={handleFilter}
        onSearchChange={handleSearch}
        onLoadMore={handleLoadMore}
        onStartNewChat={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Buscar personas...');
    fireEvent.change(input, { target: { value: 'Maria' } });
    expect(handleSearch).toHaveBeenCalledWith('Maria');

    const unreadTab = screen.getByText('Sin leer');
    fireEvent.click(unreadTab);
    expect(handleFilter).toHaveBeenCalledWith('unread');

    const loadMoreBtn = screen.getByText('Cargar mas conversaciones');
    fireEvent.click(loadMoreBtn);
    expect(handleLoadMore).toHaveBeenCalled();
  });

  it('ConversationList debe mostrar los diferentes mensajes de estado vacio segun filtros', () => {
    const { rerender } = render(
      <ConversationList
        conversations={[]}
        selectedId={null}
        isLoading={false}
        hasMore={false}
        activeFilter="unread"
        searchQuery=""
        onSelectConversation={vi.fn()}
        onFilterChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    );
    expect(screen.getByText('No tienes mensajes sin leer.')).toBeDefined();

    rerender(
      <ConversationList
        conversations={[]}
        selectedId={null}
        isLoading={false}
        hasMore={false}
        activeFilter="all"
        searchQuery="TextoNoExistente"
        onSelectConversation={vi.fn()}
        onFilterChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    );
    expect(screen.getByText('No se encontraron conversaciones que coincidan con tu busqueda.')).toBeDefined();

    rerender(
      <ConversationList
        conversations={[]}
        selectedId={null}
        isLoading={false}
        hasMore={false}
        activeFilter="all"
        searchQuery=""
        onSelectConversation={vi.fn()}
        onFilterChange={vi.fn()}
        onSearchChange={vi.fn()}
      />
    );
    expect(screen.getByText('Aun no tienes ninguna conversacion registrada.')).toBeDefined();
  });
});