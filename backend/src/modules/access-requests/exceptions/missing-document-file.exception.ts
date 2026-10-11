import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class MissingDocumentFileException extends DomainException {
  constructor(message = 'Debes adjuntar un archivo') {
    super(message, 400);
  }
}
