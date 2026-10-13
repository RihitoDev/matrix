import { beforeEach, describe, expect, it } from 'vitest';
import { NlpService } from '../services/nlp.service.js';
import { SkillsClassifierService } from '../services/skills-classifier.service.js';
import type { DetectedSkillResponse } from '../types/matching.types.js';

const CATALOG: DetectedSkillResponse[] = [
  { id: 'a1', name: 'Python' },
  { id: 'b2', name: 'Django' },
  { id: 'c3', name: 'Scrum' },
  { id: 'd4', name: 'React' },
  { id: 'e5', name: 'Machine Learning' },
  { id: 'f6', name: 'Node.js' },
];

describe('SkillsClassifierService', () => {
  let nlpService: NlpService;
  let classifier: SkillsClassifierService;

  beforeEach(() => {
    nlpService = new NlpService();
    classifier = new SkillsClassifierService(nlpService);
  });

  it('detecta las habilidades del catalogo y devuelve sus datos originales', () => {
    const result = classifier.classify(['python', 'django', 'scrum'], CATALOG);

    expect(result).toEqual([
      { id: 'a1', name: 'Python' },
      { id: 'b2', name: 'Django' },
      { id: 'c3', name: 'Scrum' },
    ]);
  });

  it('ignora las palabras que no estan en el catalogo', () => {
    const result = classifier.classify(['desarrollador', 'backend', 'equipo', 'python'], CATALOG);

    expect(result).toEqual([{ id: 'a1', name: 'Python' }]);
  });

  it('compara sin distinguir mayusculas ni espacios sobrantes (AC-01.10)', () => {
    const result = classifier.classify(['PYTHON', '  Django '], CATALOG);

    expect(result.map((skill) => skill.name)).toEqual(['Python', 'Django']);
  });

  it('reconoce habilidades de varias palabras unidas con guion bajo', () => {
    const result = classifier.classify(['machine_learning'], CATALOG);

    expect(result).toEqual([{ id: 'e5', name: 'Machine Learning' }]);
  });

  it('reconoce nombres con signos tras la limpieza del texto (Node.js -> nodejs)', () => {
    const result = classifier.classify(['nodejs'], CATALOG);

    expect(result).toEqual([{ id: 'f6', name: 'Node.js' }]);
  });

  it('no repite una habilidad que aparece varias veces', () => {
    const result = classifier.classify(['python', 'django', 'python', 'PYTHON'], CATALOG);

    expect(result.map((skill) => skill.id)).toEqual(['a1', 'b2']);
  });

  it('respeta el orden de aparicion en el texto', () => {
    const result = classifier.classify(['scrum', 'python'], CATALOG);

    expect(result.map((skill) => skill.name)).toEqual(['Scrum', 'Python']);
  });

  it.each([
    [[], CATALOG],
    [['python'], []],
    [['', '   '], CATALOG],
  ])('responde una lista vacia si no hay nada que detectar (%o)', (candidates, catalog) => {
    expect(classifier.classify(candidates, catalog)).toEqual([]);
  });

  describe('nombres que quedan iguales tras la limpieza', () => {
    it('conserva solo la habilidad escrita igual que la clave (C frente a C++ y C#)', () => {
      const catalog = [
        { id: '1', name: 'C++' },
        { id: '2', name: 'C' },
        { id: '3', name: 'C#' },
      ];

      expect(classifier.classify(['c'], catalog)).toEqual([{ id: '2', name: 'C' }]);
    });

    it('descarta la clave ambigua si ninguna se escribe igual', () => {
      const catalog = [
        { id: '1', name: 'C++' },
        { id: '3', name: 'C#' },
      ];

      expect(classifier.classify(['c'], catalog)).toEqual([]);
    });
  });

  it('funciona de punta a punta con el texto del wireframe de HU-01', () => {
    const text =
      'Trabajé como desarrollador backend usando Python y Django, aplicando metodologías Scrum con un equipo proactivo y puntual.';
    const candidates = nlpService.tokenizeAndFilter(nlpService.normalizeText(text));

    const result = classifier.classify(candidates, CATALOG);

    expect(result.map((skill) => skill.name)).toEqual(['Python', 'Django', 'Scrum']);
  });
});
