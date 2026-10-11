import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class MentorRoleNotFoundException extends DomainException {
  constructor(message = 'El rol mentor no existe') {
    super(message, 404);
  }
}
