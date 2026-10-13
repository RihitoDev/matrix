import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { JOB_OFFER_CREATED_SELECT, JOB_OFFER_SELECT } from '../constants/job-offer.constants.js';
import { JobOffersRepository } from '../repositories/job-offers.repository.js';

function createPrisma() {
  return {
    company: { findUnique: vi.fn() },
    jobOfferModality: { findUnique: vi.fn() },
    jobOfferContractType: { findUnique: vi.fn() },
    jobOfferStatus: { findUnique: vi.fn() },
    jobOffer: { create: vi.fn(), findMany: vi.fn() },
  };
}

describe('JobOffersRepository', () => {
  let prisma: ReturnType<typeof createPrisma>;
  let repository: JobOffersRepository;

  beforeEach(() => {
    prisma = createPrisma();
    repository = new JobOffersRepository(prisma as unknown as PrismaService);
  });

  it('indica si la empresa existe', async () => {
    prisma.company.findUnique.mockResolvedValueOnce({ id: 'company-1' }).mockResolvedValueOnce(null);

    expect(await repository.companyExists('company-1')).toBe(true);
    expect(await repository.companyExists('missing')).toBe(false);
    expect(prisma.company.findUnique).toHaveBeenCalledWith({
      where: { id: 'company-1' },
      select: { id: true },
    });
  });

  it('busca los ids de los catálogos por título y devuelve null si falta alguno', async () => {
    prisma.jobOfferModality.findUnique.mockResolvedValue({ id: 'modality-1' });
    prisma.jobOfferContractType.findUnique.mockResolvedValue(null);
    prisma.jobOfferStatus.findUnique.mockResolvedValue({ id: 'status-1' });

    const ids = await repository.findCatalogIds('Híbrido', 'Otro', 'Publicada');

    expect(ids).toEqual({ modalityId: 'modality-1', contractTypeId: null, statusId: 'status-1' });
    expect(prisma.jobOfferModality.findUnique).toHaveBeenCalledWith({
      where: { title: 'Híbrido' },
      select: { id: true },
    });
  });

  it('devuelve todos los ids en null si los catálogos no están sembrados', async () => {
    prisma.jobOfferModality.findUnique.mockResolvedValue(null);
    prisma.jobOfferContractType.findUnique.mockResolvedValue({ id: 'contract-1' });
    prisma.jobOfferStatus.findUnique.mockResolvedValue(null);

    expect(await repository.findCatalogIds('Remoto', 'Pasantía', 'Publicada')).toEqual({
      modalityId: null,
      contractTypeId: 'contract-1',
      statusId: null,
    });
  });

  it('crea la vacante junto con sus tecnologías', async () => {
    prisma.jobOffer.create.mockResolvedValue({ id: 'offer-1', createdAt: new Date() });

    await repository.create({
      companyId: 'company-1',
      modalityId: 'modality-1',
      contractTypeId: 'contract-1',
      statusId: 'status-1',
      title: 'DevOps',
      description: 'Descripción',
      category: 'Tecnología',
      positionsAvailable: 1,
      salaryRange: 'Bs 5.000',
      languages: 'Español',
      locationUrl: 'https://goo.gl/maps/a',
      skillIds: ['skill-1', 'skill-2'],
    });

    expect(prisma.jobOffer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: 'company-1',
        title: 'DevOps',
        skills: { create: [{ skillId: 'skill-1' }, { skillId: 'skill-2' }] },
      }),
      select: JOB_OFFER_CREATED_SELECT,
    });
    expect(prisma.jobOffer.create.mock.calls[0][0].data).not.toHaveProperty('skillIds');
  });

  it('lista solo las vacantes publicadas y vigentes', async () => {
    const now = new Date('2026-10-12T00:00:00.000Z');
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findPublished(now);

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {
        status: { title: 'Publicada' },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
      select: JOB_OFFER_SELECT,
    });
  });

  it('lista las vacantes de una empresa', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findByCompany('company-1');

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: { companyId: 'company-1' },
      orderBy: { createdAt: 'desc' },
      select: JOB_OFFER_SELECT,
    });
  });
});
