import { Injectable } from '@nestjs/common';
import type { OrientationTypesRepository } from '../repositories/orientation-types.repository.js';

@Injectable()
export class OrientationTypesMapper {
  toResponse(
    record: Awaited<
      ReturnType<OrientationTypesRepository['findActive']>
    >[number],
  ) {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
    };
  }

  toResponseList(
    records: Awaited<ReturnType<OrientationTypesRepository['findActive']>>,
  ) {
    return records.map((record) => this.toResponse(record));
  }
}
