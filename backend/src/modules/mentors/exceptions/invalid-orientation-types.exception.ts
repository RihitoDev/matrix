import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class InvalidOrientationTypesException extends DomainException {
  constructor(message = 'Los tipos de orientación seleccionados no son válidos') {
    super(message, 400);
  }
}
