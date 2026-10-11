import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  StandardSchemaValidationPipe,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import { buildRequestValidationException } from '../../../common/utils/build-request-validation-exception.js';
import { toApiBody } from '../../../common/utils/to-api-body.js';
import {
  createWorkExperienceSchema,
  type CreateWorkExperienceRequest,
} from '../requests/create-work-experience.request.js';
import {
  updateWorkExperienceSchema,
  type UpdateWorkExperienceRequest,
} from '../requests/update-work-experience.request.js';
import { workExperienceIdSchema } from '../requests/work-experience-fields.schema.js';
import type { WorkExperienceResponse } from '../responses/work-experience.response.js';
import { WorkExperienceService } from '../services/work-experience.service.js';

@ApiTags('work-experiences')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@ApiBadRequestResponse({
  description: 'Invalid work experience data or identifier',
})
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller('work-experiences')
export class WorkExperienceController {
  constructor(private readonly service: WorkExperienceService) {}

  @Get()
  @ApiOkResponse({
    description: 'Work experience records of the authenticated user',
  })
  findAll(@CurrentUserId() userId: string): Promise<WorkExperienceResponse[]> {
    return this.service.findAll(userId);
  }

  @Post()
  @ApiBody(toApiBody(createWorkExperienceSchema))
  @ApiCreatedResponse({ description: 'Created work experience record' })
  create(
    @CurrentUserId() userId: string,
    @Body({ schema: createWorkExperienceSchema })
    request: CreateWorkExperienceRequest,
  ): Promise<WorkExperienceResponse> {
    return this.service.create(userId, request);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody(toApiBody(updateWorkExperienceSchema))
  @ApiOkResponse({ description: 'Updated work experience record' })
  @ApiNotFoundResponse({
    description: 'Work experience record not found for this user',
  })
  update(
    @CurrentUserId() userId: string,
    @Param('id', { schema: workExperienceIdSchema }) id: string,
    @Body({ schema: updateWorkExperienceSchema })
    request: UpdateWorkExperienceRequest,
  ): Promise<WorkExperienceResponse> {
    return this.service.update(userId, id, request);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Work experience deleted; the response data is null',
  })
  @ApiNotFoundResponse({
    description: 'Work experience record not found for this user',
  })
  remove(
    @CurrentUserId() userId: string,
    @Param('id', { schema: workExperienceIdSchema }) id: string,
  ): Promise<void> {
    return this.service.remove(userId, id);
  }
}