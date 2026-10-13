import { Injectable } from '@nestjs/common';
import {
  CompanyNotFoundException,
  JobOfferCatalogNotFoundException,
} from '../exceptions/index.js';
import { JobOfferMapper } from '../mappers/job-offer.mapper.js';
import { JobOffersRepository } from '../repositories/job-offers.repository.js';
import type { CreateJobOfferRequest } from '../requests/create-job-offer.request.js';
import type { JobOfferCreatedResponse } from '../responses/job-offer-created.response.js';
import type {
  JobOfferResponse,
  JobOfferSkillResponse,
} from '../responses/job-offer.response.js';
import { JobOfferStatus } from '../types/job-offer.enum.js';
import { formatSalaryRange } from '../utils/format-salary-range.js';
import { JobOfferSkillsService } from './job-offer-skills.service.js';

@Injectable()
export class JobOffersService {
  constructor(
    private readonly jobOffersRepository: JobOffersRepository,
    private readonly jobOfferSkillsService: JobOfferSkillsService,
    private readonly jobOfferMapper: JobOfferMapper,
  ) {}

  async create(companyId: string, request: CreateJobOfferRequest): Promise<JobOfferCreatedResponse> {
    await this.ensureCompanyExists(companyId);
    await this.jobOfferSkillsService.validateSkillIds(request.skillIds);

    const { modalityId, contractTypeId, statusId } = await this.jobOffersRepository.findCatalogIds(
      request.modality,
      request.contractType,
      JobOfferStatus.PUBLISHED,
    );
    if (!modalityId) throw new JobOfferCatalogNotFoundException('modalidad');
    if (!contractTypeId) throw new JobOfferCatalogNotFoundException('tipo de contrato');
    if (!statusId) throw new JobOfferCatalogNotFoundException('estado');

    const record = await this.jobOffersRepository.create({
      companyId,
      modalityId,
      contractTypeId,
      statusId,
      title: request.title,
      description: request.description,
      category: request.category,
      positionsAvailable: request.positionsAvailable,
      salaryRange: formatSalaryRange(request.salaryMin, request.salaryMax),
      languages: request.languages,
      locationUrl: request.locationUrl,
      skillIds: request.skillIds,
    });

    return this.jobOfferMapper.toCreatedResponse(record);
  }

  async listPublished(): Promise<JobOfferResponse[]> {
    const records = await this.jobOffersRepository.findPublished(new Date());
    return records.map((record) => this.jobOfferMapper.toResponse(record));
  }

  async listByCompany(companyId: string): Promise<JobOfferResponse[]> {
    await this.ensureCompanyExists(companyId);
    const records = await this.jobOffersRepository.findByCompany(companyId);
    return records.map((record) => this.jobOfferMapper.toResponse(record));
  }

  listSkillCatalog(): Promise<JobOfferSkillResponse[]> {
    return this.jobOfferSkillsService.listCatalog();
  }

  private async ensureCompanyExists(companyId: string): Promise<void> {
    const exists = await this.jobOffersRepository.companyExists(companyId);
    if (!exists) throw new CompanyNotFoundException();
  }
}
