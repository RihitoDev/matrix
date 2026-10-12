import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { EventRegistrationsController } from './controllers/event-registrations.controller.js';
import { EventRegistrationsService } from './services/event-registrations.service.js';
import { EventRegistrationsRepository } from './repositories/event-registrations.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [EventRegistrationsController],
  providers: [EventRegistrationsService, EventRegistrationsRepository],
  exports: [EventRegistrationsService],
})
export class EventRegistrationsModule {}
