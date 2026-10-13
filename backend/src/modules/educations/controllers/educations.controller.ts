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
  ApiConflictResponse,
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
import { EDUCATION_CONFLICT_MESSAGE, EDUCATION_DUPLICATE_MESSAGE } from '../constants/education-conflict.constants.js';
import {
  createEducationSchema,
  type CreateEducationRequest,
} from '../requests/create-education.request.js';
import { educationIdSchema } from '../requests/education-fields.schema.js';
import {
  updateEducationSchema,
  type UpdateEducationRequest,
} from '../requests/update-education.request.js';
import type { EducationResponse } from '../responses/education.response.js';
import { EducationsService } from '../services/educations.service.js';
import { EducationCatalogService } from '../services/education-catalog.service.js';
import type { EducationInstitution } from '../types/education-institution.type.js';

@ApiTags('educations')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@ApiBadRequestResponse({ description: 'Invalid education data or identifier' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller('educations')
export class EducationsController {
  constructor(
    private readonly service: EducationsService,
    private readonly catalogService: EducationCatalogService,
  ) {}

  @Get('institutions')
  @ApiOkResponse({ description: 'Allowed education institutions and their aliases' })
  getInstitutions(): readonly EducationInstitution[] {
    return this.catalogService.getInstitutions();
  }

  @Get()
  @ApiOkResponse({ description: 'Education records of the authenticated user' })
  findAll(@CurrentUserId() userId: string): Promise<EducationResponse[]> {
    return this.service.findAll(userId);
  }

  @Post()
  @ApiBody(toApiBody(createEducationSchema))
  @ApiCreatedResponse({ description: 'Created education record' })
  @ApiConflictResponse({ description: EDUCATION_DUPLICATE_MESSAGE })
  create(
    @CurrentUserId() userId: string,
    @Body({ schema: createEducationSchema }) request: CreateEducationRequest,
  ): Promise<EducationResponse> {
    return this.service.create(userId, request);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody(toApiBody(updateEducationSchema))
  @ApiOkResponse({ description: 'Updated education record' })
  @ApiConflictResponse({ description: `${EDUCATION_CONFLICT_MESSAGE}; ${EDUCATION_DUPLICATE_MESSAGE}` })
  @ApiNotFoundResponse({
    description: 'Education record not found for this user',
  })
  update(
    @CurrentUserId() userId: string,
    @Param('id', { schema: educationIdSchema }) id: string,
    @Body({ schema: updateEducationSchema }) request: UpdateEducationRequest,
  ): Promise<EducationResponse> {
    return this.service.update(userId, id, request);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Education deleted; the response data is null',
  })
  @ApiNotFoundResponse({
    description: 'Education record not found for this user',
  })
  remove(
    @CurrentUserId() userId: string,
    @Param('id', { schema: educationIdSchema }) id: string,
  ): Promise<void> {
    return this.service.remove(userId, id);
  }
}
