import { GetEventIdSchema } from '../requests/get-event-id.request.js';
import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventsService } from '../services/events.service.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import {
  GetEventsSchema,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '../requests/get-events.request.js';
import type { GetEventsPayload } from '../requests/get-events.request.js';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar eventos',
    description:
      'Retorna una lista paginada de eventos con su categoría y conteo de inscritos activos. startTime y endTime representan la hora local del evento sin zona horaria.',
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
    description: 'Case-insensitive partial match on event title',
    maxLength: MAX_SEARCH_LENGTH,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter events by category UUID',
  })
  @ApiQuery({
    name: 'statusId',
    required: false,
    type: String,
    description: 'UUID del estado para filtrar',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos obtenida exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' })
  findAll(
    @Query(new ZodValidationPipe(GetEventsSchema)) query: GetEventsPayload,
  ) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un evento por ID',
    description:
      'Retorna los detalles de un evento específico según su ID. startTime y endTime representan la hora local del evento sin zona horaria.',
  })
  @ApiParam({ name: 'id', description: 'ID o UUID del evento', example: '123' })
  @ApiResponse({ status: 200, description: 'Evento obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  findOne(
    @Param('id', new ZodValidationPipe(GetEventIdSchema))
    id: string,
  ) {
    return this.eventsService.findOne(id);
  }
}
