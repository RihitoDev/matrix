import { Injectable } from '@nestjs/common';
import { TechnicalAreasRepository } from '../repositories/technical-areas.repository.js';
import { TechnicalAreasMapper } from '../mappers/technical-areas.mapper.js';

@Injectable()
export class TechnicalAreasService {
  constructor(
    private readonly technicalAreasRepository: TechnicalAreasRepository,
    private readonly technicalAreasMapper: TechnicalAreasMapper,
  ) {}

  async findAll() {
    const records = await this.technicalAreasRepository.findAll();
    return this.technicalAreasMapper.toResponseList(records);
  }
}
