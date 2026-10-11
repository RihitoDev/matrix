import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventRegistrationsModule } from '../event-registrations.module.js';
import { EventRegistrationsController } from '../controllers/event-registrations.controller.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../auth/guards/jwt-auth.guard.js';

describe('identidad en Mis pases', () => {
  it('resuelve el guard y filtra por cada token, ignorando el userId del query', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, EventRegistrationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ eventRegistration: { findMany } })
      .compile();
    try {
      await moduleRef.init();
      const jwt = moduleRef.get(JwtService);
      const guard = moduleRef.get(JwtAuthGuard);
      const controller = moduleRef.get(EventRegistrationsController);
      const verify = vi.spyOn(jwt, 'verifyAsync');
      for (const sub of ['user-with-passes', 'user-without-passes']) {
        verify.mockResolvedValueOnce({ sub });
        const request = {
          headers: { authorization: `Bearer ${sub}-token` },
          query: { userId: 'other-user' },
        } as unknown as AuthenticatedRequest;
        const context = {
          switchToHttp: () => ({ getRequest: () => request }),
        } as unknown as ExecutionContext;
        await guard.canActivate(context);
        await expect(controller.findMine(request)).resolves.toEqual([]);
        expect(findMany).toHaveBeenLastCalledWith(
          expect.objectContaining({
            where: {
              userId: sub,
              cancelledAt: null,
              status: { title: 'Confirmada' },
            },
          }),
        );
      }
    } finally {
      await moduleRef.close();
    }
  });
});
