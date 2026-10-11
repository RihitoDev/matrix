import { Injectable } from '@nestjs/common';
import type { TechnicalAreasRepository } from '../repositories/technical-areas.repository.js';

@Injectable()
export class TechnicalAreasMapper {
  toResponse(
    record: Awaited<ReturnType<TechnicalAreasRepository['findAll']>>[number],
  ) {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
    };
  }

  toResponseList(
    records: Awaited<ReturnType<TechnicalAreasRepository['findAll']>>,
  ) {
    return records.map((record) => this.toResponse(record));
  }
}
