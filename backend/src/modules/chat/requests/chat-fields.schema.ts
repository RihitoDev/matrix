import { z } from 'zod';

export const conversationIdField = z
  .string({ error: 'El identificador de la conversación es obligatorio' })
  .uuid('El identificador de la conversación no es válido');

export const contactIdField = z
  .string({ error: 'El identificador del contacto es obligatorio' })
  .uuid('El identificador del contacto no es válido');