import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { EDUCATION_CONFLICT_STATUS, EDUCATION_DUPLICATE_CODE, EDUCATION_DUPLICATE_MESSAGE } from '../constants/education-conflict.constants.js';

export class DuplicateEducationException extends DomainException {
  constructor() {
    super(EDUCATION_DUPLICATE_MESSAGE, EDUCATION_CONFLICT_STATUS, { code: EDUCATION_DUPLICATE_CODE });
  }
}
