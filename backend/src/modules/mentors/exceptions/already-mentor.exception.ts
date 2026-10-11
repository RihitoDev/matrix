import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class AlreadyMentorException extends DomainException {
  constructor(message = 'El usuario ya está registrado como mentor') {
    super(message, 409);
  }
}
