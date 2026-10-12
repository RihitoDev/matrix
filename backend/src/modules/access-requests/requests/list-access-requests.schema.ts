import { z } from 'zod';
import { DEFAULT_INBOX_PERIOD, INBOX_PERIODS, MAX_SEARCH_LENGTH, MIN_SEARCH_LENGTH } from '../constants/inbox-filters.constants.js';
import { LIST_STATUSES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/list-access-requests.constants.js';
import { CAREER } from '../types/career.enum.js';

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value);

export const listAccessRequestsQuerySchema = z.object({
  status: z.enum(LIST_STATUSES, { error: 'El estado no es válido' }).optional(),
  search: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'La búsqueda debe ser un texto' })
      .trim()
      .min(MIN_SEARCH_LENGTH, `La búsqueda debe tener al menos ${MIN_SEARCH_LENGTH} caracteres`)
      .max(MAX_SEARCH_LENGTH, `La búsqueda no puede superar ${MAX_SEARCH_LENGTH} caracteres`)
      .optional(),
  ),
  career: z.preprocess(emptyToUndefined, z.enum(Object.values(CAREER), { error: 'La carrera no es válida' }).optional()),
  period: z.enum(INBOX_PERIODS, { error: 'El período no es válido' }).default(DEFAULT_INBOX_PERIOD),
  page: z.coerce
    .number({ error: 'La página debe ser un número' })
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser mayor o igual a 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'El límite debe ser un número' })
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser mayor o igual a 1')
    .max(MAX_PAGE_SIZE, `El límite no puede superar ${MAX_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
});

export type ListAccessRequestsQuery = z.infer<typeof listAccessRequestsQuerySchema>;
