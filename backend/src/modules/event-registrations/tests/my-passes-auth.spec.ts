import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventRegistrationsModule } from '../event-registrations.module.js';
import { EventRegistrationsController } from '../controllers/event-registrations.controller.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.types.js';

describe('identidad en Mis pases', () => {
  it('resuelve el guard y filtra por cada token, ignorando el userId del query', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const findFirst = vi.fn();
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, EventRegistrationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ eventRegistration: { findMany }, user: { findFirst } })
      .compile();
    try {
      await moduleRef.init();
      const jwt = moduleRef.get(JwtService);
      const guard = moduleRef.get(JwtAuthGuard);
      const controller = moduleRef.get(EventRegistrationsController);
      const verify = vi.spyOn(jwt, 'verifyAsync');
      for (const sub of ['user-with-passes', 'user-without-passes']) {
        verify.mockResolvedValueOnce({ sub, roleTag: 'titulado' });
        findFirst.mockResolvedValueOnce({
          id: sub,
          email: 'user@test.com',
          roles: [{ role: { name: 'titulado' } }],
        });
        const request = {
          headers: { authorization: `Bearer ${sub}-token` },
          query: { userId: 'other-user' },
        } as unknown as AuthenticatedRequest;
        const context = {
          switchToHttp: () => ({ getRequest: () => request }),
        } as unknown as ExecutionContext;
        await guard.canActivate(context);
        await expect(controller.findMine(request.user!)).resolves.toEqual([]);
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
  it.each([null, { id: 'user-1', email: 'user@test.com', roles: [] }])(
    'rejects a missing, inactive or roleless account before reading passes: %s',
    async (user) => {
      const findMany = vi.fn();
      const moduleRef = await Test.createTestingModule({ imports: [EventRegistrationsModule] })
        .overrideProvider(PrismaService)
        .useValue({
          eventRegistration: { findMany },
          user: { findFirst: vi.fn().mockResolvedValue(user) },
        })
        .compile();
      try {
        vi.spyOn(moduleRef.get(JwtService), 'verifyAsync').mockResolvedValue({
          sub: 'user-1', roleTag: 'titulado',
        });
        const request = {
          headers: { authorization: 'Bearer valid-token' },
        } as AuthenticatedRequest;
        const context = {
          switchToHttp: () => ({ getRequest: () => request }),
        } as unknown as ExecutionContext;
        await expect(moduleRef.get(JwtAuthGuard).canActivate(context))
          .rejects.toMatchObject({ statusCode: 401 });
        expect(request.user).toBeUndefined();
        expect(findMany).not.toHaveBeenCalled();
      } finally {
        await moduleRef.close();
      }
    },
  );

});
