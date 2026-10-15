import { z } from 'zod';
import {
  DEFAULT_MESSAGE_PAGE_SIZE,
  MAX_MESSAGE_PAGE_SIZE,
} from '../constants/chat.constants.js';
import { conversationIdField } from './chat-fields.schema.js';

export const getMessagesQuerySchema = z
  .object({
    conversationId: conversationIdField,
    cursor: z.string().uuid('El cursor no es válido').optional(),
    limit: z.coerce
      .number({ error: 'El límite debe ser un número' })
      .int('El límite debe ser un número entero')
      .min(1, 'El límite debe ser mayor o igual a 1')
      .max(
        MAX_MESSAGE_PAGE_SIZE,
        `El límite no puede superar ${MAX_MESSAGE_PAGE_SIZE}`,
      )
      .default(DEFAULT_MESSAGE_PAGE_SIZE),
  })
  .strict();

export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;