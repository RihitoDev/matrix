import type { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.types.js';
import { AvailabilityModule } from '../availability.module.js';
import { AvailabilityController } from '../controllers/availability.controller.js';
import { MentorAvailabilityController } from '../controllers/mentor-availability.controller.js';

describe('Availability authentication', () => {
  const findFirst = vi.fn();
  let moduleRef: TestingModule;

  beforeEach(async () => {
    findFirst.mockReset();
    moduleRef = await Test.createTestingModule({ imports: [AvailabilityModule] })
      .overrideProvider(PrismaService)
      .useValue({ user: { findFirst } })
      .compile();
    vi.spyOn(moduleRef.get(JwtService), 'verifyAsync').mockResolvedValue({
      sub: 'user-1', roleTag: 'mentor', roles: ['mentor', 'titulado'],
    });
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it.each([
    [AvailabilityController, Object.getOwnPropertyDescriptor(AvailabilityController.prototype, 'create')!.value],
    [AvailabilityController, Object.getOwnPropertyDescriptor(AvailabilityController.prototype, 'findMyBlocks')!.value],
    [AvailabilityController, Object.getOwnPropertyDescriptor(AvailabilityController.prototype, 'updateBlock')!.value],
    [AvailabilityController, Object.getOwnPropertyDescriptor(AvailabilityController.prototype, 'remove')!.value],
    [MentorAvailabilityController, Object.getOwnPropertyDescriptor(MentorAvailabilityController.prototype, 'findMentorFreeBlocks')!.value],
  ])('uses the shared session and role checks for %p', async (controller, handler) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([JwtAuthGuard, RolesGuard]);
    findFirst.mockResolvedValue({
      id: 'user-1', email: 'user@test.com',
      roles: [{ role: { name: 'titulado' } }, { role: { name: 'mentor' } }],
    });
    const request = { headers: { authorization: 'Bearer valid-token' } } as AuthenticatedRequest;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => controller,
    } as unknown as ExecutionContext;
    await expect(moduleRef.get(JwtAuthGuard).canActivate(context)).resolves.toBe(true);
    expect(new RolesGuard(new Reflector()).canActivate(context)).toBe(true);

    findFirst.mockResolvedValue({
      id: 'user-1', email: 'user@test.com', roles: [{ role: { name: 'estudiante' } }],
    });
    await expect(moduleRef.get(JwtAuthGuard).canActivate(context)).resolves.toBe(true);
    if (controller === MentorAvailabilityController) {
      expect(new RolesGuard(new Reflector()).canActivate(context)).toBe(true);
    } else {
      expect(() => new RolesGuard(new Reflector()).canActivate(context)).toThrow();
    }

    findFirst.mockResolvedValue({
      id: 'user-1', email: 'user@test.com',
      roles: [{ role: { name: 'administrativo' } }],
    });
    await expect(moduleRef.get(JwtAuthGuard).canActivate(context)).resolves.toBe(true);
    expect(() => new RolesGuard(new Reflector()).canActivate(context)).toThrow();
  });
});
