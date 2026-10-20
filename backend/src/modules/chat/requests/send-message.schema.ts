import { z } from 'zod';

import {
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_LENGTH,
} from '../constants/chat.constants.js';

import { countCharacters } from '../utils/unicode-counter.js';

import { conversationIdField } from './chat-fields.schema.js';

export const sendMessageSchema = z
  .object({
    conversationId: conversationIdField,

    content: z
      .string({
        error: 'El contenido del mensaje es obligatorio',
      })
      .trim()
      .refine(
        (text) => countCharacters(text) >= MIN_MESSAGE_LENGTH,
        {
          message: 'El contenido del mensaje no puede estar vacío',
        },
      )
      .refine(
        (text) => countCharacters(text) <= MAX_MESSAGE_LENGTH,
        {
          message: `El contenido del mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres`,
        },
      ),
  })
  .strict();

export type SendMessageDto = z.infer<typeof sendMessageSchema>;