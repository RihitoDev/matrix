import { DomainException } from './domain.exception.js';

export class FileTooLargeException extends DomainException {
  constructor(message = 'File exceeds the maximum allowed size') {
    super(message, 413);
  }
}
