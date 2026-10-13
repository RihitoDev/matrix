import { MATCH_SCORE_WEIGHTS } from '../constants/match-score.constants.js';
import type { ScoreRequirements } from '../types/score-requirements.types.js';

export function calculateWeightedScore(
  requirements: ScoreRequirements,
): number {
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const category of Object.keys(
    MATCH_SCORE_WEIGHTS,
  ) as (keyof ScoreRequirements)[]) {
    const items = requirements[category];
    if (items.length === 0) continue;

    const weight = MATCH_SCORE_WEIGHTS[category];
    const fulfilled = items.filter(({ status }) => status === 'Cumple').length;
    totalWeight += weight;
    matchedWeight += (weight * fulfilled) / items.length;
  }

  if (totalWeight === 0) return 100;

  const percentage = (100 * matchedWeight) / totalWeight;
  return Math.max(0, Math.min(100, Math.round(percentage + 1e-10)));
}
