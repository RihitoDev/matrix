import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class DuplicateSkillException extends DomainException {
  constructor(message = 'The same skill cannot be added twice') {
    super(message, 409);
  }
}
