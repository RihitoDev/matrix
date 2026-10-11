import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class InvalidFileTypeException extends DomainException {
  constructor(message = 'Solo se permiten archivos JPG, PNG o PDF') {
    super(message, 400);
  }
}
