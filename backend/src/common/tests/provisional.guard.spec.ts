import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProvisionalSessionGuard } from '../guards/provisional.guard.js';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';

// Evita cargar el cliente real de Prisma: el guard solo necesita el tipo.
vi.mock('../prisma/client', () => ({ PrismaService: class {} }));

const VALID_ID = '11111111-1111-4111-8111-111111111111';
const VALID_TOKEN = 'valid.jwt.token';

type FakeRequest = {
  headers: Record<string, string | string[] | undefined>;
  user?: unknown;
};

function createContext(request: FakeRequest) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function createGuard(dbUser: unknown, payload: unknown = { sub: VALID_ID, roleTag: 'mentor' }) {
  const findFirst = vi.fn().mockResolvedValue(dbUser);
  const prisma = { user: { findFirst } };
  const verify =
    payload instanceof Error
      ? vi.fn().mockImplementation(() => {
          throw payload;
        })
      : vi.fn().mockReturnValue(payload);
  const jwtService = { verify };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guard = new ProvisionalSessionGuard(jwtService as any, prisma as any);
  return { guard, findFirst, verify };
}

describe('ProvisionalSessionGuard', () => {
  it('responde 401 si falta el header Authorization', async () => {
    const { guard, findFirst, verify } = createGuard(null);
    const ctx = createContext({ headers: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedSessionException);
    expect(verify).not.toHaveBeenCalled();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('responde 401 si el header no tiene el prefijo Bearer', async () => {
    const { guard, findFirst, verify } = createGuard(null);
    const ctx = createContext({ headers: { authorization: VALID_TOKEN } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedSessionException);
    expect(verify).not.toHaveBeenCalled();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('responde 401 si el token es inválido o expiró', async () => {
    const { guard, findFirst } = createGuard(null, new Error('jwt expired'));
    const ctx = createContext({ headers: { authorization: `Bearer ${VALID_TOKEN}` } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedSessionException);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('responde 401 si el usuario del token no existe o está inactivo', async () => {
    const { guard, findFirst } = createGuard(null);
    const ctx = createContext({ headers: { authorization: `Bearer ${VALID_TOKEN}` } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedSessionException);
    expect(findFirst).toHaveBeenCalledOnce();
  });

  it('busca en BD solo el rol vigente del roleTag del token', async () => {
    const { guard, findFirst } = createGuard(null, { sub: VALID_ID, roleTag: 'mentor' });
    const ctx = createContext({ headers: { authorization: `Bearer ${VALID_TOKEN}` } });

    await guard.canActivate(ctx).catch(() => undefined);

    const args = findFirst.mock.calls[0][0];
    expect(args.where).toEqual({ id: VALID_ID, isActive: true });
    expect(args.select.roles.where).toMatchObject({ deletedAt: null, role: { name: 'mentor' } });
  });

  it('responde 401 si el rol del token ya no está vigente', async () => {
    const { guard } = createGuard({ id: VALID_ID, email: 'mentor@test.com', roles: [] });
    const request: FakeRequest = { headers: { authorization: `Bearer ${VALID_TOKEN}` } };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      UnauthorizedSessionException,
    );
    expect(request.user).toBeUndefined();
  });

  it('deja pasar y carga request.user solo con el rol de la sesión', async () => {
    const { guard } = createGuard(
      {
        id: VALID_ID,
        email: 'mentor@test.com',
        roles: [{ role: { name: 'titulado' } }],
      },
      { sub: VALID_ID, roleTag: 'titulado' },
    );
    const request: FakeRequest = { headers: { authorization: `Bearer ${VALID_TOKEN}` } };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      id: VALID_ID,
      email: 'mentor@test.com',
      roles: ['titulado'],
    });
  });
});
