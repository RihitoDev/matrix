import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { toBoliviaTime } from '../../../common/utils/date-time.js';
import {
  BLOCK_MAX_HOUR,
  BLOCK_MIN_HOUR,
  BLOCK_STEP_MINUTES,
  CREATE_BLOCK_MESSAGES,
} from '../constants/create-block.constants.js';

const getBoliviaParts = (date: Date) => {
  const { date: day, hours, minutes } = toBoliviaTime(date);
  return {
    day,
    minutesOfDay: hours * 60 + minutes,
    isOnStep:
      minutes % BLOCK_STEP_MINUTES === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0,
  };
};

const isoDateTime = z.iso.datetime({ offset: true, error: CREATE_BLOCK_MESSAGES.invalidDate });

const blockInstant = isoDateTime.transform((value) => new Date(value));

export const buildCreateBlockSchema = (getNow: () => Date = () => new Date()) =>
  z
    .strictObject({
      startAt: blockInstant,
      endAt: blockInstant,
    })
    .superRefine((payload, ctx) => {
      const { startAt, endAt } = payload;

      if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
        return;
      }

      if (endAt.getTime() <= startAt.getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['endAt'],
          message: CREATE_BLOCK_MESSAGES.endBeforeStart,
        });
        return;
      }

      if (startAt.getTime() <= getNow().getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAt'],
          message: CREATE_BLOCK_MESSAGES.startInPast,
        });
      }

      const start = getBoliviaParts(startAt);
      const end = getBoliviaParts(endAt);

      if (!start.isOnStep) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAt'],
          message: CREATE_BLOCK_MESSAGES.invalidStep,
        });
      }
      if (!end.isOnStep) {
        ctx.addIssue({
          code: 'custom',
          path: ['endAt'],
          message: CREATE_BLOCK_MESSAGES.invalidStep,
        });
      }

      if (start.day !== end.day) {
        ctx.addIssue({
          code: 'custom',
          path: ['endAt'],
          message: CREATE_BLOCK_MESSAGES.differentDays,
        });
        return;
      }

      if (start.minutesOfDay < BLOCK_MIN_HOUR * 60) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAt'],
          message: CREATE_BLOCK_MESSAGES.outOfRange,
        });
      }
      if (end.minutesOfDay > BLOCK_MAX_HOUR * 60) {
        ctx.addIssue({
          code: 'custom',
          path: ['endAt'],
          message: CREATE_BLOCK_MESSAGES.outOfRange,
        });
      }
    });

export const createBlockSchema = buildCreateBlockSchema();

export class CreateBlockDto extends createZodDto(createBlockSchema) {}
