import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class WorkExperienceUpdateConflictException extends DomainException {
  constructor() {
    super('Work experience dates changed during the update', 409);
  }
}
