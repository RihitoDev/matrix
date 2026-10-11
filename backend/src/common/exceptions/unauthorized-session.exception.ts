import { DomainException } from './domain.exception.js';

export class UnauthorizedSessionException extends DomainException {
  constructor(message = 'Sesión inválida o expirada') {
    super(message, 401);
  }
}
