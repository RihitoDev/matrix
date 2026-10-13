import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { JobOffersController } from '../controllers/job-offers.controller.js';
import { JobOffersModule } from '../job-offers.module.js';
import { JobOfferSkillsService } from '../services/job-offer-skills.service.js';
import { JobOffersService } from '../services/job-offers.service.js';

describe('JobOffersModule', () => {
  it('resuelve todas sus dependencias al compilar', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), JobOffersModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(JobOffersController)).toBeDefined();
    expect(moduleRef.get(JobOffersService)).toBeDefined();
    expect(moduleRef.get(JobOfferSkillsService)).toBeDefined();
  });
});
