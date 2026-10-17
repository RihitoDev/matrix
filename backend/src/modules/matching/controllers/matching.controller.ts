import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { MatchingService } from '../services/matching.service.js';
import {
  AnalyzeExperienceBodyDto,
  AnalyzeExperienceParamsDto,
} from '../requests/analyze-experience.schema.js';
import type { AnalyzeExperienceResponse } from '../types/matching.types.js';

@ApiTags('work-experiences')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@UseGuards(JwtAuthGuard)
@Controller('work-experiences')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post(':id/skills/analysis')
  @HttpCode(HttpStatus.OK)
  analyzeExperience(
    @Param() params: AnalyzeExperienceParamsDto,
    @Body() body: AnalyzeExperienceBodyDto,
  ): Promise<AnalyzeExperienceResponse> {
    return this.matchingService.analyzeExperience({
      experienceId: params.id,
      text: body.text,
    });
  }
}
