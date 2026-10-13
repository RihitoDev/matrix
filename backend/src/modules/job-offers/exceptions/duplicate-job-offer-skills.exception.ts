import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class DuplicateJobOfferSkillsException extends DomainException {
  constructor() {
    super('No se permiten habilidades duplicadas.', 422);
  }
}
