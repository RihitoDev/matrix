import { describe, expect, it, vi } from 'vitest';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { JobOffersController } from '../controllers/job-offers.controller.js';
import type { CreateJobOfferRequest } from '../requests/create-job-offer.request.js';
import type { JobOffersService } from '../services/job-offers.service.js';

function createController() {
  const service = {
    create: vi.fn().mockResolvedValue({ id: 'offer-1', createdAt: '2026-10-12T00:00:00.000Z' }),
    listPublished: vi.fn().mockResolvedValue([]),
    listByCompany: vi.fn().mockResolvedValue([]),
    listSkillCatalog: vi.fn().mockResolvedValue([{ id: 'skill-1', name: 'Docker' }]),
  };
  return { controller: new JobOffersController(service as unknown as JobOffersService), service };
}

describe('JobOffersController', () => {
  it('delega la creación en el servicio', async () => {
    const { controller, service } = createController();
    const request = { title: 'DevOps' } as CreateJobOfferRequest;

    await expect(controller.create('company-1', request)).resolves.toEqual({
      id: 'offer-1',
      createdAt: '2026-10-12T00:00:00.000Z',
    });
    expect(service.create).toHaveBeenCalledWith('company-1', request);
  });

  it('delega los listados y el catálogo en el servicio', async () => {
    const { controller, service } = createController();

    await controller.listPublished();
    await controller.listByCompany('company-1');
    await expect(controller.listSkillCatalog()).resolves.toEqual([{ id: 'skill-1', name: 'Docker' }]);

    expect(service.listPublished).toHaveBeenCalledOnce();
    expect(service.listByCompany).toHaveBeenCalledWith('company-1');
  });

  it('rechaza un id de empresa que no es UUID con el formato estándar de validación', async () => {
    const paramTypes = Reflect.getMetadata(
      '__routeArguments__',
      JobOffersController,
      'listByCompany',
    ) as Record<string, { pipes: { transform: (value: string, metadata: object) => Promise<string> }[] }>;
    const [pipe] = Object.values(paramTypes)[0].pipes;

    await expect(pipe.transform('no-es-uuid', { type: 'param', data: 'companyId' })).rejects.toBeInstanceOf(
      RequestValidationException,
    );
  });
});
