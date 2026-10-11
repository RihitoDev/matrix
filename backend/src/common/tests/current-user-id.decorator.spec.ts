import type { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants.js';
import { describe, expect, it } from 'vitest';
import { CurrentUserId } from '../decorators/current-user-id.decorator.js';
import { MissingUserException } from '../exceptions/missing-user.exception.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.types.js';

type ParamFactory = (data: unknown, context: ExecutionContext) => string;

function getFactory(): ParamFactory {
  class TestController {
    handler(): void {}
  }
  CurrentUserId()(TestController.prototype, 'handler', 0);
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'handler') as Record<
    string,
    { factory: ParamFactory }
  >;
  return Object.values(metadata)[0].factory;
}

const buildContext = (request: Partial<AuthenticatedRequest>): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('CurrentUserId', () => {
  const factory = getFactory();

  it('returns the id of the user authenticated by the guard', () => {
    const request = { user: { id: 'user-1', email: 'user@umss.edu', roles: ['titulado'] } };

    expect(factory(undefined, buildContext(request))).toBe('user-1');
  });

  it('ignores the x-user-id header', () => {
    const request = { headers: { 'x-user-id': 'user-1' } };

    expect(() => factory(undefined, buildContext(request))).toThrow(MissingUserException);
  });
});
