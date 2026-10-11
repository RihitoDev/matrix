import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { MissingUserException } from '../exceptions/missing-user.exception.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.types.js';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new MissingUserException();
    }

    return userId;
  },
);
