import { DomainException } from '../../common/exceptions/domain.exception.js';

export class CompanyNotFoundException extends DomainException {
  constructor() {
    super('La empresa no existe.', 404, 'COMPANY_NOT_FOUND');
  }
}

export class SalaryRangeInvalidException extends DomainException {
  constructor() {
    super(
      'El salario minimo no puede ser mayor al salario maximo.',
      422,
      'SALARY_RANGE_INVALID',
    );
  }
}

export class JobOfferCatalogNotFoundException extends DomainException {
  constructor(catalog: string) {
    super(
      `El valor indicado para ${catalog} no existe.`,
      422,
      'JOB_OFFER_CATALOG_NOT_FOUND',
    );
  }
}