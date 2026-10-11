import type { ValidationErrorDetail } from '../types/validation-error-detail.type.js';
import { DomainException } from './domain.exception.js';

const DEFAULT_MESSAGE = 'Request validation failed';

function formatErrors(errors: readonly ValidationErrorDetail[]): string {
  return errors
    .map((error) => (error.field ? `${error.field}: ${error.message}` : error.message))
    .join('; ');
}

export class RequestValidationException extends DomainException {
  constructor(readonly errors: ValidationErrorDetail[] = []) {
    super(formatErrors(errors) || DEFAULT_MESSAGE, 400, errors);
  }
}
