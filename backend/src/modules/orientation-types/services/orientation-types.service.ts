import { Injectable } from '@nestjs/common';
import { OrientationTypesRepository } from '../repositories/orientation-types.repository.js';
import { OrientationTypesMapper } from '../mappers/orientation-types.mapper.js';

@Injectable()
export class OrientationTypesService {
  constructor(
    private readonly orientationTypesRepository: OrientationTypesRepository,
    private readonly orientationTypesMapper: OrientationTypesMapper,
  ) {}

  async findAll() {
    const records = await this.orientationTypesRepository.findActive();
    return this.orientationTypesMapper.toResponseList(records);
  }
}
