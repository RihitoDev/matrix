import { Module } from '@nestjs/common';
import { SkillsModule } from '../skills/skills.module.js';
import { SkillsValidationService } from '../vacancies/services/skills-validation.service.js';
import { JobOffersController } from './job-offers.controller.js';
import { JobOffersService } from './job-offers.service.js';

@Module({
  imports: [SkillsModule],
  controllers: [JobOffersController],
  providers: [JobOffersService, SkillsValidationService],
  exports: [JobOffersService],
})
export class JobOffersModule {}