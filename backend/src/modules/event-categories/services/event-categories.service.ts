import { Injectable } from '@nestjs/common';
import { EventCategoriesRepository } from '../repositories/event-categories.repository.js';
import { mapEventCategoriesToListResponse } from '../mappers/event-categories.mapper.js';
import type { GetEventCategoriesPayload } from '../requests/get-event-categories.request.js';
import type { EventCategoriesListResponse } from '../types/event-categories.types.js';

@Injectable()
export class EventCategoriesService {
  constructor(
    private readonly eventCategoriesRepository: EventCategoriesRepository,
  ) {}

  async findAll(
    payload: GetEventCategoriesPayload,
  ): Promise<EventCategoriesListResponse> {
    const { page, limit, search } = payload;
    const offset = (page - 1) * limit;

    const { items, total } = await this.eventCategoriesRepository.findAndCount({
      search,
      skip: offset,
      take: limit,
    });

    return mapEventCategoriesToListResponse(items, total, page, limit);
  }
}
