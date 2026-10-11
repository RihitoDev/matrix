import {
  Body,
  Controller,
  Get,
  Patch,
  StandardSchemaValidationPipe,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import { buildRequestValidationException } from '../../../common/utils/build-request-validation-exception.js';
import { toApiBody } from '../../../common/utils/to-api-body.js';
import {
  updatePersonalInfoSchema,
  type UpdatePersonalInfoRequest,
} from '../requests/update-personal-info.request.js';
import {
  updatePresentationSchema,
  type UpdatePresentationRequest,
} from '../requests/update-presentation.request.js';
import type { ProfileCityResponse } from '../responses/profile-city.response.js';
import type { ProfileResponse } from '../responses/profile.response.js';
import { ProfileService } from '../services/profile.service.js';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Profile of the authenticated user' })
  getProfile(@CurrentUserId() userId: string): Promise<ProfileResponse> {
    return this.profileService.getProfile(userId);
  }

  @Patch('me/personal-info')
  @ApiBody(toApiBody(updatePersonalInfoSchema))
  @ApiOkResponse({ description: 'Updated profile' })
  updatePersonalInfo(
    @CurrentUserId() userId: string,
    @Body({ schema: updatePersonalInfoSchema }) request: UpdatePersonalInfoRequest,
  ): Promise<ProfileResponse> {
    return this.profileService.updatePersonalInfo(userId, request);
  }

  @Patch('me/presentation')
  @ApiBody(toApiBody(updatePresentationSchema))
  @ApiOkResponse({ description: 'Updated profile' })
  updatePresentation(
    @CurrentUserId() userId: string,
    @Body({ schema: updatePresentationSchema }) request: UpdatePresentationRequest,
  ): Promise<ProfileResponse> {
    return this.profileService.updatePresentation(userId, request);
  }

  @Get('cities')
  @ApiOkResponse({ description: 'Cities available for the profile' })
  listCities(): Promise<ProfileCityResponse[]> {
    return this.profileService.listCities();
  }
}
