import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class EmptyFileException extends DomainException {
  constructor(message = 'El archivo está vacío') {
    super(message, 400);
  }
}
