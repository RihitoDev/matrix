import type { EventRegistrationsRepository } from '../repositories/event-registrations.repository.js';

export type RegistrationEntity = Awaited<
  ReturnType<EventRegistrationsRepository['findByUserId']>
>[number];
