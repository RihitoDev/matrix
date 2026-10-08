import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { SkillsValidationService } from '../vacancies/services/skills-validation.service.js';
import type { CreateJobOfferPayload } from './create-job-offer.schema.js';
import {
  CompanyNotFoundException,
  JobOfferCatalogNotFoundException,
  SalaryRangeInvalidException,
} from './job-offers.exceptions.js';

// Título del estado que se asigna al publicar (debe existir en job_offer_statuses)
export const JOB_OFFER_PUBLISHED_STATUS = 'Publicada';

const formatBs = (amount: number): string =>
  amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

@Injectable()
export class JobOffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly skillsValidation: SkillsValidationService,
  ) {}

  async create(empresaId: string, payload: CreateJobOfferPayload) {
    const company = await this.prisma.company.findUnique({
      where: { id: empresaId },
      select: { id: true },
    });
    if (!company) throw new CompanyNotFoundException();

    if (
      payload.salarioMax !== undefined &&
      payload.salarioMin > payload.salarioMax
    ) {
      throw new SalaryRangeInvalidException();
    }

    await this.skillsValidation.validateSkillIds(payload.tecnologias);

    const [modality, contractType, status] = await Promise.all([
      this.prisma.jobOfferModality.findUnique({
        where: { title: payload.modalidad },
        select: { id: true },
      }),
      this.prisma.jobOfferContractType.findUnique({
        where: { title: payload.tipoContrato },
        select: { id: true },
      }),
      this.prisma.jobOfferStatus.findUnique({
        where: { title: JOB_OFFER_PUBLISHED_STATUS },
        select: { id: true },
      }),
    ]);
    if (!modality) throw new JobOfferCatalogNotFoundException('modalidad');
    if (!contractType) {
      throw new JobOfferCatalogNotFoundException('tipo de contrato');
    }
    if (!status) throw new JobOfferCatalogNotFoundException('estado');

    const salaryRange =
      payload.salarioMax === undefined
        ? `Bs ${formatBs(payload.salarioMin)}`
        : `Bs ${formatBs(payload.salarioMin)} - ${formatBs(payload.salarioMax)}`;

    const jobOffer = await this.prisma.jobOffer.create({
      data: {
        title: payload.tituloPuesto,
        description: payload.descripcion,
        companyId: empresaId,
        modalityId: modality.id,
        contractTypeId: contractType.id,
        statusId: status.id,
        category: payload.categoria,
        positionsAvailable: payload.numeroVacantes,
        salaryRange,
        languages: payload.idiomas,
        locationUrl: payload.enlaceGoogleMaps,
        skills: {
          create: payload.tecnologias.map((skillId) => ({ skillId })),
        },
      },
      select: { id: true, createdAt: true },
    });

    return {
      id: jobOffer.id,
      fechaCreacion: jobOffer.createdAt,
      mensaje: 'Oferta publicada correctamente',
    };
  }
}