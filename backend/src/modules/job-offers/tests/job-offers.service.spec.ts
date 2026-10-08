import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobOffersService } from '../job-offers.service.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { SkillsValidationService } from '../../vacancies/services/skills-validation.service.js';
import type { CreateJobOfferPayload } from '../create-job-offer.schema.js';
import {
  CompanyNotFoundException,
  JobOfferCatalogNotFoundException,
  SalaryRangeInvalidException,
} from '../job-offers.exceptions.js';

const payload: CreateJobOfferPayload = {
  tituloPuesto: 'Desarrollador Backend',
  descripcion: 'Descripción',
  modalidad: 'Remoto',
  ubicacion: 'Cochabamba',
  tipoContrato: 'Tiempo completo',
  categoria: 'Tecnología',
  numeroVacantes: 2,
  salarioMin: 6500,
  salarioMax: 8000,
  idiomas: 'Español',
  enlaceGoogleMaps: 'https://maps.google.com/?q=x',
  tecnologias: ['s1', 's2'],
};

describe('JobOffersService', () => {
  let prisma: {
    company: { findUnique: ReturnType<typeof vi.fn> };
    jobOfferModality: { findUnique: ReturnType<typeof vi.fn> };
    jobOfferContractType: { findUnique: ReturnType<typeof vi.fn> };
    jobOfferStatus: { findUnique: ReturnType<typeof vi.fn> };
    jobOffer: { create: ReturnType<typeof vi.fn> };
  };
  let skillsValidation: { validateSkillIds: ReturnType<typeof vi.fn> };
  let service: JobOffersService;

  beforeEach(() => {
    prisma = {
      company: { findUnique: vi.fn().mockResolvedValue({ id: 'c1' }) },
      jobOfferModality: { findUnique: vi.fn().mockResolvedValue({ id: 'm1' }) },
      jobOfferContractType: {
        findUnique: vi.fn().mockResolvedValue({ id: 't1' }),
      },
      jobOfferStatus: { findUnique: vi.fn().mockResolvedValue({ id: 'st1' }) },
      jobOffer: {
        create: vi.fn().mockResolvedValue({
          id: 'j1',
          createdAt: new Date('2026-10-07T00:00:00Z'),
        }),
      },
    };
    skillsValidation = { validateSkillIds: vi.fn().mockResolvedValue(undefined) };
    service = new JobOffersService(
      prisma as unknown as PrismaService,
      skillsValidation as unknown as SkillsValidationService,
    );
  });

  it('crea la vacante y devuelve id, fecha y mensaje', async () => {
    const result = await service.create('c1', payload);
    expect(result).toEqual({
      id: 'j1',
      fechaCreacion: new Date('2026-10-07T00:00:00Z'),
      mensaje: 'Oferta publicada correctamente',
    });
  });

  it('guarda el rango salarial con formato', async () => {
    await service.create('c1', payload);
    expect(prisma.jobOffer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ salaryRange: 'Bs 6.500 - 8.000' }),
      }),
    );
  });

  it('guarda un salario fijo cuando no hay máximo', async () => {
    await service.create('c1', {
      ...payload,
      salarioMin: 5000,
      salarioMax: undefined,
    });
    expect(prisma.jobOffer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ salaryRange: 'Bs 5.000' }),
      }),
    );
  });

  it('falla si la empresa no existe', async () => {
    prisma.company.findUnique.mockResolvedValue(null);
    await expect(service.create('c1', payload)).rejects.toBeInstanceOf(
      CompanyNotFoundException,
    );
  });

  it('falla si el salario mínimo supera al máximo', async () => {
    await expect(
      service.create('c1', { ...payload, salarioMin: 9000, salarioMax: 8000 }),
    ).rejects.toBeInstanceOf(SalaryRangeInvalidException);
  });

  it('propaga el error si las habilidades no son válidas', async () => {
    skillsValidation.validateSkillIds.mockRejectedValue(new Error('habilidad'));
    await expect(service.create('c1', payload)).rejects.toThrow('habilidad');
    expect(prisma.jobOffer.create).not.toHaveBeenCalled();
  });

  it('falla si la modalidad no existe en el catálogo', async () => {
    prisma.jobOfferModality.findUnique.mockResolvedValue(null);
    await expect(service.create('c1', payload)).rejects.toBeInstanceOf(
      JobOfferCatalogNotFoundException,
    );
  });

  it('falla si el tipo de contrato no existe en el catálogo', async () => {
    prisma.jobOfferContractType.findUnique.mockResolvedValue(null);
    await expect(service.create('c1', payload)).rejects.toBeInstanceOf(
      JobOfferCatalogNotFoundException,
    );
  });

  it('falla si el estado no existe en el catálogo', async () => {
    prisma.jobOfferStatus.findUnique.mockResolvedValue(null);
    await expect(service.create('c1', payload)).rejects.toBeInstanceOf(
      JobOfferCatalogNotFoundException,
    );
  });
});