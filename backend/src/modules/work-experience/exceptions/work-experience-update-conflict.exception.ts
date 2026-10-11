import { DomainException } from '../../../common/exceptions/domain.exception.js';
import {
  WORK_EXPERIENCE_CONFLICT_MESSAGE,
  WORK_EXPERIENCE_CONFLICT_STATUS,
} from '../constants/work-experience-conflict.constants.js';

export class WorkExperienceUpdateConflictException extends DomainException {
  constructor() {
    super(WORK_EXPERIENCE_CONFLICT_MESSAGE, WORK_EXPERIENCE_CONFLICT_STATUS);
  }
}
