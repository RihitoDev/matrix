import { Injectable } from '@nestjs/common';
import { EDUCATION_INSTITUTIONS } from '../constants/education-institutions.constants.js';
import type { EducationInstitution } from '../types/education-institution.type.js';
import { validateEducationDegree } from '../utils/validate-education-degree.js';

@Injectable()
export class EducationCatalogService {
  getInstitutions(): readonly EducationInstitution[] {
    return EDUCATION_INSTITUTIONS;
  }

  validateDegree(institution: string, degree: string): string {
    return validateEducationDegree(institution, degree);
  }
}
