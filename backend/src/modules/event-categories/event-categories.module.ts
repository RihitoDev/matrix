import { Module } from '@nestjs/common';
import { EventCategoriesController } from './controllers/event-categories.controller.js';
import { EventCategoriesService } from './services/event-categories.service.js';
import { EventCategoriesRepository } from './repositories/event-categories.repository.js';

@Module({
  controllers: [EventCategoriesController],
  providers: [EventCategoriesService, EventCategoriesRepository],
  exports: [EventCategoriesService],
})
export class EventCategoriesModule {}
