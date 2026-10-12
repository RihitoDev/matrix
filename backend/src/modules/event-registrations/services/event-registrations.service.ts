import { Injectable } from '@nestjs/common';
import { EventRegistrationsRepository } from '../repositories/event-registrations.repository.js';
import { EventRegistrationsMapper } from '../mappers/event-registrations.mapper.js';
import type { MyRegistrationResponse } from '../types/event-registrations.types.js';

@Injectable()
export class EventRegistrationsService {
  constructor(
    private readonly registrationsRepository: EventRegistrationsRepository,
  ) {}

  async findMine(userId: string): Promise<MyRegistrationResponse[]> {
    const registrations =
      await this.registrationsRepository.findByUserId(userId);
    return EventRegistrationsMapper.toMyRegistrationList(registrations);
  }
}
