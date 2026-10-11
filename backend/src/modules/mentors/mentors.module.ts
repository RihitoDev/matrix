import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MentorsController } from './controllers/mentors.controller.js';
import { MentorsService } from './services/mentors.service.js';
import { MentorsRepository } from './repositories/mentors.repository.js';
import { MentorMapper } from './mappers/mentor.mapper.js';

@Module({
  imports: [AuthModule],
  controllers: [MentorsController],
  providers: [MentorsService, MentorsRepository, MentorMapper],
  exports: [MentorsService],
})
export class MentorsModule {}
