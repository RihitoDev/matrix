import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { SkillRepository } from '../repositories/skill.repository.js';

const skillId = '33333333-3333-4333-8333-333333333333';
const otherSkillId = '44444444-4444-4444-8444-444444444444';
const select = { id: true, name: true, isCustom: true };

describe('SkillRepository', () => {
  let repository: SkillRepository;
  let skill: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    skill = { findMany: vi.fn(), findFirst: vi.fn(), upsert: vi.fn() };
    repository = new SkillRepository({ skill } as unknown as PrismaService);
  });

  it('lists the official catalog ordered by name', async () => {
    const skills = [{ id: skillId, name: 'Python', isCustom: false }];
    skill.findMany.mockResolvedValue(skills);

    await expect(repository.findCatalog()).resolves.toBe(skills);
    expect(skill.findMany).toHaveBeenCalledWith({
      where: { isCustom: false },
      orderBy: { name: 'asc' },
      select,
    });
  });

  it('filters the catalog by name ignoring case', async () => {
    skill.findMany.mockResolvedValue([]);

    await repository.findCatalog('py');

    expect(skill.findMany).toHaveBeenCalledWith({
      where: { isCustom: false, name: { contains: 'py', mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      select,
    });
  });

  it('finds the skills with the given ids', async () => {
    const skills = [{ id: skillId, name: 'Python', isCustom: false }];
    skill.findMany.mockResolvedValue(skills);

    await expect(repository.findByIds([skillId, otherSkillId])).resolves.toBe(skills);
    expect(skill.findMany).toHaveBeenCalledWith({
      where: { id: { in: [skillId, otherSkillId] } },
      select,
    });
  });

  it('finds a skill by name ignoring case', async () => {
    const record = { id: skillId, name: 'Docker', isCustom: true };
    skill.findFirst.mockResolvedValueOnce(record).mockResolvedValueOnce(null);

    await expect(repository.findByName('docker')).resolves.toBe(record);
    await expect(repository.findByName('kotlin')).resolves.toBeNull();
    expect(skill.findFirst).toHaveBeenCalledWith({
      where: { name: { equals: 'docker', mode: 'insensitive' } },
      select,
    });
  });

  it('creates a custom skill or keeps the one with the same name', async () => {
    const record = { id: skillId, name: 'Kubernetes', isCustom: true };
    skill.upsert.mockResolvedValue(record);

    await expect(repository.createCustom('Kubernetes')).resolves.toBe(record);
    expect(skill.upsert).toHaveBeenCalledWith({
      where: { name: 'Kubernetes' },
      create: { name: 'Kubernetes', isCustom: true },
      update: {},
      select,
    });
  });
});
