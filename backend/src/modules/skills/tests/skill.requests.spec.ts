import { describe, expect, it } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { MAX_USER_SKILLS, SKILL_NAME_MAX_LENGTH } from '../constants/skill.constants.js';
import { DuplicateSkillException } from '../exceptions/duplicate-skill.exception.js';
import { SkillNotFoundException } from '../exceptions/skill-not-found.exception.js';
import { createCustomSkillSchema } from '../requests/create-custom-skill.request.js';
import { searchSkillsSchema } from '../requests/search-skills.request.js';
import { updateUserSkillsSchema } from '../requests/update-user-skills.request.js';

const skillId = '33333333-3333-4333-8333-333333333333';

describe('searchSkillsSchema', () => {
  it('trims the search term and allows it to be missing', () => {
    expect(searchSkillsSchema.parse({ search: '  py ' })).toEqual({ search: 'py' });
    expect(searchSkillsSchema.parse({})).toEqual({});
  });
});

describe('updateUserSkillsSchema', () => {
  it('accepts a list of skill ids, including an empty one', () => {
    expect(updateUserSkillsSchema.parse({ skillIds: [skillId] })).toEqual({ skillIds: [skillId] });
    expect(updateUserSkillsSchema.parse({ skillIds: [] })).toEqual({ skillIds: [] });
  });

  it.each([
    ['a missing list', {}],
    ['an id that is not a uuid', { skillIds: ['python'] }],
    ['too many skills', { skillIds: Array.from({ length: MAX_USER_SKILLS + 1 }, () => skillId) }],
  ])('rejects %s', (_case, body) => {
    expect(updateUserSkillsSchema.safeParse(body).success).toBe(false);
  });
});

describe('createCustomSkillSchema', () => {
  it('trims the name', () => {
    expect(createCustomSkillSchema.parse({ name: '  Kubernetes ' })).toEqual({ name: 'Kubernetes' });
  });

  it('removes extra spaces', () => {
    expect(createCustomSkillSchema.parse({ name: '  spring    boot ' })).toEqual({ name: 'spring boot' });
  });

  it.each(['C++', 'C#', '.NET', 'Node.js', 'CI/CD', 'Diseño UX', 'R&D (Investigación)'])('accepts the real skill name %s', (name) => {
    expect(createCustomSkillSchema.parse({ name })).toEqual({ name });
  });

  it('accepts a name with the maximum length', () => {
    const name = 'Ab'.repeat(SKILL_NAME_MAX_LENGTH / 2);
    expect(createCustomSkillSchema.parse({ name })).toEqual({ name });
  });

  it.each([
    ['a missing name', {}],
    ['an empty name', { name: '   ' }],
    ['a name that is too long', { name: 'a'.repeat(SKILL_NAME_MAX_LENGTH + 1) }],
    ['a name with invalid characters', { name: 'SJCKENN;ONCM;SNV' }],
    ['a name without letters', { name: '9999999' }],
    ['a name repeating the same character', { name: 'SSSSSSSS' }],
    ['a name repeating the same character ignoring case', { name: 'sSsS' }],
  ])('rejects %s', (_case, body) => {
    expect(createCustomSkillSchema.safeParse(body).success).toBe(false);
  });
});

describe('skill exceptions', () => {
  it.each([
    [new DuplicateSkillException(), 409, 'The same skill cannot be added twice'],
    [new SkillNotFoundException(), 404, 'Skill not found'],
  ])('%o uses the expected status and English message', (exception, statusCode, message) => {
    expect(exception).toBeInstanceOf(DomainException);
    expect(exception.statusCode).toBe(statusCode);
    expect(exception.message).toBe(message);
  });
});
