import { describe, expect, it } from 'vitest';
import { calculateWeightedScore } from '../utils/calculate-weighted-score.js';
import type { RequirementState } from '../types/requirement-state.types.js';
import { WeightedScoreService } from '../services/weighted-score.service.js';

const met: RequirementState = { name: 'Met', status: 'Cumple' };
const pending: RequirementState = { name: 'Pending', status: 'Pendiente' };

describe('Weighted compatibility formula (#275)', () => {
  it.each([
    [[], 100],
    [[pending], 0],
    [[met], 100],
    [[met, pending], 50],
  ] as [RequirementState[], number][])(
    'calculates boundary cases %j',
    (skills, expected) => {
      expect(
        new WeightedScoreService().calculate({
          skills,
          academicRequirements: [],
          experienceRequirements: [],
          otherRequirements: [],
        }),
      ).toBe(expected);
    },
  );
  it('returns 65 for half the skills, all education and experience, and no other requirements met', () => {
    expect(
      calculateWeightedScore({
        skills: [met, pending],
        academicRequirements: [met],
        experienceRequirements: [met],
        otherRequirements: [pending],
      }),
    ).toBe(65);
  });

  it('normalizes only the requested categories: 60 / 85 becomes 71 percent', () => {
    expect(
      calculateWeightedScore({
        skills: [met],
        academicRequirements: [pending],
        experienceRequirements: [],
        otherRequirements: [],
      }),
    ).toBe(71);
  });

  it('rounds a mathematical 55.5 percent up despite floating point error', () => {
    expect(
      calculateWeightedScore({
        skills: Array.from({ length: 20 }, (_, i) => (i < 11 ? met : pending)),
        academicRequirements: Array.from({ length: 10 }, (_, i) =>
          i < 7 ? met : pending,
        ),
        experienceRequirements: [pending],
        otherRequirements: [met],
      }),
    ).toBe(56);
  });

  it('Debe retornar 100% de estabilidad matematica si todas las categorias del perfil estan totalmente vacias', () => {
    const emptyProfileScore = calculateWeightedScore({
      skills: [],
      academicRequirements: [],
      experienceRequirements: [],
      otherRequirements: [],
    });
    expect(emptyProfileScore).toBe(100);
  });

  it('Debe retornar 100% exacto ante un perfil que cumple absolutamente todos los requisitos en todas las categorias', () => {
    const perfectProfileScore = calculateWeightedScore({
      skills: [met, met],
      academicRequirements: [met],
      experienceRequirements: [met],
      otherRequirements: [met],
    });
    expect(perfectProfileScore).toBe(100);
  });


});
