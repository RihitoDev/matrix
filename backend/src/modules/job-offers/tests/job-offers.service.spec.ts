import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyNotFoundException, JobOfferCatalogNotFoundException } from '../exceptions/index.js';
import { JobOfferMapper } from '../mappers/job-offer.mapper.js';
import type { JobOffersRepository } from '../repositories/job-offers.repository.js';
import type { CreateJobOfferRequest } from '../requests/create-job-offer.request.js';
import type { JobOfferSkillsService } from '../services/job-offer-skills.service.js';
import { JobOffersService } from '../services/job-offers.service.js';
import { JobOfferContractType, JobOfferModality } from '../types/job-offer.enum.js';
import type { JobOfferRecord } from '../types/job-offer-record.type.js';

const CREATED_AT = new Date('2026-10-12T15:00:00.000Z');

const REQUEST: CreateJobOfferRequest = {
  title: 'DevOps Senior',
  description: 'Descripción',
  modality: JobOfferModality.HYBRID,
  contractType: JobOfferContractType.FULL_TIME,
  category: 'Tecnología',
  positionsAvailable: 2,
  salaryMin: 6500,
  salaryMax: 8000,
  languages: 'Español',
  locationUrl: 'https://maps.google.com/?q=x',
  skillIds: ['skill-1'],
};

const RECORD: JobOfferRecord = {
  id: 'offer-1',
  title: 'DevOps Senior',
  description: 'Descripción',
  category: 'Tecnología',
  positionsAvailable: 2,
  salaryRange: 'Bs 6.500 - 8.000',
  languages: 'Español',
  locationUrl: 'https://maps.google.com/?q=x',
  expiresAt: null,
  createdAt: CREATED_AT,
  company: { id: 'company-1', title: 'TechBolivia S.R.L.' },
  modality: { title: 'Híbrido' },
  contractType: { title: 'Tiempo completo' },
  status: { title: 'Publicada' },
  skills: [{ skill: { id: 'skill-1', name: 'Docker' } }],
};

function createRepository() {
  return {
    companyExists: vi.fn().mockResolvedValue(true),
    findCatalogIds: vi.fn().mockResolvedValue({
      modalityId: 'modality-1',
      contractTypeId: 'contract-1',
      statusId: 'status-1',
    }),
    create: vi.fn().mockResolvedValue({ id: 'offer-1', createdAt: CREATED_AT }),
    findPublished: vi.fn().mockResolvedValue([RECORD]),
    findByCompany: vi.fn().mockResolvedValue([RECORD]),
  };
}

describe('JobOffersService', () => {
  let repository: ReturnType<typeof createRepository>;
  let skillsService: { validateSkillIds: ReturnType<typeof vi.fn>; listCatalog: ReturnType<typeof vi.fn> };
  let service: JobOffersService;

  beforeEach(() => {
    repository = createRepository();
    skillsService = {
      validateSkillIds: vi.fn().mockResolvedValue(undefined),
      listCatalog: vi.fn().mockResolvedValue([{ id: 'skill-1', name: 'Docker' }]),
    };
    service = new JobOffersService(
      repository as unknown as JobOffersRepository,
      skillsService as unknown as JobOfferSkillsService,
      new JobOfferMapper(),
    );
  });

  describe('create', () => {
    it('publica la vacante con el estado Publicada y el salario formateado', async () => {
      const result = await service.create('company-1', REQUEST);

      expect(repository.findCatalogIds).toHaveBeenCalledWith('Híbrido', 'Tiempo completo', 'Publicada');
      expect(repository.create).toHaveBeenCalledWith({
        companyId: 'company-1',
        modalityId: 'modality-1',
        contractTypeId: 'contract-1',
        statusId: 'status-1',
        title: 'DevOps Senior',
        description: 'Descripción',
        category: 'Tecnología',
        positionsAvailable: 2,
        salaryRange: 'Bs 6.500 - 8.000',
        languages: 'Español',
        locationUrl: 'https://maps.google.com/?q=x',
        skillIds: ['skill-1'],
      });
      expect(result).toEqual({ id: 'offer-1', createdAt: CREATED_AT.toISOString() });
    });

    it('valida las tecnologías antes de guardar', async () => {
      skillsService.validateSkillIds.mockRejectedValue(new Error('habilidad inválida'));

      await expect(service.create('company-1', REQUEST)).rejects.toThrow('habilidad inválida');
      expect(skillsService.validateSkillIds).toHaveBeenCalledWith(['skill-1']);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('rechaza una empresa que no existe', async () => {
      repository.companyExists.mockResolvedValue(false);

      await expect(service.create('missing', REQUEST)).rejects.toBeInstanceOf(CompanyNotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it.each([
      ['modalityId', 'modalidad'],
      ['contractTypeId', 'tipo de contrato'],
      ['statusId', 'estado'],
    ])('rechaza la vacante si falta el catálogo %s', async (key, label) => {
      repository.findCatalogIds.mockResolvedValue({
        modalityId: 'modality-1',
        contractTypeId: 'contract-1',
        statusId: 'status-1',
        [key]: null,
      });

      await expect(service.create('company-1', REQUEST)).rejects.toEqual(
        new JobOfferCatalogNotFoundException(label),
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  it('lista las vacantes publicadas con la fecha actual', async () => {
    const result = await service.listPublished();

    expect(repository.findPublished).toHaveBeenCalledWith(expect.any(Date));
    expect(result[0]).toMatchObject({ id: 'offer-1', company: { name: 'TechBolivia S.R.L.' } });
  });

  it('lista las vacantes de una empresa existente', async () => {
    const result = await service.listByCompany('company-1');

    expect(repository.findByCompany).toHaveBeenCalledWith('company-1');
    expect(result).toHaveLength(1);
  });

  it('rechaza listar vacantes de una empresa que no existe', async () => {
    repository.companyExists.mockResolvedValue(false);

    await expect(service.listByCompany('missing')).rejects.toBeInstanceOf(CompanyNotFoundException);
    expect(repository.findByCompany).not.toHaveBeenCalled();
  });

  it('devuelve el catálogo de tecnologías', async () => {
    expect(await service.listSkillCatalog()).toEqual([{ id: 'skill-1', name: 'Docker' }]);
  });
});
