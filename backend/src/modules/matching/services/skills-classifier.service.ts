import { Injectable } from '@nestjs/common';
import type { DetectedSkillResponse } from '../types/matching.types.js';
import { buildSkillKey } from '../utils/build-skill-key.js';

@Injectable()
export class SkillsClassifierService {
  classify(candidates: string[], catalog: DetectedSkillResponse[]): DetectedSkillResponse[] {
    const catalogByKey = this.buildCatalogIndex(catalog);
    const detected = new Map<string, DetectedSkillResponse>();

    for (const candidate of candidates) {
      const skill = catalogByKey.get(buildSkillKey(candidate));
      if (skill !== undefined && !detected.has(skill.id)) {
        detected.set(skill.id, skill);
      }
    }

    return [...detected.values()];
  }

  private buildCatalogIndex(catalog: DetectedSkillResponse[]): Map<string, DetectedSkillResponse> {
    const skillsByKey = new Map<string, DetectedSkillResponse[]>();

    for (const skill of catalog) {
      const key = buildSkillKey(skill.name);
      if (key.length === 0) continue;
      skillsByKey.set(key, [...(skillsByKey.get(key) ?? []), skill]);
    }

    const index = new Map<string, DetectedSkillResponse>();
    for (const [key, skills] of skillsByKey) {
      const skill = this.resolveCollision(key, skills);
      if (skill !== undefined) index.set(key, skill);
    }
    return index;
  }

  private resolveCollision(
    key: string,
    skills: DetectedSkillResponse[],
  ): DetectedSkillResponse | undefined {
    if (skills.length === 1) return skills[0];

    const exact = skills.filter(
      (skill) => skill.name.trim().toLowerCase().replace(/ /g, '_') === key,
    );
    return exact.length === 1 ? exact[0] : undefined;
  }
}
