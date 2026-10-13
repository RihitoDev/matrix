import { describe, expect, it } from 'vitest';
import {
  MAX_EXPERIENCE_TEXT_LENGTH,
  analyzeExperienceBodySchema,
  analyzeExperienceParamsSchema,
} from '../requests/analyze-experience.schema.js';

const VALID_ID = '5b1f0c3e-8a4d-4f0b-9a52-1d6c7e2a9b10';

describe('analyzeExperienceParamsSchema', () => {
  it('acepta un UUID valido', () => {
    expect(analyzeExperienceParamsSchema.safeParse({ id: VALID_ID }).success).toBe(true);
  });

  it('rechaza un id que no es UUID', () => {
    expect(analyzeExperienceParamsSchema.safeParse({ id: '123' }).success).toBe(false);
  });
});

describe('analyzeExperienceBodySchema', () => {
  it('acepta un texto valido', () => {
    const result = analyzeExperienceBodySchema.safeParse({ text: 'Trabaje con Python y Django' });
    expect(result.success).toBe(true);
  });

  it.each([[''], [null], [undefined]])('acepta un texto vacio, nulo o ausente (%o)', (text) => {
    expect(analyzeExperienceBodySchema.safeParse({ text }).success).toBe(true);
  });

  it('acepta un body sin la propiedad text', () => {
    expect(analyzeExperienceBodySchema.safeParse({}).success).toBe(true);
  });

  it('acepta un texto exactamente en el limite', () => {
    const text = 'a'.repeat(MAX_EXPERIENCE_TEXT_LENGTH);
    expect(analyzeExperienceBodySchema.safeParse({ text }).success).toBe(true);
  });

  it('rechaza un texto que supera el limite', () => {
    const text = 'a'.repeat(MAX_EXPERIENCE_TEXT_LENGTH + 1);
    expect(analyzeExperienceBodySchema.safeParse({ text }).success).toBe(false);
  });

  it('rechaza un texto que no es string', () => {
    expect(analyzeExperienceBodySchema.safeParse({ text: 123 }).success).toBe(false);
  });
});
