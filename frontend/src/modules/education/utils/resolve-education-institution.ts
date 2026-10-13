import type { EducationInstitution } from '../types/education-institution.types';
import { normalizeEducationText } from './normalize-education-text';

export function resolveEducationInstitution(value: string, institutions: readonly EducationInstitution[]): string | undefined {
  const normalized = normalizeEducationText(value ?? '');
  return (institutions ?? []).find((institution) =>
    [institution.name, ...(institution.aliases ?? [])].some((name) => normalizeEducationText(name) === normalized),
  )?.name;
}
