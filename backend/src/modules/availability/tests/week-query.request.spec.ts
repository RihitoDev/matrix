import { describe, expect, it } from 'vitest';
import { WEEK_QUERY_MESSAGES as MSG } from '../constants/week-query.constants.js';
import { weekQuerySchema } from '../requests/week-query.request.js';

const MONDAY = '2026-10-05T04:00:00.000Z';
const SUNDAY_END = '2026-10-12T03:59:59.999Z';
const NEXT_MONDAY = '2026-10-12T04:00:00.000Z';

const messagesOf = (input: unknown): string[] => {
  const result = weekQuerySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('weekQuerySchema', () => {
  it('acepta una semana de lunes a domingo en UTC', () => {
    expect(weekQuerySchema.safeParse({ from: MONDAY, to: SUNDAY_END }).success).toBe(true);
  });

  it('acepta un rango de exactamente 7 días', () => {
    expect(weekQuerySchema.safeParse({ from: MONDAY, to: NEXT_MONDAY }).success).toBe(true);
  });

  it('rechaza un rango mayor a 7 días', () => {
    expect(messagesOf({ from: MONDAY, to: '2026-10-12T04:00:00.001Z' })).toEqual([MSG.rangeTooLong]);
  });

  it('rechaza una fecha final igual o anterior a la inicial', () => {
    expect(messagesOf({ from: MONDAY, to: MONDAY })).toEqual([MSG.toBeforeFrom]);
    expect(messagesOf({ from: NEXT_MONDAY, to: MONDAY })).toEqual([MSG.toBeforeFrom]);
  });

  it('rechaza fechas con formato inválido', () => {
    expect(messagesOf({ from: 'no-es-fecha', to: SUNDAY_END })).toContain(MSG.invalidDate);
  });

  it('rechaza si falta from o to', () => {
    expect(weekQuerySchema.safeParse({ from: MONDAY }).success).toBe(false);
    expect(weekQuerySchema.safeParse({ to: SUNDAY_END }).success).toBe(false);
  });

  it('rechaza parámetros desconocidos', () => {
    expect(weekQuerySchema.safeParse({ from: MONDAY, to: SUNDAY_END, mentorId: 'x' }).success).toBe(false);
  });
});
