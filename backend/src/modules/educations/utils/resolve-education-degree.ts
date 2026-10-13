import { EDUCATION_DEGREES } from '../constants/education-degrees.constants.js';
import { normalizeEducationText } from './normalize-education-text.js';
import { resolveEducationInstitution } from './resolve-education-institution.js';

export function resolveEducationDegree(institution: string, value: string): string | undefined {
  const institutionName = resolveEducationInstitution(institution);
  const degrees = EDUCATION_DEGREES.find((entry) => entry.institution === institutionName)?.degrees ?? [];
  const normalized = normalizeEducationText(value);
  return degrees.find((degree) => [degree.name, ...degree.aliases]
    .some((name) => normalizeEducationText(name) === normalized))?.name;
}
