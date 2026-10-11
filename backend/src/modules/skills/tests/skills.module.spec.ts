import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ProfileModule } from '../../profile/profile.module.js';
import { SkillController } from '../controllers/skill.controller.js';
import { UserSkillController } from '../controllers/user-skill.controller.js';
import { SkillMapper } from '../mappers/skill.mapper.js';
import { SkillRepository } from '../repositories/skill.repository.js';
import { UserSkillRepository } from '../repositories/user-skill.repository.js';
import { SkillService } from '../services/skill.service.js';
import { SkillsModule } from '../skills.module.js';

describe('SkillsModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [SkillsModule, ProfileModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([
    SkillController,
    UserSkillController,
    SkillService,
    SkillRepository,
    UserSkillRepository,
    SkillMapper,
  ])('provides %p', (provider) => {
    expect(moduleRef.get(provider)).toBeDefined();
  });
});
