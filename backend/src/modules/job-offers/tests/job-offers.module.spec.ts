import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { SkillsValidationService } from '../../vacancies/services/skills-validation.service.js';
import { JobOffersController } from '../job-offers.controller.js';
import { JobOffersModule } from '../job-offers.module.js';
import { JobOffersService } from '../job-offers.service.js';

// Los demás specs mockean las dependencias, así que no detectan un módulo mal cableado
// (Nest falla al arrancar con UnknownDependenciesException). Este compila el módulo real.
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
    expect(moduleRef.get(SkillsValidationService)).toBeDefined();
  });
});
