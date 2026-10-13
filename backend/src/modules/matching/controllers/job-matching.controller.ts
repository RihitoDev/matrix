import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { JobMatchingService } from '../services/job-matching.service.js';
import type { JobMatchResponse, RecommendationsResponse } from '../types/job-match.types.js';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('job-offers')
export class JobMatchingController {
  constructor(private readonly jobMatchingService: JobMatchingService) {}

  @Get('recommendations')
  getRecommendations(@CurrentUserId() userId: string): Promise<RecommendationsResponse> {
    return this.jobMatchingService.getRecommendations(userId);
  }

  @Get(':id/match')
  getOfferMatch(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JobMatchResponse> {
    return this.jobMatchingService.getOfferMatch(userId, id);
  }
}