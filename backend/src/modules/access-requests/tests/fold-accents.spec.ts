import { describe, expect, it } from 'vitest';
import { ACCENT_FOLD_FROM, ACCENT_FOLD_TO } from '../constants/accent-folding.constants.js';
import { foldAccents } from '../helpers/fold-accents.js';

describe('foldAccents', () => {
  it.each([
    ['Peña', 'pena'],
    ['NÚÑEZ', 'nunez'],
    ['María José', 'maria jose'],
    ['Müller', 'muller'],
    ['Àèïôû', 'aeiou'],
    ["D'Angelo", "d'angelo"],
    ['Pérez-Gómez', 'perez-gomez'],
    ['D’Angelo', "d'angelo"],
  ])('pliega %s a %s', (input, expected) => {
    expect(foldAccents(input)).toBe(expected);
  });

  it('une una letra con tilde escrita con marca combinada', () => {
    expect(foldAccents('Pen\u0303a')).toBe(foldAccents('Peña'));
  });

  it('deja intactos los dígitos', () => {
    expect(foldAccents('8765432')).toBe('8765432');
  });

  it('los mapas de la consulta tienen la misma longitud', () => {
    expect(ACCENT_FOLD_FROM).toHaveLength(ACCENT_FOLD_TO.length);
  });
});
