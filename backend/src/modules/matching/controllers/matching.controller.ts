import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { MatchingService } from '../services/matching.service.js';
import {
  AnalyzeExperienceBodyDto,
  AnalyzeExperienceParamsDto,
} from '../requests/analyze-experience.schema.js';
import type { AnalyzeExperienceResponse } from '../types/matching.types.js';

@Controller('work-experiences')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post(':id/skills/analysis')
  @HttpCode(HttpStatus.OK)
  analyzeExperience(
    @Param() params: AnalyzeExperienceParamsDto,
    @Body() body: AnalyzeExperienceBodyDto,
  ): AnalyzeExperienceResponse {
    return this.matchingService.analyzeExperience({
      experienceId: params.id,
      text: body.text,
    });
  }
}
