import { getAcademicPeriod } from '../utils/academic-period.js';

describe('getAcademicPeriod', () => {
  it.each([
    { isoDate: '2025-01-15T12:00:00.000Z', expected: 'I-2025' },
    { isoDate: '2025-06-30T12:00:00.000Z', expected: 'I-2025' },
    { isoDate: '2025-07-01T12:00:00.000Z', expected: 'II-2025' },
    { isoDate: '2025-12-31T12:00:00.000Z', expected: 'II-2025' },
  ])('ubica $isoDate en la gestión $expected', ({ isoDate, expected }) => {
    expect(getAcademicPeriod(isoDate)).toBe(expected);
  });

  it('usa la hora de Bolivia en el cambio de semestre', () => {
    expect(getAcademicPeriod('2025-07-01T02:00:00.000Z')).toBe('I-2025');
  });

  it('devuelve undefined si la fecha no es válida', () => {
    expect(getAcademicPeriod('no-es-fecha')).toBeUndefined();
  });
});
