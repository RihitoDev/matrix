import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class CvNotFoundException extends DomainException {
  constructor(message = 'CV not found') {
    super(message, 404);
  }
}
