import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { JwtAuthModule } from '../guards/jwt-auth.module.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.types.js';

const userId = '11111111-1111-4111-8111-111111111111';

describe('JwtAuthModule', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'module-test-secret';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it('verifies tokens signed with JWT_SECRET, the same secret used by the login', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [JwtAuthModule] }).compile();
    const guard = moduleRef.get(JwtAuthGuard);
    const loginToken = new JwtService({ secret: 'module-test-secret' }).sign({
      sub: userId,
      roleTag: 'titulado',
    });
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${loginToken}` },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: userId, email: '', roles: ['titulado'] });
  });
});
