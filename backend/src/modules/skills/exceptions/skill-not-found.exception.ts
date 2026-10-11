import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class SkillNotFoundException extends DomainException {
  constructor(message = 'Skill not found') {
    super(message, 404);
  }
}
