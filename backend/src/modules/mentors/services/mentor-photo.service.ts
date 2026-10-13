import { Injectable } from '@nestjs/common';
import { ProfilePhotoService } from '../../profile/services/profile-photo.service.js';
import { MentorNotFoundException } from '../exceptions/index.js';
import { MentorsRepository } from '../repositories/mentors.repository.js';

@Injectable()
export class MentorPhotoService {
  constructor(
    private readonly mentorsRepository: MentorsRepository,
    private readonly profilePhotoService: ProfilePhotoService,
  ) {}

  async getPhoto(userId: string) {
    const mentor = await this.mentorsRepository.findActiveMentorParticipation(
      userId,
      new Date(),
    );

    if (!mentor) {
      throw new MentorNotFoundException();
    }

    return this.profilePhotoService.getPhoto(userId);
  }
}
