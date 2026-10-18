import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchingService } from '../services/matching.service.js';
import { SkillDictionaryService } from '../../job-connect/services/skill-dictionary.service.js';
import { SkillsClassifierService } from '../services/skills-classifier.service.js';
import { SkillCatalogService } from '../../skills/services/skill-catalog.service.js';

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

const SKILL_CATALOG = [
  { id: 'a1', name: 'Python', isCustom: false },
  { id: 'b2', name: 'Scrum', isCustom: false },
  { id: 'c3', name: 'C++', isCustom: false },
  { id: 'd4', name: 'C#', isCustom: false },
  { id: 'e5', name: 'Node.js', isCustom: false },
  { id: 'f6', name: '.NET', isCustom: false },
];

describe('MatchingService', () => {
  let service: MatchingService;
  let skillCatalogService: { listCatalog: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    skillCatalogService = { listCatalog: vi.fn().mockResolvedValue(SKILL_CATALOG) };

    service = new MatchingService(
      new SkillDictionaryService(),
      new SkillsClassifierService(),
      skillCatalogService as unknown as SkillCatalogService,
    );
  });

  it('devuelve el id de la experiencia y las habilidades del catalogo detectadas en el texto', async () => {
    const result = await service.analyzeExperience({
      experienceId: EXPERIENCE_ID,
      text: 'Trabaje como desarrollador backend usando Python y metodologias Scrum',
    });

    expect(result.experienceId).toBe(EXPERIENCE_ID);
    expect(result.skills).toEqual([
      { id: 'a1', name: 'Python' },
      { id: 'b2', name: 'Scrum' },
    ]);
  });

  it('consulta el catalogo completo al servicio de skills', async () => {
    await service.analyzeExperience({ experienceId: EXPERIENCE_ID, text: 'Python' });

    expect(skillCatalogService.listCatalog).toHaveBeenCalledWith({});
  });

  it('reconoce C++, C#, Node.js y .NET con las claves del catalogo', async () => {
    const result = await service.analyzeExperience({
      experienceId: EXPERIENCE_ID,
      text: 'Desarrolle servicios en C++, C#, Node.js y .NET',
    });

    expect(result.skills.map((skill) => skill.name)).toEqual(['C++', 'C#', '.NET', 'Node.js']);
  });

  it('no expone campos internos del catalogo en la respuesta', async () => {
    const result = await service.analyzeExperience({ experienceId: EXPERIENCE_ID, text: 'Python' });

    expect(result.skills[0]).toEqual({ id: 'a1', name: 'Python' });
  });

  it('ignora una habilidad del diccionario que no esta en el catalogo', async () => {
    skillCatalogService.listCatalog.mockResolvedValue([SKILL_CATALOG[0]]);

    const result = await service.analyzeExperience({
      experienceId: EXPERIENCE_ID,
      text: 'Python y Scrum',
    });

    expect(result.skills).toEqual([{ id: 'a1', name: 'Python' }]);
  });

  it('responde sin habilidades cuando el catalogo esta vacio', async () => {
    skillCatalogService.listCatalog.mockResolvedValue([]);

    const result = await service.analyzeExperience({ experienceId: EXPERIENCE_ID, text: 'Python' });

    expect(result.skills).toEqual([]);
  });

  it.each([[''], ['   '], [null], [undefined], ['texto sin habilidades reconocibles']])(
    'responde sin habilidades y sin consultar el catalogo cuando no hay nada que detectar (%o)',
    async (text) => {
      const result = await service.analyzeExperience({ experienceId: EXPERIENCE_ID, text });

      expect(result.skills).toEqual([]);
      expect(skillCatalogService.listCatalog).not.toHaveBeenCalled();
    },
  );

  it('informa el tiempo de procesamiento como un numero entero no negativo', async () => {
    const result = await service.analyzeExperience({ experienceId: EXPERIENCE_ID, text: 'Scrum' });

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