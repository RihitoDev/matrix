import { describe, expect, it } from 'vitest';
import { activateMentorSchema } from '../requests/activate-mentor.schema.js';

describe('activateMentorSchema', () => {
  const validPayload = {
    technicalAreaIds: ['0424f370-00f0-43cf-9b8a-997af81840b9'],
    orientationTypeIds: ['0fa5e6de-63a4-430e-87fb-22f5eb700ecd'],
  };

  it('acepta arreglos no vacios de UUID unicos', () => {
    expect(activateMentorSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rechaza propiedades adicionales', () => {
    expect(
      activateMentorSchema.safeParse({
        ...validPayload,
        userId: '550e8400-e29b-41d4-a716-446655440001',
      }).success,
    ).toBe(false);
  });

  it('rechaza un arreglo vacio de areas tecnicas', () => {
    expect(
      activateMentorSchema.safeParse({
        ...validPayload,
        technicalAreaIds: [],
      }).success,
    ).toBe(false);
  });

  it('rechaza un arreglo vacio de tipos de orientacion', () => {
    expect(
      activateMentorSchema.safeParse({
        ...validPayload,
        orientationTypeIds: [],
      }).success,
    ).toBe(false);
  });

  it('rechaza identificadores que no son UUID', () => {
    expect(
      activateMentorSchema.safeParse({
        ...validPayload,
        technicalAreaIds: ['area-1'],
      }).success,
    ).toBe(false);
  });

  it.each(['technicalAreaIds', 'orientationTypeIds'] as const)(
    'rechaza identificadores duplicados en %s',
    (field) => {
      expect(
        activateMentorSchema.safeParse({
          ...validPayload,
          [field]: [validPayload[field][0], validPayload[field][0]],
        }).success,
      ).toBe(false);
    },
  );
});
