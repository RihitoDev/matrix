import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class CertificationNotFoundException extends DomainException {
  constructor(message = 'Certification not found') {
    super(message, 404);
  }
}
