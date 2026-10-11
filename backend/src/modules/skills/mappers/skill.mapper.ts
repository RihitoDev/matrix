import { Injectable } from '@nestjs/common';
import type { SkillResponse } from '../responses/skill.response.js';
import type { SkillRecord } from '../types/skill-record.type.js';
import type { UserSkillRecord } from '../types/user-skill-record.type.js';

@Injectable()
export class SkillMapper {
  toResponse(record: SkillRecord): SkillResponse {
    return { id: record.id, name: record.name, isCustom: record.isCustom };
  }

  toUserSkillResponse(record: UserSkillRecord): SkillResponse {
    return this.toResponse(record.skill);
  }
}
