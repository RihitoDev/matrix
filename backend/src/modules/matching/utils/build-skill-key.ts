import { normalizeTerm } from '../../job-connect/services/skill-dictionary.service.js';

export function buildSkillKey(value: string): string {
  return normalizeTerm(value).replace(/ /g, '_');
}
