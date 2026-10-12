import { DomainException } from '../../../common/exceptions/domain.exception.js';
export class EventNotFoundException extends DomainException {
  constructor(id: string) {
    super(`El evento con el id ${id} no fue encontrado`, 404);
  }
}
