import { describe, expect, it } from 'vitest';
import { getEducationDegrees, resolveEducationDegree } from './resolve-education-degree';

describe('Education degrees by institution', () => {
  const umss = getEducationDegrees('Universidad Mayor de San Simón (UMSS)');
  const upb = getEducationDegrees('Universidad Privada Boliviana (UPB)');

  it('resolves full names and aliases, ignoring case, diacritics and extra whitespace', () => {
    expect(resolveEducationDegree('  ingenieria   en informatica ', umss)).toBe('Ingeniería Informática');
    expect(resolveEducationDegree('Ingeniería de Inteligencia Artificial', upb)).toBe('Ingeniería en Inteligencia Artificial');
  });

  it('requires a complete match within the selected university', () => {
    for (const name of ['Ingeniería de Inteligencia Artificial', 'Ingeniería', 'Medicina', '', 'invented']) {
      expect(resolveEducationDegree(name, umss)).toBeUndefined();
    }
  });

  it('returns no options for unresolved institutions or programmes outside the catalogue', () => {
    expect(getEducationDegrees('')).toEqual([]);
    expect(getEducationDegrees('Unknown')).toEqual([]);
    expect(getEducationDegrees('Universidad Pedagógica')).toEqual([]);
    expect(resolveEducationDegree('Ingeniería Civil', [])).toBeUndefined();
  });
});
