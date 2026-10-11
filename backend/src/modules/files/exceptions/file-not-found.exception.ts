import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class FileNotFoundException extends DomainException {
  constructor(message = 'El archivo no existe') {
    super(message, 404);
  }
}
