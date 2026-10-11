import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class AccessRequestCatalogMissingException extends DomainException {
  constructor(message = 'No se pudo completar la solicitud porque faltan datos base (carreras o estados). Avisa al administrador.') {
    super(message, 500);
  }
}
