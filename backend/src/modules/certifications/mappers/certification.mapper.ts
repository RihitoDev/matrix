import { Injectable } from '@nestjs/common';
import type { CertificationRecord } from '../types/certification-record.type.js';
import type { CertificationResponse } from '../types/certification-response.type.js';

@Injectable()
export class CertificationMapper {
  toResponse(
    record: CertificationRecord,
    hasDocument = false,
  ): CertificationResponse {
    return {
      id: record.id,
      name: record.name,
      issuingOrganization: record.issuingOrganization,
      issueDate: record.issueDate.toISOString().slice(0, 10),
      hasDocument,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  toResponseList(
    records: CertificationRecord[],
    idsWithDocument: ReadonlySet<string> = new Set(),
  ): CertificationResponse[] {
    return records.map((record) =>
      this.toResponse(record, idsWithDocument.has(record.id)),
    );
  }
}
