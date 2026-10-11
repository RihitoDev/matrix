import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { GRADUATION_YEAR_COHERENCE_MESSAGE } from '../constants/access-request-fields.constants.js';

export class InvalidGraduationYearException extends DomainException {
  constructor(message = GRADUATION_YEAR_COHERENCE_MESSAGE) {
    super(message, 400);
  }
}
