import { describe, expect, it } from 'vitest';
import { CREATE_BLOCK_MESSAGES as MSG } from '../constants/create-block.constants.js';
import { updateBlockSchema } from '../requests/update-block.request.js';

// updateBlockSchema reusa buildCreateBlockSchema() tal cual; estos casos solo
// confirman la delegacion. Las reglas en si (paso de 30 min, rango horario,
// mismo dia, etc.) ya estan cubiertas a fondo en create-block.request.spec.ts.
describe('updateBlockSchema', () => {
  it('acepta un bloque futuro válido, igual que al crear', () => {
    const result = updateBlockSchema.safeParse({
      startAt: '2099-10-10T19:00:00Z',
      endAt: '2099-10-10T20:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza fin anterior o igual al inicio', () => {
    const result = updateBlockSchema.safeParse({
      startAt: '2099-10-10T20:00:00Z',
      endAt: '2099-10-10T19:00:00Z',
    });
    expect(result.success).toBe(false);
    expect(result.success ? [] : result.error.issues.map((i) => i.message)).toEqual([
      MSG.endBeforeStart,
    ]);
  });

  it('rechaza horas fuera de pasos de 30 minutos', () => {
    const result = updateBlockSchema.safeParse({
      startAt: '2099-10-10T19:10:00Z',
      endAt: '2099-10-10T20:00:00Z',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza mentorId en el body: sale de la sesión, no del payload', () => {
    const result = updateBlockSchema.safeParse({
      startAt: '2099-10-10T19:00:00Z',
      endAt: '2099-10-10T20:00:00Z',
      mentorId: 'abc',
    });
    expect(result.success).toBe(false);
  });
});
