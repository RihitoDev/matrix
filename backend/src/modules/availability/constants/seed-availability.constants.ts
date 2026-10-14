import { BLOCK_STEP_MINUTES } from './create-block.constants.js';

export const MS_PER_MINUTE = 60_000;
export const MS_PER_DAY = 86_400_000;
export const STEP_MS = BLOCK_STEP_MINUTES * MS_PER_MINUTE;

export const BUSY_WEEK_BLOCKS = 50;
export const BUSY_WEEK_BLOCKS_PER_DAY = 8;
export const FALLBACK_TRIO_HOUR = 14;
