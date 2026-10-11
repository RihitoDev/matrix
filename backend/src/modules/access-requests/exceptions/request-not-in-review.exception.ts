import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class RequestNotInReviewException extends DomainException {
  constructor(message = 'La solicitud no está en revisión') {
    super(message, 409);
  }
}
