import { Injectable } from '@nestjs/common';
import { SkillMapper } from '../mappers/skill.mapper.js';
import { SkillRepository } from '../repositories/skill.repository.js';
import type { CreateCustomSkillRequest } from '../requests/create-custom-skill.request.js';
import type { SearchSkillsRequest } from '../requests/search-skills.request.js';
import type { SkillResponse } from '../responses/skill.response.js';

@Injectable()
export class SkillCatalogService {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly skillMapper: SkillMapper,
  ) {}

  async listCatalog(request: SearchSkillsRequest): Promise<SkillResponse[]> {
    const skills = await this.skillRepository.findCatalog(request.search || undefined);
    return skills.map((skill) => this.skillMapper.toResponse(skill));
  }

  async createCustomSkill(request: CreateCustomSkillRequest): Promise<SkillResponse> {
    const existingSkill = await this.skillRepository.findByName(request.name);
    const skill = existingSkill ?? (await this.skillRepository.createCustom(request.name));
    return this.skillMapper.toResponse(skill);
  }
}
