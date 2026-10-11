import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class InvalidTechnicalAreasException extends DomainException {
  constructor(message = 'Las áreas técnicas seleccionadas no son válidas') {
    super(message, 400);
  }
}
