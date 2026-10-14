import { z } from 'zod';
import { contactIdField } from './chat-fields.schema.js';

export const createConversationSchema = z
  .object({
    contactId: contactIdField,
  })
  .strict();

export type CreateConversationDto = z.infer<typeof createConversationSchema>;