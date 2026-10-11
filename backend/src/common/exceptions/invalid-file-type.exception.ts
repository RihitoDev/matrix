import { DomainException } from './domain.exception.js';

export class InvalidFileTypeException extends DomainException {
  constructor(message = 'File type is not allowed') {
    super(message, 415);
  }
}
