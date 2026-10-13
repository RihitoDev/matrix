import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  StandardSchemaValidationPipe,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import { buildRequestValidationException } from '../../../common/utils/build-request-validation-exception.js';
import { toApiBody } from '../../../common/utils/to-api-body.js';
import {
  createCustomSkillSchema,
  type CreateCustomSkillRequest,
} from '../requests/create-custom-skill.request.js';
import {
  searchSkillsSchema,
  type SearchSkillsRequest,
} from '../requests/search-skills.request.js';
import type { SkillResponse } from '../responses/skill.response.js';
import { SkillCatalogService } from '../services/skill-catalog.service.js';

@ApiTags('skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller('skills')
export class SkillController {
  constructor(private readonly skillCatalogService: SkillCatalogService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'Skills of the catalog that match the search' })
  listCatalog(
    @Query({ schema: searchSkillsSchema }) request: SearchSkillsRequest,
  ): Promise<SkillResponse[]> {
    return this.skillCatalogService.listCatalog(request);
  }

  @Post('custom')
  @ApiBody(toApiBody(createCustomSkillSchema))
  @ApiCreatedResponse({ description: 'Custom skill, or the existing skill with the same name' })
  createCustomSkill(
    @Body({ schema: createCustomSkillSchema }) request: CreateCustomSkillRequest,
  ): Promise<SkillResponse> {
    return this.skillCatalogService.createCustomSkill(request);
  }
}
