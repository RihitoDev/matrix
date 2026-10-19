
"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import type {
  Conversation,
  Message,
} from "../types/conversation.types";

import { MessageInputBar } from "./message-input-bar";
import { ChatErrorState } from "./chat-error-state";

import {
  getInitials,
  formatMessageDateSeparator,
} from "../utils/date-formatter";

import { isContentValidForSend } from "../utils/unicode-counter";

interface ChatRoomProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (content: string) => void | Promise<void>;
  isLoadingMessages?: boolean;
  isSending?: boolean;
  hasMoreMessages?: boolean;
  onLoadMoreMessages?: () => void | Promise<unknown>;
  isLoadingMoreMessages?: boolean;
  isMessagesError?: boolean;
  isLoadingOlderError?: boolean;
  onRetryMessages?: () => void;
}

interface ScrollAnchor {
  messageId: string;
  offsetTop: number;
  scrollTop: number;
  scrollHeight: number;
  firstMessageId: string | null;
}

const TOP_THRESHOLD = 80;
const BOTTOM_THRESHOLD = 120;

function getMessageDate(message: Message): string {
  return message.timestamp || message.createdAt || "";
}

function formatMessageTime(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hour = String(hours % 12 || 12).padStart(2, "0");

  return `${hour}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
}

function isSameDay(
  firstDate?: string | null,
  secondDate?: string | null,
): boolean {
  if (!firstDate || !secondDate) return false;

  const first = new Date(firstDate);
  const second = new Date(secondDate);

  if (
    Number.isNaN(first.getTime()) ||
    Number.isNaN(second.getTime())
  ) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function shouldShowDateSeparator(
  messages: Message[],
  index: number,
  hasMoreMessages: boolean,
): boolean {
  const currentMessage = messages[index];

  if (!currentMessage) return false;

  if (index === 0) {
    return !hasMoreMessages;
  }

  const previousMessage = messages[index - 1];

  return !isSameDay(
    getMessageDate(previousMessage),
    getMessageDate(currentMessage),
  );
}

/**
 * Desplaza el contenedor al final.
 * Funciona tanto en navegadores como en JSDOM.
 */
function scrollToBottom(
  container: HTMLDivElement,
  behavior: ScrollBehavior = "smooth",
): void {
  if (typeof container.scrollTo === "function") {
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  } else {
    container.scrollTop = container.scrollHeight;
  }
}

export function ChatRoom(props: ChatRoomProps) {
  return (
    <ChatRoomContent
      key={props.conversation.id}
      {...props}
    />
  );
}

function ChatRoomContent({
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
  isMessagesError = false,
  isLoadingOlderError = false,
  onRetryMessages,
}: ChatRoomProps) {
  const [inputText, setInputText] = useState("");
  const [sendError, setSendError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<ScrollAnchor | null>(null);

  const loadingOlderRef = useRef(false);
  const sendPendingRef = useRef(false);

  const firstScrollDoneRef = useRef(false);
  const nearBottomRef = useRef(true);
  const scrollAfterSendRef = useRef(false);

  const previousFirstIdRef = useRef<string | null>(null);
  const previousLastIdRef = useRef<string | null>(null);

  const showInitialLoading =
    isLoadingMessages && messages.length === 0;

  const getMessageElement = useCallback(
    (messageId: string): HTMLElement | null => {
      const container = containerRef.current;

      if (!container) return null;

      const elements =
        container.querySelectorAll<HTMLElement>(
          "[data-message-id]",
        );

      for (const element of elements) {
        if (element.dataset.messageId === messageId) {
          return element;
        }
      }

      return null;
    },
    [],
  );

  const captureAnchor = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const elements =
      container.querySelectorAll<HTMLElement>(
        "[data-message-id]",
      );

    for (const element of elements) {
      const rect = element.getBoundingClientRect();

      if (rect.bottom > containerRect.top) {
        const messageId = element.dataset.messageId;

        if (!messageId) continue;

        anchorRef.current = {
          messageId,
          offsetTop: rect.top - containerRect.top,
          scrollTop: container.scrollTop,
          scrollHeight: container.scrollHeight,
          firstMessageId: previousFirstIdRef.current,
        };

        return;
      }
    }

    // Respaldo cuando no se pueden medir las posiciones.
    anchorRef.current = {
      messageId: "",
      offsetTop: 0,
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
      firstMessageId: previousFirstIdRef.current,
    };
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (
      !onLoadMoreMessages ||
      !hasMoreMessages ||
      isLoadingMoreMessages ||
      loadingOlderRef.current
    ) {
      return;
    }

    captureAnchor();

    if (!anchorRef.current) return;

    loadingOlderRef.current = true;

    try {
      await onLoadMoreMessages();
    } catch {
      loadingOlderRef.current = false;
      anchorRef.current = null;
    }
  }, [
    onLoadMoreMessages,
    hasMoreMessages,
    isLoadingMoreMessages,
    captureAnchor,
  ]);

  const handleScroll = () => {
    const container = containerRef.current;

    if (!container) return;

    const distanceToBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    nearBottomRef.current =
      distanceToBottom <= BOTTOM_THRESHOLD;

    if (loadingOlderRef.current) {
      return;
    }

    if (
      container.scrollTop <= TOP_THRESHOLD &&
      !showInitialLoading &&
      !isMessagesError &&
      hasMoreMessages
    ) {
      void loadOlderMessages();
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container || showInitialLoading) return;

    const firstId = messages[0]?.id ?? null;
    const lastId = messages[messages.length - 1]?.id ?? null;

    const previousLastId = previousLastIdRef.current;
    const anchor = anchorRef.current;

    if (loadingOlderRef.current && anchor) {
      const olderMessagesAdded =
        firstId !== null &&
        firstId !== anchor.firstMessageId;

      if (olderMessagesAdded) {
        const anchorElement = anchor.messageId
          ? getMessageElement(anchor.messageId)
          : null;

        if (anchorElement) {
          const containerRect =
            container.getBoundingClientRect();

          const elementRect =
            anchorElement.getBoundingClientRect();

          const currentOffset =
            elementRect.top - containerRect.top;

          container.scrollTop +=
            currentOffset - anchor.offsetTop;
        } else {
          const heightDifference =
            container.scrollHeight - anchor.scrollHeight;

          container.scrollTop =
            anchor.scrollTop + heightDifference;
        }

        loadingOlderRef.current = false;
        anchorRef.current = null;
      } else if (
        !isLoadingMoreMessages &&
        !hasMoreMessages
      ) {
        loadingOlderRef.current = false;
        anchorRef.current = null;
      }
    } else if (
      !firstScrollDoneRef.current &&
      messages.length > 0
    ) {
      scrollToBottom(container, "auto");

      firstScrollDoneRef.current = true;
      nearBottomRef.current = true;
    } else if (
      lastId !== null &&
      previousLastId !== null &&
      lastId !== previousLastId
    ) {
      if (
        scrollAfterSendRef.current ||
        nearBottomRef.current
      ) {
        scrollToBottom(container, "smooth");

        scrollAfterSendRef.current = false;
      }
    }

    previousFirstIdRef.current = firstId;
    previousLastIdRef.current = lastId;
  }, [
    messages,
    showInitialLoading,
    isLoadingMoreMessages,
    hasMoreMessages,
    getMessageElement,
  ]);

  const handleSend = async () => {
    if (
      !isContentValidForSend(inputText) ||
      isSending ||
      sendPendingRef.current ||
      showInitialLoading ||
      (isMessagesError && messages.length === 0)
    ) {
      return;
    }

    const content = inputText.trim();

    if (!content) return;

    sendPendingRef.current = true;
    scrollAfterSendRef.current = true;

    setIsSubmitting(true);
    setSendError(false);

    try {
      await onSendMessage(content);
    } catch {
      // Solo los errores reales del envío activan esta alerta.
      setSendError(true);
      scrollAfterSendRef.current = false;
      return;
    } finally {
      sendPendingRef.current = false;
      setIsSubmitting(false);
    }

    // El envío terminó correctamente.
    setSendError(false);
    setInputText("");

    // El scroll no debe interpretarse como un error de envío.
    const container = containerRef.current;

    if (container) {
      scrollToBottom(container, "smooth");
    }
  };

  const handleInputKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      data-testid="chat-room"
      className="flex size-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#F6F7F9]"
    >
      <header
        data-testid="chat-room-header"
        className="z-10 flex w-full min-w-0 shrink-0 items-center justify-between border-b border-[#E3E7EC] bg-white p-3 md:p-4"
      >
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-testid="chat-back-button"
            onClick={onBack}
            aria-label="Volver a la lista de chats"
            className="-ml-1 rounded-lg p-1.5 text-[#5B6470] hover:bg-slate-100 hover:text-[#0B1F2E] md:hidden"
          >
            <svg
              className="size-5"
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
          </Button>

          <div className="relative shrink-0">
            {conversation.contact.avatarUrl ? (
              <Image
                src={conversation.contact.avatarUrl}
                alt={conversation.contact.fullName}
                width={40}
                height={40}
                unoptimized
                className="size-10 rounded-full border border-[#E3E7EC] object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full border border-[#E3E7EC] bg-slate-200 text-xs font-bold text-[#0B1F2E]">
                {getInitials(conversation.contact.fullName)}
              </div>
            )}

            {conversation.contact.isOnline && (
              <span
                data-testid="online-indicator"
                className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-emerald-500"
                title="En línea"
              />
            )}
          </div>

          <div>
            <h3
              data-testid="chat-contact-name"
              className="text-sm leading-tight font-bold text-[#0B1F2E] md:text-base"
            >
              {conversation.contact.fullName}
            </h3>

            <span className="text-xs font-medium text-emerald-600">
              {conversation.contact.isOnline
                ? "En línea"
                : "Desconectado"}
            </span>
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        data-testid="messages-container"
        onScroll={handleScroll}
        className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#F6F7F9] p-4 md:p-6"
      >
        {isMessagesError && !showInitialLoading && (
          <ChatErrorState
            message={
              messages.length === 0
                ? "No pudimos cargar los mensajes de esta conversación."
                : "No pudimos actualizar el historial. Tus mensajes siguen visibles."
            }
            onRetry={
              isLoadingOlderError
                ? () => {
                    loadingOlderRef.current = false;
                    anchorRef.current = null;
                    void loadOlderMessages();
                  }
                : onRetryMessages
            }
          />
        )}

        {isLoadingMoreMessages && (
          <div
            role="status"
            data-testid="loading-older-messages"
            className="flex justify-center py-3"
          >
            <span className="text-xs text-[#5B6470]">
              Cargando mensajes anteriores...
            </span>
          </div>
        )}

        {!hasMoreMessages &&
          messages.length > 0 &&
          !showInitialLoading && (
            <div
              data-testid="start-of-conversation"
              className="flex justify-center py-2"
            >
              <span className="text-xs text-slate-400">
                Inicio de la conversación
              </span>
            </div>
          )}

        {showInitialLoading ? (
          <div
            role="status"
            data-testid="initial-messages-loading"
            className="flex h-full items-center justify-center"
          >
            <span className="text-sm text-[#5B6470]">
              Cargando conversación...
            </span>
          </div>
        ) : messages.length === 0 && !isMessagesError ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-[#5B6470]">
            <p className="text-sm font-medium">
              Sala de chat con {conversation.contact.fullName}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Aún no hay mensajes. Envía el primero para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn =
                message.senderId === currentUserId;

              const senderName = isOwn
                ? "Tú"
                : conversation.contact.fullName;

              const messageDate = getMessageDate(message);

              const showDateSeparator =
                shouldShowDateSeparator(
                  messages,
                  index,
                  hasMoreMessages,
                );

              return (
                <div
                  key={message.id}
                  data-message-id={message.id}
                >
                  {showDateSeparator && (
                    <div
                      data-testid={`date-separator-${message.id}`}
                      className="my-5 flex items-center gap-3"
                    >
                      <div className="h-px flex-1 bg-[#E3E7EC]" />

                      <span className="text-center text-[11px] font-semibold whitespace-nowrap text-[#5B6470]">
                        {formatMessageDateSeparator(
                          messageDate,
                        )}
                      </span>

                      <div className="h-px flex-1 bg-[#E3E7EC]" />
                    </div>
                  )}

                  <div
                    data-testid={`message-item-${message.id}`}
                    className={`flex w-full min-w-0 ${
                      isOwn
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-2.5 text-sm [overflow-wrap:anywhere] break-words shadow-xs md:max-w-[70%] ${
                        isOwn
                          ? "rounded-tr-xs bg-[#0B1F2E] text-white"
                          : "rounded-tl-xs border border-[#E3E7EC] bg-white text-[#0B1F2E]"
                      }`}
                    >
                      <p
                        className={`mb-1 text-xs font-semibold ${
                          isOwn
                            ? "text-slate-200"
                            : "text-[#2563EB]"
                        }`}
                      >
                        {senderName}
                      </p>

                      <p className="leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                        {message.content}
                      </p>

                      <div
                        className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                          isOwn
                            ? "text-slate-300"
                            : "text-[#5B6470]"
                        }`}
                      >
                        <span>
                          {formatMessageTime(messageDate)}
                        </span>

                        {isOwn && (
                          <span className="font-medium">
                            {message.status === "sending"
                              ? "Enviando..."
                              : message.status === "error"
                                ? "Error"
                                : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div data-testid="messages-scroll-anchor" />
      </div>

      {sendError && (
        <div
          role="alert"
          className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center"
        >
          <p className="text-sm text-red-800">
            No se pudo enviar el mensaje. Conservamos tu
            texto; vuelve a pulsar Enviar para reintentar.
          </p>
        </div>
      )}

      <MessageInputBar
        value={inputText}
        onChange={setInputText}
        onSend={() => void handleSend()}
        onKeyDown={handleInputKeyDown}
        isSending={isSending || isSubmitting}
        disabled={
          showInitialLoading ||
          (isMessagesError && messages.length === 0)
        }
      />
    </div>
  );
}
