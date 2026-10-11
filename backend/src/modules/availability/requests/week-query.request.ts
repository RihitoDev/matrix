import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { MAX_WEEK_QUERY_MS, WEEK_QUERY_MESSAGES } from '../constants/week-query.constants.js';

const isoDateTime = z.iso.datetime({ offset: true, error: WEEK_QUERY_MESSAGES.invalidDate });

export const weekQuerySchema = z
  .strictObject({
    from: isoDateTime,
    to: isoDateTime,
  })
  .superRefine((query, ctx) => {
    const from = new Date(query.from).getTime();
    const to = new Date(query.to).getTime();

    if (to <= from) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: WEEK_QUERY_MESSAGES.toBeforeFrom });
      return;
    }

    if (to - from > MAX_WEEK_QUERY_MS) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: WEEK_QUERY_MESSAGES.rangeTooLong });
    }
  });

export class WeekQueryDto extends createZodDto(weekQuerySchema) {}
