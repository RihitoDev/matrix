import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { EDUCATION_DEGREE_INVALID_MESSAGE } from '../constants/education-validation.constants.js';
import { resolveEducationDegree } from './resolve-education-degree.js';

export function validateEducationDegree(institution: string, degree: string): string {
  const resolved = resolveEducationDegree(institution, degree);
  if (!resolved) {
    throw new RequestValidationException([{ field: 'degree', message: EDUCATION_DEGREE_INVALID_MESSAGE }]);
  }
  return resolved;
}
