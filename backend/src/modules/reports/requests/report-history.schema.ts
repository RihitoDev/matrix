import { z } from 'zod';
import { paginationSchema } from '../../../common/utils/pagination.js';
import { REPORT_TYPES } from '../types/generated-report.types.js';
import { ALL_FILTER_VALUE } from './report-users.schema.js';

const reportTypeSchema = z
  .union([z.literal(ALL_FILTER_VALUE), z.enum(REPORT_TYPES)])
  .transform((value) => (value === ALL_FILTER_VALUE ? undefined : value))
  .optional();

export const reportHistoryQuerySchema = paginationSchema.extend({
  reportType: reportTypeSchema,
});

export type ReportHistoryQuery = z.infer<typeof reportHistoryQuerySchema>;
