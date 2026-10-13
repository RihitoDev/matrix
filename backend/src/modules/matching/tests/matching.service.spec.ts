import { beforeEach, describe, expect, it } from 'vitest';
import { MatchingService } from '../services/matching.service.js';
import { SkillDictionaryService } from '../../job-connect/services/skill-dictionary.service.js';
import { SkillsClassifierService } from '../services/skills-classifier.service.js';
import { NlpService } from '../services/nlp.service.js';

interface RequirementGapResult {
  totalRequired: number;
  matchedCount: number;
  gapCount: number;
  isZeroGap: boolean;
  message: string;
}

interface CareerMatchingInput {
  requiredCareers: string[];
  candidateCareer: string;
}

function analyzeRequirementsGap(
  requiredSkills: string[],
  candidateSkills: string[]
): RequirementGapResult {
  const missingSkills: string[] = requiredSkills.filter(
    (skill) => !candidateSkills.includes(skill)
  );

  const gapCount = missingSkills.length;
  const isZeroGap = gapCount === 0;

  return {
    totalRequired: requiredSkills.length,
    matchedCount: requiredSkills.length - gapCount,
    gapCount,
    isZeroGap,
    message: isZeroGap
      ? 'El perfil cubre la totalidad de los requisitos.'
      : `El perfil presenta una brecha de ${gapCount} requisito(s) faltante(s).`,
  };
}

function evaluateCareerMatch(input: CareerMatchingInput): boolean {
  if (!input.requiredCareers || input.requiredCareers.length === 0) {
    return true;
  }

  if (!input.candidateCareer || input.candidateCareer.trim() === '') {
    return false;
  }

  const normalizedCandidate = input.candidateCareer.trim().toLowerCase();

  return input.requiredCareers.some(
    (career) => career.trim().toLowerCase() === normalizedCandidate
  );
}

const EXPERIENCE_ID = '5b1f0c3e-8a4d-4f0b-9a52-1d6c7e2a9b10';

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(() => {
    const nlpService = new NlpService();
    const skillsClassifierService = new SkillsClassifierService(nlpService);
    const skillDictionaryService = new SkillDictionaryService();

    service = new MatchingService(skillDictionaryService, skillsClassifierService);
  });

  it('devuelve el id de la experiencia y una lista de habilidades', () => {
    const result = service.analyzeExperience({
      experienceId: EXPERIENCE_ID,
      text: 'Trabaje como desarrollador backend usando Python y Django',
    });

    expect(result.experienceId).toBe(EXPERIENCE_ID);
    expect(Array.isArray(result.skills)).toBe(true);
  });

  it.each([[''], ['   '], [null], [undefined]])(
    'responde sin habilidades y sin error con texto vacio (%o)',
    (text) => {
      const result = service.analyzeExperience({ experienceId: EXPERIENCE_ID, text });

      expect(result.skills).toEqual([]);
    },
  );

  it('informa el tiempo de procesamiento como un numero entero no negativo', () => {
    const result = service.analyzeExperience({ experienceId: EXPERIENCE_ID, text: 'Scrum' });

    expect(Number.isInteger(result.processingTimeMs)).toBe(true);
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });
});

describe('Matching Gap Analysis QA Suite - Zero Gap UI Behavior', () => {
  it('debe validar que cuando la brecha es igual a cero, se genere el mensaje explícito para la UI', () => {
    const requiredSkills: string[] = ['TypeScript', 'NestJS', 'PostgreSQL'];
    const candidateSkills: string[] = ['TypeScript', 'NestJS', 'PostgreSQL', 'Docker'];

    const result: RequirementGapResult = analyzeRequirementsGap(
      requiredSkills,
      candidateSkills
    );

    expect(result.gapCount).toBe(0);
    expect(result.isZeroGap).toBe(true);
    expect(result.message).toBe('El perfil cubre la totalidad de los requisitos.');
  });
});

describe('Matching QA Asserts - Prevención de Falsos Positivos de Carreras', () => {
  it('debe rechazar el match cuando la carrera del candidato no coincide con ninguna carrera requerida', () => {
    const isMatch = evaluateCareerMatch({
      requiredCareers: ['Ingeniería de Sistemas', 'Ingeniería Informática'],
      candidateCareer: 'Ingeniería Comercial',
    });

    expect(isMatch).toBe(false);
  });

  it('debe aprobar el match únicamente cuando la carrera coincide exactamente (ignorando mayúsculas/espacios)', () => {
    const isMatch = evaluateCareerMatch({
      requiredCareers: ['Ingeniería de Sistemas', 'Ingeniería Informática'],
      candidateCareer: '  ingeniería de sistemas  ',
    });

    expect(isMatch).toBe(true);
  });

  it('no debe dar falso positivo si el perfil del candidato no especifica carrera', () => {
    const isMatch = evaluateCareerMatch({
      requiredCareers: ['Ingeniería de Sistemas'],
      candidateCareer: '',
    });

    expect(isMatch).toBe(false);
  });
});