// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  formatRegistrationDate,
  formatRegistrationTime,
} from '../utils/registration-format';

describe('formato de datos del pase', () => {
  it.each(['1970-01-01T09:30:00.000Z', '09:30', '09:30:00', '09:30:00.000'])(
    'formatea el horario %s',
    (time) => {
      expect(formatRegistrationTime(time)).toBe('09:30');
    },
  );
  it.each([undefined, null, '', 'invalid', '24:00', '09:60', '09:30:60'])(
    'no rompe el pase con horario ausente o inválido: %s',
    (time) => {
      expect(formatRegistrationTime(time)).toBe('Horario no disponible');
    },
  );
  it.each([undefined, null, '', 'invalid'])(
    'no rompe el pase con fecha ausente o inválida: %s',
    (date) => {
      expect(formatRegistrationDate(date)).toBe('Fecha no disponible');
    },
  );
  it('conserva la fecha del evento sin desplazarla por zona horaria', () => {
    expect(formatRegistrationDate('2026-10-20T00:00:00Z')).toContain(
      '20 de octubre de 2026',
    );
  });
});
