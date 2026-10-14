import { Module } from '@nestjs/common';
import { MatchingController } from './controllers/matching.controller.js';
import { MatchingService } from './services/matching.service.js';
import { NlpService } from './services/nlp.service.js';
import { SkillsClassifierService } from './services/skills-classifier.service.js';
import { VacancyRankingService } from './services/vacancy-ranking.service.js';
import { WeightedScoreService } from './services/weighted-score.service.js';
import { SkillDictionaryService } from '../job-connect/services/skill-dictionary.service.js';

@Module({
  controllers: [MatchingController],
  providers: [
    MatchingService,
    NlpService,
    SkillsClassifierService,
    VacancyRankingService,
    WeightedScoreService,
    SkillDictionaryService,
  ],
  exports: [
    MatchingService,
    NlpService,
    SkillsClassifierService,
    VacancyRankingService,
    WeightedScoreService,
  ],
})
export class MatchingModule {}