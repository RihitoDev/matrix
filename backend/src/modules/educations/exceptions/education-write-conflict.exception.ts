import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { EDUCATION_CONFLICT_STATUS } from '../constants/education-conflict.constants.js';

export class EducationWriteConflictException extends DomainException {
  constructor() {
    super('No se pudo guardar por cambios simultáneos. Vuelve a intentarlo.', EDUCATION_CONFLICT_STATUS, { code: 'EDUCATION_WRITE_CONFLICT' });
  }
}
