import { z } from 'zod';
import {
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  PHONE_PATTERN,
} from '../constants/profile.constants.js';

const countDigits = (value: string): number => value.replace(/\D/g, '').length;

export const personNameSchema = z.string().trim().min(1).max(100);

export const cityIdSchema = z.uuid();

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_PATTERN, 'Phone can only contain digits, spaces, hyphens and a leading +')
  .refine(
    (value) => {
      const digits = countDigits(value);
      return digits >= PHONE_MIN_DIGITS && digits <= PHONE_MAX_DIGITS;
    },
    `Phone must have between ${PHONE_MIN_DIGITS} and ${PHONE_MAX_DIGITS} digits`,
  );

export const personalEmailSchema = z.string().trim().pipe(z.email());

export const headlineSchema = z.string().trim().min(1).max(150);

export const aboutMeSchema = z.string().trim().min(1).max(2000);
