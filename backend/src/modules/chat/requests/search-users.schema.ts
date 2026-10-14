import { z } from 'zod';
import {
  MIN_SEARCH_CHARS,
  MAX_SEARCH_QUERY_LENGTH,
} from '../constants/chat.constants.js';

export const searchUsersSchema = z
  .object({
    q: z
      .string({ error: 'El término de búsqueda es obligatorio' })
      .trim()
      .min(
        MIN_SEARCH_CHARS,
        `El término de búsqueda debe tener al menos ${MIN_SEARCH_CHARS} caracteres`,
      )
      .max(
        MAX_SEARCH_QUERY_LENGTH,
        `El término de búsqueda no puede superar los ${MAX_SEARCH_QUERY_LENGTH} caracteres`,
      ),
  })
  .strict();

export type SearchUsersDto = z.infer<typeof searchUsersSchema>;