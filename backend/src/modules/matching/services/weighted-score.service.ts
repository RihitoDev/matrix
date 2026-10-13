import { Injectable } from '@nestjs/common';
import type { ScoreRequirements } from '../types/score-requirements.types.js';
import { calculateWeightedScore } from '../utils/calculate-weighted-score.js';

@Injectable()
export class WeightedScoreService {
  calculate(requirements: ScoreRequirements): number {
    return calculateWeightedScore(requirements);
  }
}
