import { describe, expect, it } from 'vitest';
import { formatBolivianos, formatSalaryRange } from '../utils/format-salary-range.js';

describe('formatBolivianos', () => {
  it('agrega el prefijo Bs y el separador de miles', () => {
    expect(formatBolivianos(500)).toBe('Bs 500');
    expect(formatBolivianos(6500)).toBe('Bs 6.500');
    expect(formatBolivianos(1250000)).toBe('Bs 1.250.000');
  });
});

describe('formatSalaryRange', () => {
  it('muestra un monto fijo cuando no hay máximo', () => {
    expect(formatSalaryRange(5000)).toBe('Bs 5.000');
  });

  it('muestra el rango con un solo prefijo', () => {
    expect(formatSalaryRange(6500, 8000)).toBe('Bs 6.500 - 8.000');
  });
});
