import { Injectable } from '@nestjs/common';
import type { JobOfferCreatedResponse } from '../responses/job-offer-created.response.js';
import type { JobOfferResponse } from '../responses/job-offer.response.js';
import type {
  JobOfferCreatedRecord,
  JobOfferRecord,
} from '../types/job-offer-record.type.js';

@Injectable()
export class JobOfferMapper {
  toCreatedResponse(record: JobOfferCreatedRecord): JobOfferCreatedResponse {
    return { id: record.id, createdAt: record.createdAt.toISOString() };
  }

  toResponse(record: JobOfferRecord): JobOfferResponse {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      category: record.category,
      modality: record.modality.title,
      contractType: record.contractType.title,
      status: record.status.title,
      positionsAvailable: record.positionsAvailable,
      salaryRange: record.salaryRange,
      languages: record.languages,
      locationUrl: record.locationUrl,
      expiresAt: record.expiresAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      company: { id: record.company.id, name: record.company.title },
      skills: record.skills.map(({ skill }) => ({ id: skill.id, name: skill.name })),
    };
  }
}
