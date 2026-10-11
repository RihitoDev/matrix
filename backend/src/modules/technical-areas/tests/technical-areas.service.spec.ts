import { describe, expect, it, vi } from 'vitest';
import type { TechnicalAreasRepository } from '../repositories/technical-areas.repository.js';
import { TechnicalAreasService } from '../services/technical-areas.service.js';
import { TechnicalAreasMapper } from '../mappers/technical-areas.mapper.js';

describe('TechnicalAreasService', () => {
  it('consulta el repositorio y devuelve el resultado del mapper', async () => {
    const areas = [{ id: 'area-1', name: 'Backend', description: 'APIs' }];
    const findAll = vi.fn().mockResolvedValue(areas);
    const repository = {
      findAll,
    } as unknown as TechnicalAreasRepository;
    const mapper = new TechnicalAreasMapper();
    const mappedAreas = areas.map((area) => ({ ...area }));
    const toResponseList = vi
      .spyOn(mapper, 'toResponseList')
      .mockReturnValue(mappedAreas);
    const service = new TechnicalAreasService(repository, mapper);

    const result = await service.findAll();

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(findAll).toHaveBeenCalledWith();
    expect(toResponseList).toHaveBeenCalledExactlyOnceWith(areas);
    expect(result).toBe(mappedAreas);
    expect(result).toEqual(areas);
  });

  it('devuelve una lista vacia cuando no existen areas', async () => {
    const repository = {
      findAll: vi.fn().mockResolvedValue([]),
    } as unknown as TechnicalAreasRepository;
    const mapper = new TechnicalAreasMapper();
    const toResponseList = vi.spyOn(mapper, 'toResponseList');
    const service = new TechnicalAreasService(repository, mapper);

    await expect(service.findAll()).resolves.toEqual([]);
    expect(toResponseList).toHaveBeenCalledExactlyOnceWith([]);
  });
});
