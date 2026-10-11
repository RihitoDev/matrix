import { z } from 'zod';
import { paginationSchema } from '../../../common/utils/pagination.js';
import { REPORT_USER_TYPES } from '../types/report-user.types.js';

const FIRST_REPORT_YEAR = 2020;
const MAX_SEARCH_LENGTH = 100;

const searchSchema = z.string().trim().max(MAX_SEARCH_LENGTH).optional();

export const registeredUsersFiltersSchema = z.object({
  userType: z.enum(REPORT_USER_TYPES).optional(),
  year: z.coerce.number().int().min(FIRST_REPORT_YEAR).optional(),
  search: searchSchema,
});

export const registeredUsersQuerySchema = paginationSchema.extend(
  registeredUsersFiltersSchema.shape,
);

export const rejectedUsersFiltersSchema = z.object({
  search: searchSchema,
});

export const rejectedUsersQuerySchema = paginationSchema.extend(
  rejectedUsersFiltersSchema.shape,
);

export type RegisteredUsersFilters = z.infer<
  typeof registeredUsersFiltersSchema
>;
export type RegisteredUsersQuery = z.infer<typeof registeredUsersQuerySchema>;
export type RejectedUsersFilters = z.infer<typeof rejectedUsersFiltersSchema>;
export type RejectedUsersQuery = z.infer<typeof rejectedUsersQuerySchema>;
