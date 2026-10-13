import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module.js';
import { MentorPhotoController } from './controllers/mentor-photo.controller.js';
import { MentorPhotoService } from './services/mentor-photo.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { MentorsController } from './controllers/mentors.controller.js';
import { MentorsService } from './services/mentors.service.js';
import { MentorsRepository } from './repositories/mentors.repository.js';
import { MentorMapper } from './mappers/mentor.mapper.js';

@Module({
  imports: [AuthModule, ProfileModule],
  controllers: [MentorsController, MentorPhotoController],
  providers: [MentorsService, MentorsRepository, MentorMapper, MentorPhotoService],
  exports: [MentorsService],
})
export class MentorsModule {}
