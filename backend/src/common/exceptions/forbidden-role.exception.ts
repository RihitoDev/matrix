import { DomainException } from './domain.exception.js';

export class ForbiddenRoleException extends DomainException {
  constructor(message = 'No tienes el rol necesario para este recurso') {
    super(message, 403);
  }
}
