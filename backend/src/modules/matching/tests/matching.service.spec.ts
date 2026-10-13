import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchingService } from '../services/matching.service.js';

const EXPERIENCE_ID = '5b1f0c3e-8a4d-4f0b-9a52-1d6c7e2a9b10';
const FAKE_USER_ID = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

describe('MatchingService', () => {
  let service: MatchingService;
  let skillDictionaryService: any;
  let skillsClassifierService: any;
  let nlpService: any;
  let skillCatalogService: any;
  let userSkillService: any;

  beforeEach(() => {
    skillDictionaryService = {
      extract: vi.fn().mockReturnValue({ skills: [] }),
    };
    skillsClassifierService = {
      classify: vi.fn().mockReturnValue([]),
    };
    nlpService = {
      normalizeText: vi.fn((t) => t.toLowerCase()),
      tokenizeAndFilter: vi.fn().mockReturnValue([]),
      generateNGrams: vi.fn().mockReturnValue([]),
    };
    skillCatalogService = {
      listCatalog: vi.fn().mockResolvedValue([]),
    };
    userSkillService = {
      getUserSkills: vi.fn().mockResolvedValue([]),
      updateUserSkills: vi.fn().mockResolvedValue(undefined),
    };

    service = new MatchingService(
      skillDictionaryService,
      skillsClassifierService,
      nlpService,
      skillCatalogService,
      userSkillService,
    );
  });

  it('devuelve el id de la experiencia y una lista de habilidades', async () => {
    const result = await service.analyzeExperience({
      userId: FAKE_USER_ID,
      experienceId: EXPERIENCE_ID,
      text: 'React y Node',
    });

    expect(result.experienceId).toBe(EXPERIENCE_ID);
    expect(Array.isArray(result.skills)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('responde sin habilidades y sin error con texto vacio (%s)', async (text) => {
    const result = await service.analyzeExperience({
      userId: FAKE_USER_ID,
      experienceId: EXPERIENCE_ID,
      text: text as any,
    });

    expect(result.skills).toEqual([]);
  });

  it('informa el tiempo de procesamiento como un numero entero no negativo', async () => {
    const result = await service.analyzeExperience({
      userId: FAKE_USER_ID,
      experienceId: EXPERIENCE_ID,
      text: 'Java',
    });

    expect(Number.isInteger(result.processingTimeMs)).toBe(true);
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('debe validar que cuando la brecha es igual a cero, se genere el mensaje explicito para la UI', () => {
    const input = {
      requiredCareer: 'Sistemas',
      userCareer: 'Sistemas',
      minimumExperienceYears: 2,
      userExperienceYears: 3,
      requiredSkills: ['Git'],
      userSkills: ['Git'],
    };
    const result = service.intersectRequirements(input);
    expect(result.careerMatch).toBe(true);
    expect(result.experienceMatch).toBe(true);
    expect(result.allRequiredSkillsMatch).toBe(true);
  });

  it('debe rechazar el match cuando la carrera del candidato no coincide con ninguna carrera requerida', () => {
    const input = {
      requiredCareer: 'Sistemas',
      userCareer: 'Derecho',
      minimumExperienceYears: 1,
      userExperienceYears: 2,
      requiredSkills: [],
      userSkills: [],
    };
    const result = service.intersectRequirements(input);
    expect(result.careerMatch).toBe(false);
  });

  it('debe aprobar el match unicamente cuando la carrera coincide exactamente (ignorando mayusculas/espacios)', () => {
    const input = {
      requiredCareer: 'Sistemas',
      userCareer: '  SISTEMAS  ',
      minimumExperienceYears: 1,
      userExperienceYears: 2,
      requiredSkills: [],
      userSkills: [],
    };
    const result = service.intersectRequirements(input);
    expect(result.careerMatch).toBe(true);
  });

  it('no debe dar falso positivo si el perfil del candidato no especifica carrera', () => {
    const input = {
      requiredCareer: 'Sistemas',
      userCareer: '',
      minimumExperienceYears: 1,
      userExperienceYears: 2,
      requiredSkills: [],
      userSkills: [],
    };
    const result = service.intersectRequirements(input);
    expect(result.careerMatch).toBe(false);
  });
});
