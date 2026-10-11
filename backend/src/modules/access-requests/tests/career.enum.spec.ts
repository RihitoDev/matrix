import { describe, expect, it } from 'vitest';
import { CAREER } from '../types/career.enum.js';

describe('CAREER', () => {
  it('usa los nombres oficiales de WebSIS', () => {
    expect(Object.values(CAREER)).toEqual([
      'Licenciatura en Ingeniería de Sistemas',
      'Licenciatura Ingeniería en Informática',
    ]);
  });

  it('mantiene los nombres normalizados en NFC', () => {
    for (const title of Object.values(CAREER)) {
      expect(title.normalize('NFC')).toBe(title);
    }
  });
});
