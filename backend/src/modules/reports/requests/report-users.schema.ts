import { z } from 'zod';
import {
  DEFAULT_PAGE_SIZE,
  paginationSchema,
} from '../../../common/utils/pagination.js';
import { ROLE_NAMES } from '../../../common/enums/roles.enum.js';
import { ACADEMIC_PERIOD_PATTERN } from '../utils/academic-period.js';

const searchSchema = z.string().trim().optional();

export const ALL_FILTER_VALUE = 'ALL';

function withAllOption<TSchema extends z.ZodType<string>>(schema: TSchema) {
  return z
    .union([z.literal(ALL_FILTER_VALUE), schema])
    .transform((value) =>
      value === ALL_FILTER_VALUE ? undefined : (value as z.output<TSchema>),
    )
    .optional();
}

const userTypeSchema = withAllOption(z.enum(ROLE_NAMES));

const academicPeriodSchema = withAllOption(
  z
    .string()
    .trim()
    .regex(
      ACADEMIC_PERIOD_PATTERN,
      'La gestión debe tener el formato I-2025 o II-2025',
    ),
);

export const registeredUsersFiltersSchema = z.object({
  userType: userTypeSchema,
  period: academicPeriodSchema,
  search: searchSchema,
});

export const registeredUsersQuerySchema = paginationSchema.extend({
  ...registeredUsersFiltersSchema.shape,
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(DEFAULT_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

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
