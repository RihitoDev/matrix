import { describe, expect, it } from 'vitest';
import { EDUCATION_DEGREES } from '../constants/education-degrees.constants';
import { getEducationDegrees, resolveEducationDegree } from './resolve-education-degree';

describe('Education catalogue', () => {
  it('contains 17 universities, each with at least one selectable degree', () => {
    expect(EDUCATION_DEGREES).toHaveLength(17);
    expect(new Set(EDUCATION_DEGREES.map((entry) => entry.institution)).size).toBe(17);
    for (const entry of EDUCATION_DEGREES) {
      const degrees = getEducationDegrees(entry.institution);
      expect(degrees.length).toBeGreaterThan(0);
      for (const degree of entry.degrees) {
        expect(resolveEducationDegree(degree.name, degrees)).toBe(degree.name);
      }
    }
  });

  it.each([
    ['Universidad Central (UNICEN)', 'Licenciatura en Innovación Digital e Inteligencia Artificial'],
    ['Universidad Latinoamericana (ULAT)', 'Ingeniería Civil'],
    ['Universidad Villa de Oropesa (UNIVIOR)', 'Ingeniería de Alimentos'],
  ])('retains %s with its science and technology degrees', (institution, degree) => {
    expect(resolveEducationDegree(degree, getEducationDegrees(institution))).toBe(degree);
  });

  it.each(['Universidad Privada Abierta Latinoamericana (UPAL)', 'Universidad NUR', 'Universidad Pedagógica'])(
    'excludes %s without inventing degrees', (institution) => {
      expect(EDUCATION_DEGREES.some((entry) => entry.institution === institution)).toBe(false);
      expect(getEducationDegrees(institution)).toEqual([]);
    },
  );
});
