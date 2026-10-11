import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { TechnicalAreasRepository } from '../repositories/technical-areas.repository.js';

describe('TechnicalAreasRepository', () => {
  it('consulta solo los campos publicos ordenados por nombre', async () => {
    const records = [{ id: 'area-1', name: 'Backend', description: null }];
    const findMany = vi.fn().mockResolvedValue(records);
    const prisma = {
      technicalArea: { findMany },
    } as unknown as PrismaService;
    const repository = new TechnicalAreasRepository(prisma);

    const result = await repository.findAll();

    expect(findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual(records);
  });

  it('devuelve una lista vacia cuando Prisma no encuentra areas', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      technicalArea: { findMany },
    } as unknown as PrismaService;
    const repository = new TechnicalAreasRepository(prisma);

    await expect(repository.findAll()).resolves.toEqual([]);
  });
});
