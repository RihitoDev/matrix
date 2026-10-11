import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class RequestCodeGenerationException extends DomainException {
  constructor(message = 'No se pudo generar el código de la solicitud. Inténtalo de nuevo.') {
    super(message, 503);
  }
}
