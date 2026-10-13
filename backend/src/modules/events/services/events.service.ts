import { Injectable } from '@nestjs/common';
import { EventNotFoundException } from '../exceptions/event-not-found.exception.js';
import { EventsRepository } from '../repositories/events.repository.js';
import {
  mapEventToResponse,
  mapEventsToListResponse,
} from '../mappers/events.mapper.js';
import type { GetEventsPayload } from '../requests/get-events.request.js';
import type {
  EventDetailResponse,
  EventsListResponse,
} from '../types/events.types.js';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async findAll(payload: GetEventsPayload): Promise<EventsListResponse> {
    const { page, limit, categoryId, statusId, search } = payload;
    const offset = (page - 1) * limit;
    const isPublishedOnly = statusId === undefined;

    const { items, total } = await this.eventsRepository.findAndCount({
      categoryId,
      statusId,
      isPublishedOnly,
      search,
      skip: offset,
      take: limit,
    });

    return mapEventsToListResponse(items, total, page, limit);
  }

  async findOne(id: string): Promise<EventDetailResponse> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new EventNotFoundException(id);
    }

    const availableSpots =
      event.capacity === null
        ? null
        : Math.max(0, event.capacity - event._count.registrations);
    return {
      ...mapEventToResponse(event, availableSpots),
      modality: event.modality,
    };
  }
}
