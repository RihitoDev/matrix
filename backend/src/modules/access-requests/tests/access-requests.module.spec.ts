import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessRequestsModule } from '../access-requests.module.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

describe('AccessRequestsModule', () => {
  let moduleRef: TestingModule;

  // AuthModule registra JwtModule con JWT_SECRET al importarse
  beforeAll(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AccessRequestsModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it.each([AccessRequestsController, AccessRequestsService, AccessRequestsRepository])('resuelve %o', (provider) => {
    expect(moduleRef.get(provider)).toBeInstanceOf(provider);
  });
});
