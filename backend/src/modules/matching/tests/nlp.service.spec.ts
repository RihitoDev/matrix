import { describe, expect, it, beforeEach } from 'vitest';
import { NlpService } from '../services/nlp.service.js';

const MAX_PROCESSING_MS = 2000;

const SAMPLE_TEXT =
  'Desarrollador Fullstack experimentado en la creacion de aplicaciones PWA, ' +
  'utilizando NestJS en el backend, Docker, PostgreSQL y Next.js en el frontend. ' +
  'Experiencia liderando equipos bajo Scrum.';

describe('NlpService', () => {
  let nlpService: NlpService;

  beforeEach(() => {
    nlpService = new NlpService();
  });

  describe('normalizeText', () => {
    it('convierte el texto a minúsculas (AC-01.3)', () => {
      expect(nlpService.normalizeText('PYTHON Y Django')).toBe('python y django');
    });

    it('remueve puntuación y caracteres especiales (AC-01.3)', () => {
      expect(nlpService.normalizeText('Python, Django; Scrum!')).toBe(
        'python django scrum',
      );
    });

    it('colapsa espacios múltiples y recorta los extremos (AC-01.3)', () => {
      expect(nlpService.normalizeText('  python    django  ')).toBe(
        'python django',
      );
    });

    it('conserva tildes y la ñ', () => {
      expect(nlpService.normalizeText('Gestión de diseño Año')).toBe(
        'gestión de diseño año',
      );
    });

    it('devuelve cadena vacía con texto vacío o solo símbolos (AC-01.9)', () => {
      expect(nlpService.normalizeText('')).toBe('');
      expect(nlpService.normalizeText('!!! ,,,')).toBe('');
    });

    it('da el mismo resultado sin importar mayúsculas (AC-01.10)', () => {
      const lower = nlpService.normalizeText('python');
      expect(nlpService.normalizeText('PYTHON')).toBe(lower);
      expect(nlpService.normalizeText('Python')).toBe(lower);
    });
  });

  describe('tokenizeAndFilter', () => {
    it('devuelve arreglo vacío con texto vacío', () => {
      expect(nlpService.tokenizeAndFilter('')).toEqual([]);
    });

    it('separa por saltos de línea, viñetas y comas', () => {
      const text = '- Experiencia en NestJS\n• Conocimiento de Docker, PostgreSQL';
      expect(nlpService.tokenizeAndFilter(text)).toEqual([
        'experiencia',
        'nestjs',
        'conocimiento',
        'docker',
        'postgresql',
      ]);
    });

    it('convierte a minúsculas y descarta stopwords en español e inglés', () => {
      expect(nlpService.tokenizeAndFilter('Manejo DE la API and the SQL')).toEqual([
        'manejo',
        'api',
        'sql',
      ]);
    });

    it('conserva tokens técnicos con símbolos', () => {
      expect(nlpService.tokenizeAndFilter('C++, C#, .NET, Node.js.')).toEqual([
        'c++',
        'c#',
        '.net',
        'node.js',
      ]);
    });

    it('separa términos unidos por barra', () => {
      expect(nlpService.tokenizeAndFilter('React/Next.js')).toEqual(['react', 'next.js']);
    });

    it('ignora signos sueltos y puntos aislados', () => {
      expect(nlpService.tokenizeAndFilter('... - , ¿Python?')).toEqual(['python']);
    });

    it('conserva tildes y la ñ', () => {
      expect(nlpService.tokenizeAndFilter('Gestión de diseño')).toEqual(['gestión', 'diseño']);
    });
  });

  describe('generateNGrams', () => {
    it('devuelve vacío con menos de dos tokens', () => {
      expect(nlpService.generateNGrams(['python'])).toEqual([]);
    });

    it('genera bigramas y trigramas', () => {
      expect(nlpService.generateNGrams(['a', 'b', 'c'])).toEqual(['a_b', 'a_b_c', 'b_c']);
    });
  });

  describe('extractRequirementTerms', () => {
    it('devuelve tokens y n-gramas sin duplicados', () => {
      const terms = nlpService.extractRequirementTerms('Machine Learning, machine learning');
      expect(terms).toContain('machine');
      expect(terms).toContain('learning');
      expect(terms).toContain('machine_learning');
      expect(new Set(terms).size).toBe(terms.length);
    });

    it('devuelve vacío con texto vacío', () => {
      expect(nlpService.extractRequirementTerms('')).toEqual([]);
    });
  });

  describe('rendimiento', () => {
    const longText = Array(200).fill(SAMPLE_TEXT).join(' ');

    it('procesa un texto extenso en menos de 2 segundos (AC-01.1, AC-01.6)', () => {
      nlpService.normalizeText(longText);

      const start = performance.now();
      const result = nlpService.normalizeText(longText);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(MAX_PROCESSING_MS);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBe(result.toLowerCase());
      expect(result).not.toMatch(/[^\p{L}\p{N}\s]/u);
      expect(result).not.toMatch(/\s{2,}/);
    });

    it('mantiene el tiempo estable con 100 ejecuciones consecutivas', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        nlpService.normalizeText(SAMPLE_TEXT);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(MAX_PROCESSING_MS);
    });
  });
});
