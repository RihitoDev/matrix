import type { SeedBlock } from './seed-block.types.js';
import type { SeedWeekRange } from './seed-week-range.types.js';

export interface SeedBlockPlan {
  blocks: SeedBlock[];
  free: SeedBlock;
  pending: SeedBlock;
  confirmed: SeedBlock;
  past: SeedBlock | null;
  trioWeek: SeedWeekRange;
  warnings: string[];
}
