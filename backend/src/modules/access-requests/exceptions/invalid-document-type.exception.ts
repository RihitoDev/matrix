import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class InvalidDocumentTypeException extends DomainException {
  constructor(message = 'El tipo de documento no es válido') {
    super(message, 400);
  }
}
