import { z } from 'zod';

import {
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../constants/events.constants.js';
export {
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../constants/events.constants.js';

export const GetEventsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(10),
  categoryId: z
    .guid({ message: 'categoryId debe ser un UUID válido' })
    .optional(),
  statusId: z.guid({ message: 'statusId debe ser un UUID válido' }).optional(),
  search: z
    .string()
    .trim()
    .max(MAX_SEARCH_LENGTH, {
      message: `search no puede tener más de ${MAX_SEARCH_LENGTH} caracteres`,
    })
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
});

export type GetEventsPayload = z.infer<typeof GetEventsSchema>;
