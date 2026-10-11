import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class WorkExperienceEndDateRequiredException extends DomainException {
  constructor() {
    super('endDate is required when isCurrent is false', 400);
  }
}
