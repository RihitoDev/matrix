import { REQUEST_CODE_DIGITS, MIN_RETRY_DELAY_MS, MAX_RETRY_DELAY_MS } from '../constants/request-code.constants.js';

export function requestCodePrefix(year: number): string {
  return `SOL-${year}-`;
}

export function nextRequestCode(year: number, lastCode: string | null | undefined): string {
  const prefix = requestCodePrefix(year);
  const lastNumber = lastCode?.startsWith(prefix) ? Number.parseInt(lastCode.slice(prefix.length), 10) : 0;
  const next = (Number.isNaN(lastNumber) ? 0 : lastNumber) + 1;
  return `${prefix}${String(next).padStart(REQUEST_CODE_DIGITS, '0')}`;
}

export function randomRetryDelayMs(random: () => number = Math.random): number {
  return MIN_RETRY_DELAY_MS + Math.floor(random() * (MAX_RETRY_DELAY_MS - MIN_RETRY_DELAY_MS + 1));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
