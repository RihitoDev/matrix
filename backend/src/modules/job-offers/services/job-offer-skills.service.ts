import { Injectable } from '@nestjs/common';
import { SkillCatalogService } from '../../skills/services/skill-catalog.service.js';
import { JOB_OFFER_MAX_SKILLS } from '../constants/job-offer.constants.js';
import {
  DuplicateJobOfferSkillsException,
  JobOfferSkillNotFoundException,
  TooManyJobOfferSkillsException,
} from '../exceptions/index.js';
import type { JobOfferSkillResponse } from '../responses/job-offer.response.js';

@Injectable()
export class JobOfferSkillsService {
  constructor(private readonly skillCatalogService: SkillCatalogService) {}

  async listCatalog(): Promise<JobOfferSkillResponse[]> {
    const catalog = await this.skillCatalogService.listCatalog({});
    return catalog.map(({ id, name }) => ({ id, name }));
  }

  async validateSkillIds(skillIds: string[]): Promise<void> {
    if (skillIds.length > JOB_OFFER_MAX_SKILLS) throw new TooManyJobOfferSkillsException();
    if (new Set(skillIds).size !== skillIds.length) throw new DuplicateJobOfferSkillsException();

    const catalog = await this.skillCatalogService.listCatalog({});
    const catalogIds = new Set(catalog.map((skill) => skill.id));
    if (!skillIds.every((skillId) => catalogIds.has(skillId))) {
      throw new JobOfferSkillNotFoundException();
    }
  }
}
