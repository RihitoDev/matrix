import { DomainException } from '../../../common/exceptions/domain.exception.js';
import {
  EDUCATION_CONFLICT_MESSAGE,
  EDUCATION_CONFLICT_STATUS,
} from '../constants/education-conflict.constants.js';

export class EducationUpdateConflictException extends DomainException {
  constructor() {
    super(EDUCATION_CONFLICT_MESSAGE, EDUCATION_CONFLICT_STATUS);
  }
}
