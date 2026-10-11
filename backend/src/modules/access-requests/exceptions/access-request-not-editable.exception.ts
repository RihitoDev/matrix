import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class AccessRequestNotEditableException extends DomainException {
  constructor(message = 'La solicitud ya fue enviada y no se puede modificar') {
    super(message, 409);
  }
}
