import { EDUCATION_INSTITUTIONS } from '../constants/education-institutions.constants.js';
import { normalizeEducationText } from './normalize-education-text.js';

export function resolveEducationInstitution(value: string): string | undefined {
  const normalized = normalizeEducationText(value);
  return EDUCATION_INSTITUTIONS.find((institution) =>
    [institution.name, ...institution.aliases].some((name) => normalizeEducationText(name) === normalized),
  )?.name;
}
