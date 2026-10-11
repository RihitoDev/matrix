import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrientationTypesRepository } from '../repositories/orientation-types.repository.js';
import { OrientationTypesService } from '../services/orientation-types.service.js';
import { OrientationTypesMapper } from '../mappers/orientation-types.mapper.js';

describe('OrientationTypesService', () => {
  const findActive =
    vi.fn<
      () => Promise<
        Awaited<ReturnType<OrientationTypesRepository['findActive']>>
      >
    >();
  const repository = { findActive } as unknown as OrientationTypesRepository;
  let service: OrientationTypesService;
  const mapper = new OrientationTypesMapper();
  const toResponseList = vi.spyOn(mapper, 'toResponseList');

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OrientationTypesService(repository, mapper);
  });

  it('consulta el repository y devuelve exactamente el resultado del mapper', async () => {
    const orientationTypes = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Orientación profesional',
        description: null,
      },
    ];
    findActive.mockResolvedValue(orientationTypes);
    const mappedTypes = orientationTypes.map((record) => ({ ...record }));
    toResponseList.mockReturnValueOnce(mappedTypes);

    await expect(service.findAll()).resolves.toBe(mappedTypes);
    expect(findActive).toHaveBeenCalledOnce();
    expect(findActive).toHaveBeenCalledWith();
    expect(toResponseList).toHaveBeenCalledExactlyOnceWith(orientationTypes);
  });

  it('devuelve un arreglo vacío sin convertirlo en error', async () => {
    findActive.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
    expect(findActive).toHaveBeenCalledOnce();
    expect(toResponseList).toHaveBeenCalledExactlyOnceWith([]);
  });
});
