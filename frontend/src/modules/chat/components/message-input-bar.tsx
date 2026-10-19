
'use client';

import { useRef, useEffect } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';

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
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
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

  // Ajusta la altura del textarea según el contenido, hasta 120px.
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';

    const newHeight = Math.min(textarea.scrollHeight, 120);

    textarea.style.height = `${Math.max(newHeight, 40)}px`;
  }, [value]);

  const characterCount = countCharacters(value);

  const isSendDisabled =
    disabled ||
    isSending ||
    isWhitespaceOnly(value) ||
    characterCount > maxLength;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = event.target.value;

    const truncatedValue = truncateToMaxCharacters(
      rawValue,
      maxLength
    );

    onChange(truncatedValue);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSendDisabled) {
      onSend();
    }
  };

  return (
    <div
      data-testid="message-input-bar"
      className="w-full min-w-0 shrink-0 border-t border-[#E3E7EC] bg-white p-3 transition-all md:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full min-w-0 flex-col gap-2"
      >
        <div className="flex w-full min-w-0 items-end gap-2.5 rounded-xl border border-[#E3E7EC] bg-[#F6F7F9] p-2 transition-all focus-within:border-[#0B1F2E] focus-within:bg-white">
          <textarea
            ref={textareaRef}
            data-testid="message-textarea"
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            disabled={disabled || isSending}
            placeholder={placeholder}
            rows={1}
            className="max-h-[120px] min-h-[40px] w-full min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent p-1 text-sm leading-relaxed [overflow-wrap:anywhere] break-words text-[#0B1F2E] placeholder:text-[#5B6470] focus:outline-none"
            aria-label="Campo de redacción de mensaje"
          />

          <div className="flex shrink-0 items-center gap-2 pb-1">
            <span
              data-testid="character-counter"
              className={`text-[11px] font-medium tracking-tight select-none ${
                characterCount >= maxLength
                  ? 'font-bold text-[#E30613]'
                  : 'text-[#5B6470]'
              }`}
            >
              {characterCount}/{maxLength}
            </span>

            <Button
              type="submit"
              variant="default"
              size="default"
              data-testid="send-button"
              disabled={isSendDisabled}
              aria-label="Enviar mensaje"
              className={`h-auto rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all md:text-sm ${
                isSendDisabled
                  ? 'cursor-not-allowed bg-slate-300 text-slate-500 opacity-60 shadow-none'
                  : 'bg-[#E30613] shadow-sm hover:bg-[#B4050F] active:scale-95'
              }`}
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
