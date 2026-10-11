import { Injectable } from '@nestjs/common';
import type { EducationResponse } from '../responses/education.response.js';
import type { EducationRecord } from '../types/education-record.type.js';

@Injectable()
export class EducationMapper {
  toResponse(record: EducationRecord): EducationResponse {
    return {
      id: record.id,
      institution: record.institution,
      degree: record.degree,
      startDate: record.startDate.toISOString().slice(0, 10),
      endDate: record.endDate?.toISOString().slice(0, 10) ?? null,
      description: record.description,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  toResponseList(records: EducationRecord[]): EducationResponse[] {
    return records.map((record) => this.toResponse(record));
  }
}
