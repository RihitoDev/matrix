import { describe, expect, it } from 'vitest';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { EDUCATION_INSTITUTIONS } from '../constants/education-institutions.constants.js';
import { EducationCatalogService } from '../services/education-catalog.service.js';

describe('EducationCatalogService', () => {
  const service = new EducationCatalogService();

  it('returns the list of allowed institutions', () => {
    expect(service.getInstitutions()).toBe(EDUCATION_INSTITUTIONS);
  });

  it('validates and resolves a valid degree for an institution', () => {
    const resolved = service.validateDegree('UMSS', 'Ingeniería Informática');
    expect(resolved).toBe('Ingeniería Informática');
  });

  it('throws RequestValidationException for an invalid degree', () => {
    expect(() =>
      service.validateDegree('UMSS', 'Carrera Inexistente XYZ'),
    ).toThrow(RequestValidationException);
  });
});
