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
