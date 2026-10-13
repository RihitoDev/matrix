import { Module } from '@nestjs/common';
import { MatchingController } from './controllers/matching.controller.js';
import { MatchingService } from './services/matching.service.js';
import { NlpService } from './services/nlp.service.js';
import { SkillsClassifierService } from './services/skills-classifier.service.js';
import { VacancyRankingService } from './services/vacancy-ranking.service.js';
import { WeightedScoreService } from './services/weighted-score.service.js';
import { JobMatchingController } from './controllers/job-matching.controller.js'; 
import { JobMatchingService } from './services/job-matching.service.js';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { SkillsModule } from '../skills/skills.module.js';
import { JobOffersModule } from '../job-offers/job-offers.module.js';

@Module({
  imports: [
    JwtAuthModule, 
    SkillsModule, 
    JobOffersModule
  ],
  controllers: [MatchingController, JobMatchingController],
  providers: [
    MatchingService,
    NlpService,
    SkillsClassifierService,
    VacancyRankingService,
    WeightedScoreService,
    JobMatchingService,
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