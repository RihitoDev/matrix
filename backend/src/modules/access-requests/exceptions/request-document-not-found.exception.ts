import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class RequestDocumentNotFoundException extends DomainException {
  constructor(message = 'La solicitud no tiene un documento adjunto') {
    super(message, 404);
  }
}
