import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../types/authenticated-user.types.js';

export const getCurrentUser = (
  _data: unknown,
  context: ExecutionContext,
): AuthenticatedUser => {
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(getCurrentUser);
