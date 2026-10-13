import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class JobOfferSkillNotFoundException extends DomainException {
  constructor() {
    super('Una o más habilidades no existen en el catálogo.', 422);
  }
}
