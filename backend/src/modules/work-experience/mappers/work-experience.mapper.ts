import { Injectable } from '@nestjs/common';
import type { WorkExperienceResponse } from '../responses/work-experience.response.js';
import type { WorkExperienceRecord } from '../types/work-experience-record.type.js';

@Injectable()
export class WorkExperienceMapper {
  toResponse(record: WorkExperienceRecord): WorkExperienceResponse {
    return {
      id: record.id,
      companyName: record.company.title,
      position: record.position,
      startDate: record.startDate.toISOString().slice(0, 10),
      endDate: record.endDate?.toISOString().slice(0, 10) ?? null,
      isCurrent: record.isCurrent,
      description: record.description,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  toResponseList(records: WorkExperienceRecord[]): WorkExperienceResponse[] {
    return records.map((record) => this.toResponse(record));
  }
}