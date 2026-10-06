/* eslint-disable @next/next/no-img-element */
'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Conversation, Message } from '../types/conversation.types';
import { MessageInputBar } from './message-input-bar';
import { getInitials } from '../utils/date-formatter';
import { isContentValidForSend } from '../utils/unicode-counter';

interface ChatRoomProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (content: string) => void;
  isLoadingMessages?: boolean;
  isSending?: boolean;
  hasMoreMessages?: boolean;
  onLoadMoreMessages?: () => void | Promise<unknown>;
  isLoadingMoreMessages?: boolean;
}

export function ChatRoom({
  conversation,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  isLoadingMessages = false,
  isSending = false,
  hasMoreMessages = false,
  onLoadMoreMessages,
  isLoadingMoreMessages = false,
}: ChatRoomProps) {
  const [inputText, setInputText] = useState('');

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);
  const previousMessagesLengthRef = useRef(0);

  const isLoadingPreviousPageRef = useRef(false);

  /**
   * Carga una pagina de mensajes anteriores.
   *
   * Antes de realizar la carga guardamos el alto y la posicion
   * actuales del scroll. Estos valores permiten mantener al usuario
   * en el mismo punto cuando los mensajes anteriores se agreguen arriba.
   */
  const loadOlderMessages = useCallback(async () => {
    const container = messagesContainerRef.current;

    if (
      !container ||
      !onLoadMoreMessages ||
      !hasMoreMessages ||
      isLoadingMoreMessages ||
      isLoadingPreviousPageRef.current
    ) {
      return;
    }

    previousScrollHeightRef.current = container.scrollHeight;
    previousScrollTopRef.current = container.scrollTop;
    isLoadingPreviousPageRef.current = true;

    try {
      await onLoadMoreMessages();
    } catch {
      isLoadingPreviousPageRef.current = false;
    }
  }, [
    hasMoreMessages,
    isLoadingMoreMessages,
    onLoadMoreMessages,
  ]);

  /**
   * Cuando el usuario se aproxima a la parte superior del historial,
   * se solicita automaticamente la pagina anterior.
   */
  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    if (container.scrollTop <= 80) {
      void loadOlderMessages();
    }
  };

  /**
   * Control del scroll despues de actualizar los mensajes.
   *
   * Primera carga:
   *   muestra los mensajes mas recientes.
   *
   * Carga de mensajes anteriores:
   *   compensa el aumento del scrollHeight para evitar que la
   *   pantalla salte cuando los mensajes se insertan arriba.
   *
   * Mensaje nuevo:
   *   mueve el historial hacia la parte inferior.
   */
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const previousLength = previousMessagesLengthRef.current;
    const currentLength = messages.length;

    if (isLoadingPreviousPageRef.current) {
      if (currentLength > previousLength) {
        const newScrollHeight = container.scrollHeight;

        const heightDifference =
          newScrollHeight - previousScrollHeightRef.current;

        container.scrollTop =
          previousScrollTopRef.current + heightDifference;

        isLoadingPreviousPageRef.current = false;
      } else if (!isLoadingMoreMessages) {
        isLoadingPreviousPageRef.current = false;
      }
    } else if (previousLength === 0 && currentLength > 0) {
      /*
       * Primera pagina cargada.
       * Se muestran los mensajes mas recientes.
       */
      container.scrollTop = container.scrollHeight;
    } else if (currentLength > previousLength) {
      /*
       * Mensaje nuevo enviado o recibido.
       */
      container.scrollTop = container.scrollHeight;
    }

    previousMessagesLengthRef.current = currentLength;
  }, [messages.length, isLoadingMoreMessages]);

  /**
   * Reinicia el control del scroll al seleccionar otra conversacion.
   */
  useEffect(() => {
    previousScrollHeightRef.current = 0;
    previousScrollTopRef.current = 0;
    previousMessagesLengthRef.current = 0;
    isLoadingPreviousPageRef.current = false;
  }, [conversation.id]);

  /**
   * Si una pagina contiene pocos mensajes y no alcanza para producir
   * scroll vertical, se carga otra pagina automaticamente.
   */
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (
      !container ||
      messages.length === 0 ||
      !hasMoreMessages ||
      isLoadingMoreMessages ||
      isLoadingPreviousPageRef.current
    ) {
      return;
    }

    if (container.scrollHeight <= container.clientHeight) {
      void loadOlderMessages();
    }
  }, [
    messages.length,
    hasMoreMessages,
    isLoadingMoreMessages,
    loadOlderMessages,
  ]);

  const handleSend = () => {
    if (!isContentValidForSend(inputText) || isSending) {
      return;
    }

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formatMessageTime = (
    isoString?: string | null,
  ): string => {
    if (!isoString) return '';

    const date = new Date(isoString);

    if (isNaN(date.getTime())) return '';

    return date
      .toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .toUpperCase();
  };

  return (
    <div
      data-testid="chat-room"
      className="flex flex-col h-full w-full min-w-0 min-h-0 bg-[#F6F7F9] overflow-hidden"
    >
      {/* Cabecera del chat */}
      <header
        data-testid="chat-room-header"
        className="shrink-0 w-full min-w-0 bg-white border-b border-[#E3E7EC] p-3 md:p-4 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-3">
          {/* Boton atras para movil */}
          <button
            type="button"
            data-testid="chat-back-button"
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-[#5B6470] hover:text-[#0B1F2E] rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Volver a la lista de chats"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            {conversation.contact.avatarUrl ? (
              <img
                src={conversation.contact.avatarUrl}
                alt={conversation.contact.fullName}
                className="w-10 h-10 rounded-full object-cover border border-[#E3E7EC]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 text-[#0B1F2E] flex items-center justify-center font-bold text-xs border border-[#E3E7EC]">
                {getInitials(conversation.contact.fullName)}
              </div>
            )}

            {conversation.contact.isOnline && (
              <span
                data-testid="online-indicator"
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                title="En linea"
              />
            )}
          </div>

          {/* Informacion del contacto */}
          <div>
            <h3
              data-testid="chat-contact-name"
              className="text-sm md:text-base font-bold text-[#0B1F2E] leading-tight"
            >
              {conversation.contact.fullName}
            </h3>

            <span className="text-xs font-medium text-emerald-600">
              {conversation.contact.isOnline
                ? 'En linea'
                : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      {/* Historial de mensajes */}
      <div
        ref={messagesContainerRef}
        data-testid="messages-container"
        onScroll={handleMessagesScroll}
        className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-3 bg-[#F6F7F9]"
      >
        {/* Indicador mientras se cargan mensajes anteriores */}
        {isLoadingMoreMessages && (
          <div
            data-testid="loading-older-messages"
            className="flex justify-center py-2"
          >
            <span className="text-xs text-[#5B6470]">
              Cargando mensajes anteriores...
            </span>
          </div>
        )}

        {/* Boton alternativo para cargar mensajes anteriores */}
        {hasMoreMessages && !isLoadingMoreMessages && (
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={() => void loadOlderMessages()}
              className="px-4 py-2 text-xs font-medium text-[#0B1F2E] bg-white border border-[#E3E7EC] rounded-lg hover:bg-slate-50"
            >
              Cargar mensajes anteriores
            </button>
          </div>
        )}

        {/* Ya se alcanzo el mensaje mas antiguo */}
        {!hasMoreMessages &&
          messages.length > 0 &&
          !isLoadingMessages &&
          !isLoadingMoreMessages && (
            <div
              data-testid="start-of-conversation"
              className="flex justify-center py-2"
            >
              <span className="text-xs text-slate-400">
                Inicio de la conversacion
              </span>
            </div>
          )}

        {/* Estado sin mensajes */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#5B6470]">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0B1F2E] flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            <p className="text-sm font-medium text-slate-600">
              Sala de chat con {conversation.contact.fullName}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {isLoadingMessages
                ? 'Cargando mensajes...'
                : 'Envio e historial de mensajes'}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                data-testid={`message-item-${message.id}`}
                className={`flex w-full min-w-0 ${
                  isOwn
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] min-w-0 rounded-2xl px-4 py-2.5 text-sm shadow-xs [overflow-wrap:anywhere] break-words ${
                    isOwn
                      ? 'bg-[#0B1F2E] text-white rounded-tr-xs'
                      : 'bg-white text-[#0B1F2E] border border-[#E3E7EC] rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <div
                    className={`flex items-center gap-1.5 justify-end mt-1 text-[10px] ${
                      isOwn
                        ? 'text-slate-300'
                        : 'text-[#5B6470]'
                    }`}
                  >
                    <span>
                      {formatMessageTime(
                        message.timestamp ||
                          message.createdAt,
                      )}
                    </span>

                    {isOwn && (
                      <span className="font-medium">
                        {message.status === 'sending'
                          ? 'Enviando...'
                          : message.status === 'error'
                            ? 'Error'
                            : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Ancla conservada por compatibilidad con los tests existentes */}
        <div data-testid="messages-scroll-anchor" />
      </div>

      {/* Barra para enviar mensajes */}
      <MessageInputBar
        value={inputText}
        onChange={setInputText}
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  );
}