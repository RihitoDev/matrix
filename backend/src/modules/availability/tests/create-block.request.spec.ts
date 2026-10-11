import { describe, expect, it } from 'vitest';
import { CREATE_BLOCK_MESSAGES as MSG } from '../constants/create-block.constants.js';
import { buildCreateBlockSchema } from '../requests/create-block.request.js';

const FIXED_NOW = new Date('2026-10-01T12:00:00Z');
const schema = buildCreateBlockSchema(() => FIXED_NOW);

const getMessages = (payload: unknown): string[] => {
  const result = schema.safeParse(payload);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('createBlockSchema', () => {
  it('acepta un bloque futuro válido (15:00 a 16:00 Bolivia)', () => {
    const result = schema.safeParse({
      startAt: '2026-10-10T19:00:00Z',
      endAt: '2026-10-10T20:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('devuelve las fechas ya convertidas a Date', () => {
    const result = schema.safeParse({
      startAt: '2026-10-10T19:00:00Z',
      endAt: '2026-10-10T20:00:00Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startAt).toBeInstanceOf(Date);
      expect(result.data.endAt).toBeInstanceOf(Date);
    }
  });

  it('acepta horas con desfase explícito -04:00', () => {
    expect(
      getMessages({ startAt: '2026-10-10T15:00:00-04:00', endAt: '2026-10-10T16:00:00-04:00' }),
    ).toEqual([]);
  });

  it('acepta el borde 07:00 a 22:00 Bolivia', () => {
    expect(
      getMessages({ startAt: '2026-10-10T11:00:00Z', endAt: '2026-10-11T02:00:00Z' }),
    ).toEqual([]);
  });

  it('rechaza fin anterior al inicio', () => {
    expect(
      getMessages({ startAt: '2026-10-10T20:00:00Z', endAt: '2026-10-10T19:00:00Z' }),
    ).toEqual([MSG.endBeforeStart]);
  });

  it('rechaza fin igual al inicio', () => {
    expect(
      getMessages({ startAt: '2026-10-10T19:00:00Z', endAt: '2026-10-10T19:00:00Z' }),
    ).toEqual([MSG.endBeforeStart]);
  });

  it('rechaza un inicio que ya pasó', () => {
    expect(
      getMessages({ startAt: '2026-10-01T11:30:00Z', endAt: '2026-10-01T13:00:00Z' }),
    ).toContain(MSG.startInPast);
  });

  it('rechaza horas fuera de intervalos de 30 minutos', () => {
    expect(
      getMessages({ startAt: '2026-10-10T19:15:00Z', endAt: '2026-10-10T20:00:00Z' }),
    ).toEqual([MSG.invalidStep]);
  });

  it('rechaza un fin fuera de intervalos de 30 minutos', () => {
    expect(
      getMessages({ startAt: '2026-10-10T19:00:00Z', endAt: '2026-10-10T20:10:00Z' }),
    ).toEqual([MSG.invalidStep]);
  });

  it('rechaza un inicio antes de las 07:00 Bolivia', () => {
    expect(
      getMessages({ startAt: '2026-10-10T10:00:00Z', endAt: '2026-10-10T12:00:00Z' }),
    ).toEqual([MSG.outOfRange]);
  });

  it('rechaza un fin después de las 22:00 Bolivia', () => {
    expect(
      getMessages({ startAt: '2026-10-11T01:00:00Z', endAt: '2026-10-11T02:30:00Z' }),
    ).toEqual([MSG.outOfRange]);
  });

  it('usa dos dígitos en el mensaje de rango', () => {
    expect(MSG.outOfRange).toBe('El horario debe estar entre las 07:00 y las 22:00');
  });

  it('rechaza un bloque que cruza la medianoche de Bolivia', () => {
    expect(
      getMessages({ startAt: '2026-10-11T01:00:00Z', endAt: '2026-10-11T04:30:00Z' }),
    ).toEqual([MSG.differentDays]);
  });

  it('rechaza formatos de fecha inválidos', () => {
    expect(getMessages({ startAt: '10/10/2026 15:00', endAt: '2026-10-10T20:00:00Z' })).toEqual([
      MSG.invalidDate,
    ]);
  });

  it('rechaza si falta un campo', () => {
    expect(getMessages({ startAt: '2026-10-10T19:00:00Z' })).toEqual([MSG.invalidDate]);
  });

  it('rechaza campos extra como mentorId (sale de la sesión, no del body)', () => {
    expect(
      schema.safeParse({
        startAt: '2026-10-10T19:00:00Z',
        endAt: '2026-10-10T20:00:00Z',
        mentorId: 'abc',
      }).success,
    ).toBe(false);
  });

  it('usa la fecha actual por defecto', () => {
    const defaultSchema = buildCreateBlockSchema();
    expect(
      defaultSchema.safeParse({ startAt: '2020-01-01T12:00:00Z', endAt: '2020-01-01T13:00:00Z' })
        .success,
    ).toBe(false);
  });
});
