import { DomainException } from './domain.exception.js';

export class CorruptedFileException extends DomainException {
  constructor(message = 'File content is incomplete or corrupted') {
    super(message, 400, { code: 'CORRUPTED_FILE' });
  }
}
