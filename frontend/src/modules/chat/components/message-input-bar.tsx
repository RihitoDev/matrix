'use client';

import { useRef, useEffect } from 'react';
import {
  countCharacters,
  truncateToMaxCharacters,
  isWhitespaceOnly,
  MAX_MESSAGE_LENGTH,
} from '../utils/unicode-counter';

interface MessageInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isSending?: boolean;
  maxLength?: number;
  placeholder?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function MessageInputBar({
  value,
  onChange,
  onSend,
  disabled = false,
  isSending = false,
  maxLength = MAX_MESSAGE_LENGTH,
  placeholder = 'Escribe un mensaje...',
  onKeyDown,
}: MessageInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-ajuste de altura del textarea segun el contenido (maximo 120px)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${Math.max(newHeight, 40)}px`;
  }, [value]);

  const characterCount = countCharacters(value);
  const isSendDisabled =
    disabled || isSending || isWhitespaceOnly(value) || characterCount > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    const truncatedValue = truncateToMaxCharacters(rawValue, maxLength);
    onChange(truncatedValue);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSendDisabled) {
      onSend();
    }
  };

  return (
    <div
      data-testid="message-input-bar"
      className="shrink-0 w-full min-w-0 bg-white border-t border-border p-3 md:p-4 transition-all"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full min-w-0">
        <div className="flex items-end gap-2.5 w-full min-w-0 bg-surface-soft border border-border rounded-xl p-2 focus-within:border-ink focus-within:bg-white transition-all">
          <textarea
            ref={textareaRef}
            data-testid="message-textarea"
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            disabled={disabled || isSending}
            placeholder={placeholder}
            rows={1}
            className="flex-1 min-w-0 w-full bg-transparent border-0 resize-none text-sm text-ink placeholder-text-secondary focus:outline-none leading-relaxed py-1 px-1 min-h-[40px] max-h-[120px] overflow-y-auto break-words [overflow-wrap:anywhere]"
            aria-label="Campo de redaccion de mensaje"
          />

          <div className="flex items-center gap-2 shrink-0 pb-1">
            <span
              data-testid="character-counter"
              className={`text-[11px] font-medium tracking-tight select-none ${
                characterCount >= maxLength
                  ? 'text-accent font-bold'
                  : 'text-text-secondary'
              }`}
            >
              {characterCount}/{maxLength}
            </span>

            <button
              type="submit"
              data-testid="send-button"
              disabled={isSendDisabled}
              aria-label="Enviar mensaje"
              className={`inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm font-semibold rounded-lg text-white transition-all shadow-xs focus:outline-none ${
                isSendDisabled
                  ? 'bg-border-strong text-text-secondary cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-accent hover:bg-brand-hover active:scale-95 shadow-sm'
              }`}
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

