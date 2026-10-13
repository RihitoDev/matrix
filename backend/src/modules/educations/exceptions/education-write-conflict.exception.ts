import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { EDUCATION_CONFLICT_STATUS, EDUCATION_WRITE_CONFLICT_CODE, EDUCATION_WRITE_CONFLICT_MESSAGE } from '../constants/education-conflict.constants.js';

export class EducationWriteConflictException extends DomainException {
  constructor() {
    super(EDUCATION_WRITE_CONFLICT_MESSAGE, EDUCATION_CONFLICT_STATUS, { code: EDUCATION_WRITE_CONFLICT_CODE });
  }
}
