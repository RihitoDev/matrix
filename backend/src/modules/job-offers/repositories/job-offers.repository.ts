import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import {
  JOB_OFFER_CREATED_SELECT,
  JOB_OFFER_SELECT,
} from '../constants/job-offer.constants.js';
import type { CreateJobOfferData } from '../types/create-job-offer-data.type.js';
import type { JobOfferCatalogIds } from '../types/job-offer-catalog-ids.type.js';
import { JobOfferStatus } from '../types/job-offer.enum.js';
import type {
  JobOfferCreatedRecord,
  JobOfferRecord,
} from '../types/job-offer-record.type.js';

@Injectable()
export class JobOffersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async companyExists(companyId: string): Promise<boolean> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    return company !== null;
  }

  async findCatalogIds(
    modality: string,
    contractType: string,
    status: string,
  ): Promise<JobOfferCatalogIds> {
    const [modalityRow, contractTypeRow, statusRow] = await Promise.all([
      this.prisma.jobOfferModality.findUnique({ where: { title: modality }, select: { id: true } }),
      this.prisma.jobOfferContractType.findUnique({
        where: { title: contractType },
        select: { id: true },
      }),
      this.prisma.jobOfferStatus.findUnique({ where: { title: status }, select: { id: true } }),
    ]);

    return {
      modalityId: modalityRow?.id ?? null,
      contractTypeId: contractTypeRow?.id ?? null,
      statusId: statusRow?.id ?? null,
    };
  }

  create(data: CreateJobOfferData): Promise<JobOfferCreatedRecord> {
    const { skillIds, ...jobOffer } = data;
    return this.prisma.jobOffer.create({
      data: {
        ...jobOffer,
        skills: { create: skillIds.map((skillId) => ({ skillId })) },
      },
      select: JOB_OFFER_CREATED_SELECT,
    });
  }

  findPublished(now: Date): Promise<JobOfferRecord[]> {
    return this.prisma.jobOffer.findMany({
      where: {
        status: { title: JobOfferStatus.PUBLISHED },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
      select: JOB_OFFER_SELECT,
    });
  }

  findByCompany(companyId: string): Promise<JobOfferRecord[]> {
    return this.prisma.jobOffer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: JOB_OFFER_SELECT,
    });
  }
}
