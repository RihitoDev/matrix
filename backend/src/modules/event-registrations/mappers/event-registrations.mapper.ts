import type { MyRegistrationResponse } from '../types/event-registrations.types.js';
import type { RegistrationEntity } from '../types/registration-entity.types.js';

export class EventRegistrationsMapper {
  static toMyRegistration(entity: RegistrationEntity): MyRegistrationResponse {
    return {
      id: entity.id,
      eventName: entity.event.title,
      date: entity.event.eventDate,
      startTime: entity.event.startTime,
      endTime: entity.event.endTime,
      location: entity.event.location ?? 'Virtual',
      status: entity.status.title,
    };
  }

  static toMyRegistrationList(
    entities: RegistrationEntity[],
  ): MyRegistrationResponse[] {
    return entities.map((e) => EventRegistrationsMapper.toMyRegistration(e));
  }
}
