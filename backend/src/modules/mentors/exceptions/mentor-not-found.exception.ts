import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class MentorNotFoundException extends DomainException {
  constructor(message = 'El mentor no existe o no está activo') {
    super(message, 404);
  }
}
