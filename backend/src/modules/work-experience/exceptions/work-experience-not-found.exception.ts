import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class WorkExperienceNotFoundException extends DomainException {
  constructor() {
    super('Work experience not found', 404);
  }
}