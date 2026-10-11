import type { ExecutionContext } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../prisma/prisma.service.js';
import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.types.js';
import type { LoginJwtPayload } from '../types/login-jwt-payload.types.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const VALID_TOKEN = 'valid.jwt.token';
const VALID_PAYLOAD: LoginJwtPayload = { sub: USER_ID, roleTag: 'mentor' };

function createContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function createRequest(authorization?: string): AuthenticatedRequest {
  return {
    headers: authorization === undefined ? {} : { authorization },
  } as AuthenticatedRequest;
}

function createGuard() {
  const verifyAsync = vi.fn<(token: string) => Promise<LoginJwtPayload>>();
  const jwtService = { verifyAsync } as unknown as JwtService;
  const findFirst = vi.fn().mockResolvedValue({
    id: USER_ID,
    email: 'mentor@test.com',
    roles: [{ role: { name: 'mentor' } }],
  });
  const prisma = { user: { findFirst } } as unknown as PrismaService;

  return {
    guard: new JwtAuthGuard(jwtService, prisma),
    verifyAsync,
    findFirst,
  };
}

describe('JwtAuthGuard', () => {
  it('rechaza requests sin Authorization', async () => {
    const { guard, verifyAsync } = createGuard();

    await expect(
      guard.canActivate(createContext(createRequest())),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rechaza headers sin prefijo Bearer', async () => {
    const { guard, verifyAsync } = createGuard();

    await expect(
      guard.canActivate(createContext(createRequest(VALID_TOKEN))),
    ).rejects.toBeInstanceOf(UnauthorizedSessionException);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rechaza Bearer sin token', async () => {
    const { guard, verifyAsync } = createGuard();

    await expect(
      guard.canActivate(createContext(createRequest('Bearer '))),
    ).rejects.toBeInstanceOf(UnauthorizedSessionException);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it.each(['token inválido', 'token expirado'])('rechaza un %s', async () => {
    const { guard, verifyAsync } = createGuard();
    verifyAsync.mockRejectedValue(new Error('jwt verification failed'));

    await expect(
      guard.canActivate(createContext(createRequest(`Bearer ${VALID_TOKEN}`))),
    ).rejects.toBeInstanceOf(UnauthorizedSessionException);
  });

  it.each([undefined, null, '', '   ', 123])(
    'rechaza payload con sub inválido: %s',
    async (sub) => {
      const { guard, verifyAsync } = createGuard();
      verifyAsync.mockResolvedValue({
        sub,
        roleTag: 'mentor',
      } as unknown as LoginJwtPayload);

      await expect(
        guard.canActivate(
          createContext(createRequest(`Bearer ${VALID_TOKEN}`)),
        ),
      ).rejects.toBeInstanceOf(UnauthorizedSessionException);
    },
  );

  it('verifica el JWT, permite el request y carga request.user', async () => {
    const { guard, verifyAsync, findFirst } = createGuard();
    const request = createRequest(`Bearer ${VALID_TOKEN}`);
    verifyAsync.mockResolvedValue(VALID_PAYLOAD);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledOnce();
    expect(verifyAsync).toHaveBeenCalledWith(VALID_TOKEN);
    expect(findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: USER_ID, isActive: true },
      select: {
        id: true,
        email: true,
        roles: {
          where: {
            deletedAt: null,
            startAt: { lte: expect.any(Date) },
            role: { name: 'mentor' },
          },
          select: { role: { select: { name: true } } },
        },
      },
    });
    expect(request.user).toEqual({
      id: USER_ID,
      email: 'mentor@test.com',
      roles: ['mentor'],
    });
  });

  it.each([undefined, null, '', '   ', 123])(
    'rechaza payload con roleTag invalido: %s sin consultar Prisma',
    async (roleTag) => {
      const { guard, verifyAsync, findFirst } = createGuard();
      verifyAsync.mockResolvedValue({
        sub: USER_ID,
        roleTag,
      } as unknown as LoginJwtPayload);

      await expect(
        guard.canActivate(
          createContext(createRequest(`Bearer ${VALID_TOKEN}`)),
        ),
      ).rejects.toBeInstanceOf(UnauthorizedSessionException);
      expect(findFirst).not.toHaveBeenCalled();
    },
  );

  it('rechaza al usuario inexistente o inactivo sin cargar request.user', async () => {
    const { guard, verifyAsync, findFirst } = createGuard();
    verifyAsync.mockResolvedValue(VALID_PAYLOAD);
    findFirst.mockResolvedValue(null);
    const request = createRequest(`Bearer ${VALID_TOKEN}`);

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Usuario no encontrado o inactivo',
    });
    expect(request.user).toBeUndefined();
  });

  it('rechaza un rol de sesion que ya no esta vigente', async () => {
    const { guard, verifyAsync, findFirst } = createGuard();
    verifyAsync.mockResolvedValue(VALID_PAYLOAD);
    findFirst.mockResolvedValue({
      id: USER_ID,
      email: 'mentor@test.com',
      roles: [],
    });
    const request = createRequest(`Bearer ${VALID_TOKEN}`);

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'El rol de la sesión ya no está vigente',
    });
    expect(request.user).toBeUndefined();
  });

  it('permite la sesion titulado para activar mentorias y usa el email de la BD', async () => {
    const { guard, verifyAsync, findFirst } = createGuard();
    verifyAsync.mockResolvedValue({ sub: USER_ID, roleTag: 'titulado' });
    findFirst.mockResolvedValue({
      id: USER_ID,
      email: 'titulado@test.com',
      roles: [{ role: { name: 'titulado' } }],
    });
    const request = createRequest(`Bearer ${VALID_TOKEN}`);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          roles: expect.objectContaining({
            where: expect.objectContaining({ role: { name: 'titulado' } }),
          }),
        }),
      }),
    );
    expect(request.user).toEqual({
      id: USER_ID,
      email: 'titulado@test.com',
      roles: ['titulado'],
    });
  });
});
