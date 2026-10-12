import { Controller, Get, Post, Body, Query, UseGuards, UseInterceptors, UsePipes, StandardSchemaValidationPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import { buildRequestValidationException } from '../../../common/utils/build-request-validation-exception.js';
import { toApiBody } from '../../../common/utils/to-api-body.js';
import {
  SKILL_SEARCH_MAX_LENGTH,
  searchSkillsRequestSchema,
} from '../requests/search-skills.request.js';
import {
  createCustomSkillSchema,
  type CreateCustomSkillRequest,
} from '../requests/create-custom-skill.request.js';
import type { SearchSkillsRequest } from '../requests/search-skills.request.js';
import { SkillsService } from '../services/skills.service.js';
import type { SkillResponse } from '../types/skills.types.js';

@ApiTags('skills')
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Busca tecnologías verificadas por nombre',
    description:
      'Devuelve hasta 20 tecnologías cuyo nombre contenga el texto, sin distinguir mayúsculas de minúsculas. Sin texto devuelve las primeras en orden alfabético.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    maxLength: SKILL_SEARCH_MAX_LENGTH,
    description: 'Texto a buscar dentro del nombre de la tecnología',
    example: 'pyth',
  })
  @ApiOkResponse({
    description: 'Lista de tecnologías coincidentes (vacía si no hay ninguna)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Python' },
        },
      },
    },
  })
  searchSkills(
    @Query(new ZodValidationPipe(searchSkillsRequestSchema))
    query: SearchSkillsRequest,
  ): Promise<SkillResponse[]> {
    return this.skillsService.searchSkills(query.search);
  }

  @UseGuards(JwtAuthGuard)
  @Post('custom')
  @ApiBody(toApiBody(createCustomSkillSchema))
  @ApiCreatedResponse({ description: 'Custom skill, or the existing skill with the same name' })
  createCustomSkill(
    @Body({ schema: createCustomSkillSchema }) request: CreateCustomSkillRequest,
  ): Promise<SkillResponse> {
    return this.skillsService.createCustomSkill(request);
  }
}
