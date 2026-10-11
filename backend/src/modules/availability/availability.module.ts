import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MentorsModule } from '../mentors/mentors.module.js';
import { AvailabilityController } from './controllers/availability.controller.js';
import { MentorAvailabilityController } from './controllers/mentor-availability.controller.js';
import { AvailabilityService } from './services/availability.service.js';
import { AvailabilityRepository } from './repositories/availability.repository.js';
import { AvailabilityMapper } from './mappers/availability.mapper.js';

@Module({
  imports: [AuthModule, MentorsModule],
  controllers: [AvailabilityController, MentorAvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository, AvailabilityMapper],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
