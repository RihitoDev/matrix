import { describe, expect, it } from 'vitest';
import { SkillMapper } from '../mappers/skill.mapper.js';

const skill = {
  id: '33333333-3333-4333-8333-333333333333',
  name: 'Python',
  isCustom: false,
};

describe('SkillMapper', () => {
  const mapper = new SkillMapper();

  it('maps a skill record to the skill response', () => {
    expect(mapper.toResponse(skill)).toEqual({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Python',
      isCustom: false,
    });
  });

  it('maps a user skill record to the skill response', () => {
    expect(mapper.toUserSkillResponse({ skill: { ...skill, isCustom: true } })).toEqual({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Python',
      isCustom: true,
    });
  });
});
