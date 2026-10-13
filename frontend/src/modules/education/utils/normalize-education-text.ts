import { EDUCATION_DIACRITICS_PATTERN, EDUCATION_SPACES_PATTERN } from '../constants/education-institutions.constants';

export function normalizeEducationText(value: string): string {
  return value.normalize('NFD').replace(EDUCATION_DIACRITICS_PATTERN, '').trim()
    .replace(EDUCATION_SPACES_PATTERN, ' ').toLowerCase();
}
