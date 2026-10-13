import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class JobOfferNotFoundException extends DomainException {
  constructor(message = 'Job offer not found') {
    super(message, 404);
  }
}