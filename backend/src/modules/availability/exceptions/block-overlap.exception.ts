import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class BlockOverlapException extends DomainException {
  constructor(message = 'Ya tienes un bloque en ese horario') {
    super(message, 409);
  }
}
