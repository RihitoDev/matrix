import {
  Body,
  Controller,
  Get,
  Put,
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
  updateUserSkillsSchema,
  type UpdateUserSkillsRequest,
} from '../requests/update-user-skills.request.js';
import type { SkillResponse } from '../responses/skill.response.js';
import { UserSkillService } from '../services/user-skill.service.js';

@ApiTags('skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller('profile/me/skills')
export class UserSkillController {
  constructor(private readonly userSkillService: UserSkillService) {}

  @Get()
  @ApiOkResponse({ description: 'Skills of the authenticated user' })
  getUserSkills(@CurrentUserId() userId: string): Promise<SkillResponse[]> {
    return this.userSkillService.getUserSkills(userId);
  }

  @Put()
  @ApiBody(toApiBody(updateUserSkillsSchema))
  @ApiOkResponse({ description: 'Saved skills of the authenticated user' })
  updateUserSkills(
    @CurrentUserId() userId: string,
    @Body({ schema: updateUserSkillsSchema }) request: UpdateUserSkillsRequest,
  ): Promise<SkillResponse[]> {
    return this.userSkillService.updateUserSkills(userId, request);
  }
}
