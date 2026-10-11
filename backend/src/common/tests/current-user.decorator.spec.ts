import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { getCurrentUser } from '../decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../types/authenticated-user.types.js';

function createContext(user?: AuthenticatedUser) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('getCurrentUser', () => {
  it('devuelve el request.user que dejó el guard de sesión', () => {
    const user: AuthenticatedUser = {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'mentor@test.com',
      roles: ['mentor'],
    };

    expect(getCurrentUser(undefined, createContext(user))).toEqual(user);
  });

  it('devuelve undefined si no hay usuario en el request', () => {
    expect(getCurrentUser(undefined, createContext(undefined))).toBeUndefined();
  });
});
