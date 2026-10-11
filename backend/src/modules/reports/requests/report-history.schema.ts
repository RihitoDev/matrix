import { z } from 'zod';
import { paginationSchema } from '../../../common/utils/pagination.js';

export const reportHistoryQuerySchema = paginationSchema;

export type ReportHistoryQuery = z.infer<typeof reportHistoryQuerySchema>;
