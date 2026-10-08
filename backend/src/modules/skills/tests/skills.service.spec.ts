import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SKILLS_SEARCH_LIMIT,
  SkillsService,
} from '../services/skills.service.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';

describe('SkillsService', () => {
  let prisma: { skill: { findMany: ReturnType<typeof vi.fn> } };
  let service: SkillsService;

  beforeEach(() => {
    prisma = { skill: { findMany: vi.fn() } };
    service = new SkillsService(prisma as unknown as PrismaService);
  });

  it('devuelve una lista vacía si no hay texto de búsqueda', async () => {
    const result = await service.searchSkills(undefined);
    expect(result).toEqual([]);
    expect(prisma.skill.findMany).not.toHaveBeenCalled();
  });

  it('busca sin distinguir mayúsculas, solo habilidades verificadas y con límite', async () => {
    prisma.skill.findMany.mockResolvedValue([{ id: 's1', name: 'Python' }]);

    const result = await service.searchSkills('pyth');

    expect(result).toEqual([{ id: 's1', name: 'Python' }]);
    expect(prisma.skill.findMany).toHaveBeenCalledWith({
      where: {
        isCustom: false,
        name: { contains: 'pyth', mode: 'insensitive' },
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: SKILLS_SEARCH_LIMIT,
    });
  });

  it('devuelve los ids de las habilidades que existen', async () => {
    prisma.skill.findMany.mockResolvedValue([{ id: 's1' }, { id: 's2' }]);

    const result = await service.findExistingSkillIds(['s1', 's2', 's3']);

    expect(result).toEqual(['s1', 's2']);
    expect(prisma.skill.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['s1', 's2', 's3'] } },
      select: { id: true },
    });
  });
});