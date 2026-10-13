import { describe, expect, it } from 'vitest';
import { compareVacancyRank } from '../utils/compare-vacancy-rank.js';
import { VacancyRankingService } from '../services/vacancy-ranking.service.js';

describe('Hierarchical vacancy ranking (#236)', () => {
  it('accepts matching results without mutating the input list', () => {
    const common = {
      careerMatch: true,
      experienceMatch: true,
      allRequiredSkillsMatch: false,
    };
    const vacancies = [
      { ...common, id: 'fewer', matchedSkills: ['Python'] },
      { ...common, id: 'more', matchedSkills: ['Python', 'SQL'] },
    ];
    expect(
      new VacancyRankingService().rank(vacancies).map(({ id }) => id),
    ).toEqual(['more', 'fewer']);
    expect(vacancies.map(({ id }) => id)).toEqual(['fewer', 'more']);
  });
  it('prioritizes career, then experience, then matching skills regardless of score', () => {
    const vacancies = [
      {
        id: 'other-career',
        careerMatch: false,
        experienceMatch: true,
        matchingSkills: 20,
        compatibility: 100,
      },
      {
        id: 'less-experience',
        careerMatch: true,
        experienceMatch: false,
        matchingSkills: 10,
        compatibility: 95,
      },
      {
        id: 'fewer-skills',
        careerMatch: true,
        experienceMatch: true,
        matchingSkills: 1,
        compatibility: 80,
      },
      {
        id: 'best',
        careerMatch: true,
        experienceMatch: true,
        matchingSkills: 2,
        compatibility: 60,
      },
    ];
    expect(vacancies.sort(compareVacancyRank).map(({ id }) => id)).toEqual([
      'best',
      'fewer-skills',
      'less-experience',
      'other-career',
    ]);
  });

  it('preserves repository order when all hierarchy criteria tie', () => {
    const rank = {
      careerMatch: true,
      experienceMatch: true,
      matchingSkills: 2,
    };
    const vacancies = [
      { ...rank, id: 'z' },
      { ...rank, id: 'a' },
    ];
    expect(compareVacancyRank(vacancies[0]!, vacancies[1]!)).toBe(0);
    expect(vacancies.sort(compareVacancyRank).map(({ id }) => id)).toEqual([
      'z',
      'a',
    ]);
  });
});
