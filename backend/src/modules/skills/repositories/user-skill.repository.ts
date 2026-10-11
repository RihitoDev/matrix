import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { UserSkillRecord } from '../types/user-skill-record.type.js';
import { skillSelect } from './skill.repository.js';

const userSkillSelect = { skill: { select: skillSelect } } as const;

@Injectable()
export class UserSkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<UserSkillRecord[]> {
    return this.prisma.userSkill.findMany({
      where: { userId },
      orderBy: { skill: { name: 'asc' } },
      select: userSkillSelect,
    });
  }

  async replaceForUser(userId: string, skillIds: string[]): Promise<UserSkillRecord[]> {
    await this.prisma.$transaction([
      this.prisma.userSkill.deleteMany({ where: { userId } }),
      this.prisma.userSkill.createMany({
        data: skillIds.map((skillId) => ({ userId, skillId })),
      }),
    ]);

    return this.findByUserId(userId);
  }
}
