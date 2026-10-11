import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class ProfileNotFoundException extends DomainException {
  constructor(message = 'User profile not found') {
    super(message, 404);
  }
}
