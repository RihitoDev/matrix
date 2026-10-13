import type { MATCH_SCORE_WEIGHTS } from '../constants/match-score.constants.js';
import type { RequirementState } from './requirement-state.types.js';

export type ScoreRequirements = Record<
  keyof typeof MATCH_SCORE_WEIGHTS,
  readonly RequirementState[]
>;
