import { toBoliviaTime } from "@/shared/utils/date-time";
import { BLOCK_MAX_HOUR, BLOCK_MESSAGES, BLOCK_MIN_HOUR, BLOCK_STEP_MINUTES } from "../constants/availability.constants";
import type { BlockValidationErrors } from "../types/block-validation-errors.types";
import type { CreateAvailabilityBlockInput } from "../types/create-availability-block-input.types";

const getBoliviaParts = (value: string) => {
  const date = new Date(value);
  const { date: day, hours, minutes } = toBoliviaTime(date);
  return {
    day,
    minutesOfDay: hours * 60 + minutes,
    isOnStep: minutes % BLOCK_STEP_MINUTES === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0,
  };
};

export function validateBlock(
  { startAt, endAt }: CreateAvailabilityBlockInput,
  now: Date = new Date(),
): BlockValidationErrors {
  const errors: BlockValidationErrors = {};
  const startTime = new Date(startAt).getTime();
  const endTime = new Date(endAt).getTime();

  if (endTime <= startTime) {
    return { endAt: BLOCK_MESSAGES.endBeforeStart };
  }

  if (startTime <= now.getTime()) {
    errors.startAt = BLOCK_MESSAGES.startInPast;
  }

  const start = getBoliviaParts(startAt);
  const end = getBoliviaParts(endAt);

  if (!start.isOnStep) errors.startAt ??= BLOCK_MESSAGES.invalidStep;
  if (!end.isOnStep) errors.endAt ??= BLOCK_MESSAGES.invalidStep;

  // 22:00 del mismo día es válido como fin; 00:00 del día siguiente no.
  if (start.day !== end.day) {
    errors.endAt ??= BLOCK_MESSAGES.differentDays;
    return errors;
  }

  if (start.minutesOfDay < BLOCK_MIN_HOUR * 60) errors.startAt ??= BLOCK_MESSAGES.outOfRange;
  if (end.minutesOfDay > BLOCK_MAX_HOUR * 60) errors.endAt ??= BLOCK_MESSAGES.outOfRange;

  return errors;
}
