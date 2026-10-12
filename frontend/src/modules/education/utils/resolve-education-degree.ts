import { EDUCATION_DEGREES } from '../constants/education-degrees.constants';
import type { EducationDegree } from '../types/education-degree.types';
import { normalizeEducationText } from './normalize-education-text';

export function getEducationDegrees(institution: string): readonly EducationDegree[] {
  const name = normalizeEducationText(institution);
  return EDUCATION_DEGREES.find((entry) => normalizeEducationText(entry.institution) === name)?.degrees ?? [];
}

export function resolveEducationDegree(value: string, degrees: readonly EducationDegree[]): string | undefined {
  const normalized = normalizeEducationText(value ?? '');
  return degrees.find((degree) => [degree.name, ...degree.aliases]
    .some((name) => normalizeEducationText(name) === normalized))?.name;
}
