import { describe, expect, it } from 'vitest';
import { escapeLikePattern } from '../helpers/escape-like-pattern.js';

describe('escapeLikePattern', () => {
  it('deja intacto un texto sin comodines', () => {
    expect(escapeLikePattern('Lionel Messi')).toBe('Lionel Messi');
  });

  it('escapa el porcentaje y el guion bajo', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('Li_nel')).toBe('Li\\_nel');
  });

  it('escapa la barra invertida antes que los demás caracteres', () => {
    expect(escapeLikePattern('a\\%')).toBe('a\\\\\\%');
  });

  it('conserva tildes, ñ y apóstrofes', () => {
    expect(escapeLikePattern("O'Connor Peña")).toBe("O'Connor Peña");
  });
});
