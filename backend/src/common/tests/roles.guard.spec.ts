import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../constants/roles.constants.js';
import { Roles } from '../decorators/roles.decorator.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { UnauthorizedSessionException } from '../exceptions/unauthorized-session.exception.js';
import { ForbiddenRoleException } from '../exceptions/forbidden-role.exception.js';

function createContext(user?: { id: string; email: string; roles: string[] }) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => () => undefined,
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
}

function createGuard(requiredRoles: string[] | undefined) {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

const mentor = { id: 'u1', email: 'm@test.com', roles: ['mentor'] };
const titulado = { id: 'u2', email: 't@test.com', roles: ['titulado'] };

describe('RolesGuard', () => {
  it('deja pasar si el endpoint no tiene @Roles', () => {
    const guard = createGuard(undefined);
    expect(guard.canActivate(createContext(titulado))).toBe(true);
  });

  it('deja pasar si @Roles está vacío', () => {
    const guard = createGuard([]);
    expect(guard.canActivate(createContext(titulado))).toBe(true);
  });

  it('deja pasar si el usuario tiene el rol requerido', () => {
    const guard = createGuard(['mentor']);
    expect(guard.canActivate(createContext(mentor))).toBe(true);
  });

  it('deja pasar si el usuario tiene al menos uno de varios roles', () => {
    const guard = createGuard(['mentor', 'titulado']);
    expect(guard.canActivate(createContext(titulado))).toBe(true);
  });

  it('responde 403 si el usuario no tiene el rol requerido', () => {
    const guard = createGuard(['mentor']);
    expect(() => guard.canActivate(createContext(titulado))).toThrow(
      ForbiddenRoleException,
    );
  });

  it('responde 401 si no hay usuario (el guard de sesión no corrió antes)', () => {
    const guard = createGuard(['mentor']);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      UnauthorizedSessionException,
    );
  });
});

describe('@Roles', () => {
  it('guarda los roles como metadata bajo ROLES_KEY', () => {
    class TestController {}
    (Roles('mentor', 'titulado') as ClassDecorator)(TestController);

    const stored = new Reflector().get<string[]>(ROLES_KEY, TestController);
    expect(stored).toEqual(['mentor', 'titulado']);
  });
});
