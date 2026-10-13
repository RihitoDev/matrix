import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchingModule } from '../matching.module.js';
import { MatchingController } from '../controllers/matching.controller.js';
import { MatchingService } from '../services/matching.service.js';
import { NlpService } from '../services/nlp.service.js';
import { VacancyRankingService } from '../services/vacancy-ranking.service.js';
import { WeightedScoreService } from '../services/weighted-score.service.js';

describe('MatchingModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [MatchingModule],
    }).compile();
  });

  it.each([
    MatchingController,
    MatchingService,
    NlpService,
    VacancyRankingService,
    WeightedScoreService,
  ])('resuelve %o', (provider) => {
    expect(moduleRef.get(provider)).toBeInstanceOf(provider);
  });
});
