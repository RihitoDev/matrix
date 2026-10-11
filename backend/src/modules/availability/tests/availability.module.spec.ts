import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityModule } from '../availability.module.js';
import { AvailabilityController } from '../controllers/availability.controller.js';
import { MentorAvailabilityController } from '../controllers/mentor-availability.controller.js';
import { AvailabilityService } from '../services/availability.service.js';
import { AvailabilityRepository } from '../repositories/availability.repository.js';
import { AvailabilityMapper } from '../mappers/availability.mapper.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

describe('AvailabilityModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, AvailabilityModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([
    AvailabilityController,
    MentorAvailabilityController,
    AvailabilityService,
    AvailabilityRepository,
    AvailabilityMapper,
  ])('resuelve %o', (provider) => {
    expect(moduleRef.get(provider)).toBeInstanceOf(provider);
  });
});
