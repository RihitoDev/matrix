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
  { id: 'g7', name: 'C++' },
  { id: 'h8', name: 'C#' },
  { id: 'i9', name: '.NET' },
];

describe('SkillsClassifierService', () => {
  let nlpService: NlpService;
  let classifier: SkillsClassifierService;

  beforeEach(() => {
    nlpService = new NlpService();
    classifier = new SkillsClassifierService();
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

  it.each([
    ['Node.js', { id: 'f6', name: 'Node.js' }],
    ['node.js', { id: 'f6', name: 'Node.js' }],
    ['C++', { id: 'g7', name: 'C++' }],
    ['c#', { id: 'h8', name: 'C#' }],
    ['.net', { id: 'i9', name: '.NET' }],
  ])('conserva los signos de la clave al comparar (%s)', (candidate, expected) => {
    expect(classifier.classify([candidate], CATALOG)).toEqual([expected]);
  });

  it('no confunde C, C++ y C# entre si', () => {
    const catalog = [
      { id: '1', name: 'C++' },
      { id: '2', name: 'C' },
      { id: '3', name: 'C#' },
    ];

    expect(classifier.classify(['c'], catalog)).toEqual([{ id: '2', name: 'C' }]);
    expect(classifier.classify(['c++'], catalog)).toEqual([{ id: '1', name: 'C++' }]);
    expect(classifier.classify(['c#'], catalog)).toEqual([{ id: '3', name: 'C#' }]);
  });

  it('ignora las tildes al comparar', () => {
    const catalog = [{ id: '1', name: 'Diseño Web' }];

    expect(classifier.classify(['diseno_web', 'Diseño Web'], catalog)).toEqual([
      { id: '1', name: 'Diseño Web' },
    ]);
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

  describe('nombres que quedan iguales tras la normalizacion', () => {
    it('conserva solo la habilidad escrita igual que la clave', () => {
      const catalog = [
        { id: '1', name: 'Diseño' },
        { id: '2', name: 'Diseno' },
      ];

      expect(classifier.classify(['diseno'], catalog)).toEqual([{ id: '2', name: 'Diseno' }]);
    });

    it('descarta la clave ambigua si ninguna se escribe igual', () => {
      const catalog = [
        { id: '1', name: 'Diseño' },
        { id: '3', name: 'Dísèno' },
      ];

      expect(classifier.classify(['diseno'], catalog)).toEqual([]);
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
