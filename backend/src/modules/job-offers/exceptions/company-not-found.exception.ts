import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class CompanyNotFoundException extends DomainException {
  constructor() {
    super('La empresa no existe.', 404);
  }
}
