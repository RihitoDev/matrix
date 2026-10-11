import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { SkillRecord } from '../types/skill-record.type.js';

export const skillSelect = { id: true, name: true, isCustom: true } as const;

@Injectable()
export class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCatalog(search?: string): Promise<SkillRecord[]> {
    return this.prisma.skill.findMany({
      where: {
        isCustom: false,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
      select: skillSelect,
    });
  }

  findByIds(ids: string[]): Promise<SkillRecord[]> {
    return this.prisma.skill.findMany({
      where: { id: { in: ids } },
      select: skillSelect,
    });
  }

  findByName(name: string): Promise<SkillRecord | null> {
    return this.prisma.skill.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: skillSelect,
    });
  }

  createCustom(name: string): Promise<SkillRecord> {
    return this.prisma.skill.upsert({
      where: { name },
      create: { name, isCustom: true },
      update: {},
      select: skillSelect,
    });
  }
}
