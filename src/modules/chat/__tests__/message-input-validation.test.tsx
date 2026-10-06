import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useState } from 'react';
import { MessageInputBar } from '../components/message-input-bar';
import { ChatRoom } from '../components/chat-room';
import { Conversation } from '../types/conversation.types';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Generador dinamico de caracteres Unicode para pruebas (sin literales de emoji en codigo)
const fromCodePoints = (...codes: number[]) => String.fromCodePoint(...codes);
const EMOJI_SMILE = fromCodePoints(0x1f600);
const EMOJI_GRIN = fromCodePoints(0x1f603);
const EMOJI_LAUGH = fromCodePoints(0x1f604);
const EMOJI_THUMBS_UP = fromCodePoints(0x1f44d);

const mockConversation: Conversation = {
  id: 'conv-val-1',
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

function ControlledInputHarness({
  initialValue = '',
  onSend = vi.fn(),
}: {
  initialValue?: string;
  onSend?: (val?: string) => void;
}) {
  const [val, setVal] = useState(initialValue);
  return (
    <MessageInputBar
      value={val}
      onChange={setVal}
      onSend={() => onSend(val)}
    />
  );
}

describe('Validacion de Input, Contador 500 Caracteres y Soporte de Emojis (HU-03 Tarea 4)', () => {
  it('debe mantener deshabilitado el boton de enviar ante string vacio o solo espacios', () => {
    const onSend = vi.fn();
    const { rerender } = render(
      <MessageInputBar
        value=""
        onChange={vi.fn()}
        onSend={onSend}
      />
    );

    const sendButton = screen.getByTestId('send-button') as HTMLButtonElement;
    expect(sendButton.disabled).toBe(true);

    rerender(
      <MessageInputBar
        value="     "
        onChange={vi.fn()}
        onSend={onSend}
      />
    );
    expect(sendButton.disabled).toBe(true);

    rerender(
      <MessageInputBar
        value={'\n\t  '}
        onChange={vi.fn()}
        onSend={onSend}
      />
    );
    expect(sendButton.disabled).toBe(true);

    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('debe habilitar el boton de enviar inmediatamente cuando se ingresa al menos un caracter valido', () => {
    const onSend = vi.fn();
    const { rerender } = render(
      <MessageInputBar
        value=""
        onChange={vi.fn()}
        onSend={onSend}
      />
    );

    const sendButton = screen.getByTestId('send-button') as HTMLButtonElement;
    expect(sendButton.disabled).toBe(true);

    rerender(
      <MessageInputBar
        value="H"
        onChange={vi.fn()}
        onSend={onSend}
      />
    );
    expect(sendButton.disabled).toBe(false);

    rerender(
      <MessageInputBar
        value={EMOJI_SMILE}
        onChange={vi.fn()}
        onSend={onSend}
      />
    );
    expect(sendButton.disabled).toBe(false);
  });

  it('debe actualizar fielmente el contador en formato x/500 con cada pulsacion', () => {
    render(<ControlledInputHarness initialValue="" />);

    const textarea = screen.getByTestId('message-textarea');
    const counter = screen.getByTestId('character-counter');

    expect(counter.textContent).toBe('0/500');

    fireEvent.change(textarea, { target: { value: 'Hola' } });
    expect(counter.textContent).toBe('4/500');

    fireEvent.change(textarea, { target: { value: 'Hola mundo' } });
    expect(counter.textContent).toBe('10/500');
  });

  it('debe tratar cada emoji como exactamente 1 caracter en el contador dinámico', () => {
    render(<ControlledInputHarness initialValue="" />);

    const textarea = screen.getByTestId('message-textarea');
    const counter = screen.getByTestId('character-counter');

    // 1 emoji
    fireEvent.change(textarea, { target: { value: EMOJI_SMILE } });
    expect(counter.textContent).toBe('1/500');

    // 3 emojis
    fireEvent.change(textarea, { target: { value: EMOJI_SMILE + EMOJI_GRIN + EMOJI_LAUGH } });
    expect(counter.textContent).toBe('3/500');

    // Texto + emojis: 'UMSS ' (5) + emoji (1) = 6
    fireEvent.change(textarea, { target: { value: 'UMSS ' + EMOJI_THUMBS_UP } });
    expect(counter.textContent).toBe('6/500');
  });

  it('debe bloquear el ingreso y truncar a 500 caracteres al intentar exceder el limite', () => {
    render(<ControlledInputHarness initialValue="" />);

    const textarea = screen.getByTestId('message-textarea') as HTMLTextAreaElement;
    const counter = screen.getByTestId('character-counter');

    // Intentar pegar 550 caracteres
    const longString = 'A'.repeat(550);
    fireEvent.change(textarea, { target: { value: longString } });

    expect(counter.textContent).toBe('500/500');
    expect(textarea.value.length).toBe(500);

    // Indicador visual de limite alcanzado (clase roja)
    expect(counter.className).toContain('text-[#E30613]');
    expect(counter.className).toContain('font-bold');
  });

  it('debe impedir el envio en ChatRoom si el contenido no es valido', () => {
    const onSend = vi.fn();
    render(
      <ChatRoom
        conversation={mockConversation}
        messages={[]}
        currentUserId="current-user"
        onBack={vi.fn()}
        onSendMessage={onSend}
      />
    );

    const textarea = screen.getByTestId('message-textarea');
    const sendButton = screen.getByTestId('send-button');

    // Intentar enviar con solo espacios
    fireEvent.change(textarea, { target: { value: '     ' } });
    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();

    // Enviar con emoji valido
    fireEvent.change(textarea, { target: { value: 'Hola ' + EMOJI_SMILE } });
    fireEvent.click(sendButton);
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('Hola ' + EMOJI_SMILE);
  });
});

