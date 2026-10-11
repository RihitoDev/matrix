import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class EducationNotFoundException extends DomainException {
  constructor() {
    super('Education not found', 404);
  }
}
