import type { SeedBlockPlan } from './seed-block-plan.types.js';
import type { SeedWeeks } from './seed-weeks.types.js';

export interface AvailabilitySeedResult {
  weeks: SeedWeeks;
  plan: SeedBlockPlan;
  statuses: number;
  blocks: number;
  appointments: number;
  warnings: string[];
}
