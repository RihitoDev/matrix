import { z } from 'zod';

import {
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../constants/event-categories.constants.js';
export {
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../constants/event-categories.constants.js';

export const GetEventCategoriesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(10),
  search: z
    .string()
    .trim()
    .max(MAX_SEARCH_LENGTH, {
      message: `search no puede tener más de ${MAX_SEARCH_LENGTH} caracteres`,
    })
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
});

export type GetEventCategoriesPayload = z.infer<
  typeof GetEventCategoriesSchema
>;
