import { Injectable } from '@nestjs/common';
import type { MentorsRepository } from '../repositories/mentors.repository.js';

@Injectable()
export class MentorMapper {
  toDirectoryResponse(
    mentor: Awaited<ReturnType<MentorsRepository['findActiveMentors']>>[number],
  ) {
    return {
      id: mentor.id,
      fullName: `${mentor.firstName} ${mentor.lastName}`,
      headline: mentor.headline,
      technicalAreas: mentor.mentorTechnicalAreas.map(
        (relation) => relation.technicalArea.name,
      ),
    };
  }

  toDirectoryResponseList(
    mentors: Awaited<ReturnType<MentorsRepository['findActiveMentors']>>,
  ) {
    return mentors.map((mentor) => this.toDirectoryResponse(mentor));
  }

  toProfileResponse(
    mentor: NonNullable<
      Awaited<ReturnType<MentorsRepository['findActiveMentorById']>>
    >,
  ) {
    return {
      id: mentor.id,
      fullName: `${mentor.firstName} ${mentor.lastName}`,
      headline: mentor.headline,
      aboutMe: mentor.aboutMe,
      isAvailable: mentor.isAvailableForMentoring,
      photoUrl: this.bytesToString(mentor.photoUrl),
      city: mentor.city,
      educations: mentor.educations,
      workExperiences: mentor.workExperiences,
      skills: mentor.userSkills.map((relation) => relation.skill),
      certifications: mentor.certifications.map((certification) => ({
        ...certification,
        documentUrl: this.bytesToString(certification.documentUrl),
      })),
      technicalAreas: this.toTechnicalAreasResponse(
        mentor.mentorTechnicalAreas,
      ),
      orientationTypes: this.toOrientationTypesResponse(
        mentor.mentorOrientationTypes,
      ),
    };
  }

  toTechnicalAreasResponse(
    relations: Awaited<
      ReturnType<MentorsRepository['findMentorTechnicalAreas']>
    >,
  ) {
    return relations.map((relation) => relation.technicalArea);
  }

  toOrientationTypesResponse(
    relations: Awaited<
      ReturnType<MentorsRepository['findMentorOrientationTypes']>
    >,
  ) {
    return relations.map((relation) => relation.orientationType);
  }

  private bytesToString(value: Uint8Array | null): string | null {
    return value ? Buffer.from(value).toString('utf8') : null;
  }
}
