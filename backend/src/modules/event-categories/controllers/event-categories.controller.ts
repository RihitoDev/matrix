import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventCategoriesService } from '../services/event-categories.service.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import {
  GetEventCategoriesSchema,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../requests/get-event-categories.request.js';
import type { GetEventCategoriesPayload } from '../requests/get-event-categories.request.js';

@ApiTags('Event categories')
@Controller('event-categories')
export class EventCategoriesController {
  constructor(
    private readonly eventCategoriesService: EventCategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar categorías de eventos',
    description:
      'Retorna una lista paginada de categorías de eventos con filtro opcional por nombre.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (mínimo 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: `Resultados por página (máximo ${MAX_PAGE_SIZE})`,
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Case-insensitive partial match on category name',
    maxLength: MAX_SEARCH_LENGTH,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' })
  findAll(
    @Query(new ZodValidationPipe(GetEventCategoriesSchema))
    query: GetEventCategoriesPayload,
  ) {
    return this.eventCategoriesService.findAll(query);
  }
}
