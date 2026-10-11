import { DomainException } from './domain.exception.js';

export class InvalidTokenException extends DomainException {
  constructor(message = 'Access token is invalid or expired') {
    super(message, 401);
  }
}
