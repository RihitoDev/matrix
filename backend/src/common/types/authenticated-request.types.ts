import type { Request } from 'express';
import type { AuthenticatedUser } from './authenticated-user.types.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
