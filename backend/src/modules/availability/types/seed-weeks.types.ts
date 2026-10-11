import type { SeedWeekRange } from './seed-week-range.types.js';

export interface SeedWeeks {
  previous: SeedWeekRange;
  current: SeedWeekRange;
  next: SeedWeekRange;
}
