import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrientationTypesRepository } from '../repositories/orientation-types.repository.js';

describe('OrientationTypesRepository', () => {
  const findMany =
    vi.fn<
      () => Promise<
        Awaited<ReturnType<OrientationTypesRepository['findActive']>>
      >
    >();
  const prisma = { orientationType: { findMany } } as unknown as PrismaService;
  let repository: OrientationTypesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new OrientationTypesRepository(prisma);
  });

  it('consulta y devuelve únicamente los tipos de orientación activos', async () => {
    const orientationTypes = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Orientación profesional',
        description: 'Apoyo para el desarrollo profesional',
      },
    ];
    findMany.mockResolvedValue(orientationTypes);

    await expect(repository.findActive()).resolves.toBe(orientationTypes);
    expect(findMany).toHaveBeenCalledOnce();
    expect(findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('devuelve un arreglo vacío cuando no hay tipos activos', async () => {
    findMany.mockResolvedValue([]);

    await expect(repository.findActive()).resolves.toEqual([]);
  });
});
