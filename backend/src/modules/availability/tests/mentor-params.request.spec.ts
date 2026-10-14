import { describe, expect, it } from 'vitest';
import { mentorParamsSchema } from '../requests/mentor-params.request.js';

const MENTOR_ID = '6f1c2b8e-3d4a-4f5b-9c6d-7e8f9a0b1c2d';

describe('mentorParamsSchema', () => {
  it('acepta un UUID válido', () => {
    expect(mentorParamsSchema.safeParse({ id: MENTOR_ID }).success).toBe(true);
  });

  it('rechaza un id que no es UUID', () => {
    const result = mentorParamsSchema.safeParse({ id: 'mentor-1' });
    expect(result.success ? [] : result.error.issues.map((issue) => issue.message)).toEqual([
      'El identificador del mentor no es válido',
    ]);
  });

  it('rechaza parámetros desconocidos', () => {
    expect(mentorParamsSchema.safeParse({ id: MENTOR_ID, extra: 'x' }).success).toBe(false);
  });
});
