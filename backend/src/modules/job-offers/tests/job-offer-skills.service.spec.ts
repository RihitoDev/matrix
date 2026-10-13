import { describe, expect, it, vi } from 'vitest';
import type { SkillCatalogService } from '../../skills/services/skill-catalog.service.js';
import {
  DuplicateJobOfferSkillsException,
  JobOfferSkillNotFoundException,
  TooManyJobOfferSkillsException,
} from '../exceptions/index.js';
import { JobOfferSkillsService } from '../services/job-offer-skills.service.js';

const CATALOG = [
  { id: 'docker', name: 'Docker', isCustom: false },
  { id: 'kubernetes', name: 'Kubernetes', isCustom: false },
];

function createService() {
  const skillCatalogService = { listCatalog: vi.fn().mockResolvedValue(CATALOG) };
  const service = new JobOfferSkillsService(skillCatalogService as unknown as SkillCatalogService);
  return { service, skillCatalogService };
}

describe('JobOfferSkillsService', () => {
  it('lista el catálogo cerrado con id y nombre', async () => {
    const { service, skillCatalogService } = createService();

    expect(await service.listCatalog()).toEqual([
      { id: 'docker', name: 'Docker' },
      { id: 'kubernetes', name: 'Kubernetes' },
    ]);
    expect(skillCatalogService.listCatalog).toHaveBeenCalledWith({});
  });

  it('acepta tecnologías del catálogo', async () => {
    const { service } = createService();

    await expect(service.validateSkillIds(['docker', 'kubernetes'])).resolves.toBeUndefined();
  });

  it('rechaza tecnologías que no están en el catálogo', async () => {
    const { service } = createService();

    await expect(service.validateSkillIds(['docker', 'otra'])).rejects.toBeInstanceOf(
      JobOfferSkillNotFoundException,
    );
  });

  it('rechaza tecnologías duplicadas sin consultar el catálogo', async () => {
    const { service, skillCatalogService } = createService();

    await expect(service.validateSkillIds(['docker', 'docker'])).rejects.toBeInstanceOf(
      DuplicateJobOfferSkillsException,
    );
    expect(skillCatalogService.listCatalog).not.toHaveBeenCalled();
  });

  it('rechaza más de 10 tecnologías', async () => {
    const { service } = createService();
    const skillIds = Array.from({ length: 11 }, (_, index) => `skill-${index}`);

    await expect(service.validateSkillIds(skillIds)).rejects.toBeInstanceOf(
      TooManyJobOfferSkillsException,
    );
  });

  it('responde 422 con un mensaje en español', async () => {
    const { service } = createService();

    await expect(service.validateSkillIds(['otra'])).rejects.toMatchObject({
      statusCode: 422,
      message: 'Una o más habilidades no existen en el catálogo.',
    });
  });
});
