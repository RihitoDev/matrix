import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class JobOfferCatalogNotFoundException extends DomainException {
  constructor(catalog: string) {
    super(`El valor indicado para ${catalog} no existe.`, 422);
  }
}
