import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class ActiveAccessRequestExistsException extends DomainException {
  constructor(message = 'Ya tienes una solicitud activa') {
    super(message, 409);
  }
}
