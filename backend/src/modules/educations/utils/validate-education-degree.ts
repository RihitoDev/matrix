import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { resolveEducationDegree } from './resolve-education-degree.js';

export function validateEducationDegree(institution: string, degree: string): string {
  const resolved = resolveEducationDegree(institution, degree);
  if (!resolved) {
    throw new RequestValidationException([{ field: 'degree', message: 'Selecciona una carrera de Ciencias y Tecnología de la universidad elegida.' }]);
  }
  return resolved;
}
