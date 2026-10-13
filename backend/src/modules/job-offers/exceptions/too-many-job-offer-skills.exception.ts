import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { JOB_OFFER_MAX_SKILLS } from '../constants/job-offer.constants.js';

export class TooManyJobOfferSkillsException extends DomainException {
  constructor() {
    super(`No se pueden seleccionar más de ${JOB_OFFER_MAX_SKILLS} habilidades.`, 422);
  }
}
