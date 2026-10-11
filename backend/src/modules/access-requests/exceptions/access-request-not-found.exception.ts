import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class AccessRequestNotFoundException extends DomainException {
  constructor(message = 'La solicitud de acceso no existe') {
    super(message, 404);
  }
}
