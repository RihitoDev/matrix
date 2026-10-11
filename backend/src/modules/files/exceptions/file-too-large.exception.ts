import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class FileTooLargeException extends DomainException {
  constructor(message = 'El archivo no puede superar los 10 MB') {
    super(message, 413);
  }
}
