import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { EDUCATION_DEGREES } from '../constants/education-degrees.constants.js';
import { EDUCATION_INSTITUTIONS } from '../constants/education-institutions.constants.js';
import { normalizeEducationText } from '../utils/normalize-education-text.js';
import { resolveEducationDegree } from '../utils/resolve-education-degree.js';
import { validateEducationDegree } from '../utils/validate-education-degree.js';

describe('Local education degree catalogues', () => {
  it('keeps frontend and backend catalogues identical without an endpoint or cross-app runtime import', () => {
    const backend = readFileSync(new URL('../constants/education-degrees.constants.ts', import.meta.url), 'utf8');
    const frontend = readFileSync(new URL('../../../../../frontend/src/modules/education/constants/education-degrees.constants.ts', import.meta.url), 'utf8');
    expect(frontend.slice(frontend.indexOf('// Reviewed'))).toBe(backend.slice(backend.indexOf('// Reviewed')));
  });

  it('accounts for every allowed institution with sources and unambiguous degree names', () => {
    expect(EDUCATION_INSTITUTIONS.map((entry) => entry.aliases[0])).toEqual([
      'UMSS', 'UNIBOL Quechua', 'EMI', 'UCB', 'UPB', 'UNIVALLE', 'UNIFRANZ',
      'UDABOL', 'UNICEN', 'UCATEC', 'UPDS', 'UAB', 'UNITEPC', 'USIP', 'ULAT', 'UNIVIOR', 'USB',
    ]);
    expect(EDUCATION_DEGREES.map((entry) => entry.institution)).toEqual(EDUCATION_INSTITUTIONS.map((entry) => entry.name));
    for (const entry of EDUCATION_DEGREES) {
      expect(entry.sources.length).toBeGreaterThan(0);
      expect(entry.degrees.length).toBeGreaterThan(0);
      const names = entry.degrees.flatMap((degree) => [degree.name, ...degree.aliases].map(normalizeEducationText));
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('normalizes aliases, accents, whitespace and case within the selected university', () => {
    expect(resolveEducationDegree(' umss ', '  INGENIERIA   EN INFORMATICA ')).toBe('Ingeniería Informática');
    expect(resolveEducationDegree('UPB', 'ingenieria de inteligencia artificial')).toBe('Ingeniería en Inteligencia Artificial');
  });

  it('rejects partial names, invented names, other areas and cross-university degrees', () => {
    for (const degree of ['ingenieria', 'gggggg', 'Medicina', 'Ingeniería Comercial', 'Ingeniería en Inteligencia Artificial']) {
      expect(resolveEducationDegree('UMSS', degree)).toBeUndefined();
      expect(() => validateEducationDegree('UMSS', degree)).toThrow(RequestValidationException);
    }
    expect(resolveEducationDegree('Unknown', 'Ingeniería Civil')).toBeUndefined();
  });

  it('does not resolve degrees for excluded institutions', () => {
    for (const institution of ['UPAL', 'NUR', 'Universidad Pedagógica']) {
      expect(resolveEducationDegree(institution, 'Ingeniería de Sistemas')).toBeUndefined();
    }
  });
});
