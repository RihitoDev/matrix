import { UnauthorizedSessionException } from './unauthorized-session.exception.js';

export class MissingUserException extends UnauthorizedSessionException {
  constructor(message = 'Authenticated user is required') {
    super(message);
  }
}
