import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class InvalidEducationDateRangeException extends DomainException {
  constructor() {
    super('endDate cannot be earlier than startDate', 400);
  }
}
