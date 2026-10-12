import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import {
  SKILL_SEARCH_MAX_LENGTH,
  searchSkillsRequestSchema,
} from '../requests/search-skills.request.js';
import type { SearchSkillsRequest } from '../requests/search-skills.request.js';
import { SkillsService } from '../services/skills.service.js';
import type { SkillResponse } from '../types/skills.types.js';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

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
}
