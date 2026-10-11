import { describe, expect, it } from 'vitest';
import { updatePersonalInfoSchema } from '../requests/update-personal-info.request.js';
import { updatePresentationSchema } from '../requests/update-presentation.request.js';

const validPersonalInfo = {
  firstName: 'Valeria',
  lastName: 'Quispe',
  cityId: '22222222-2222-4222-8222-222222222222',
  phone: '+591 70000000',
  personalEmail: 'valeria@mail.com',
};

describe('updatePersonalInfoSchema', () => {
  it('accepts valid values and trims the text', () => {
    const result = updatePersonalInfoSchema.parse({
      ...validPersonalInfo,
      firstName: '  Valeria ',
      personalEmail: ' valeria@mail.com ',
    });

    expect(result.firstName).toBe('Valeria');
    expect(result.personalEmail).toBe('valeria@mail.com');
  });

  it.each([
    ['firstName', ''],
    ['lastName', 'a'.repeat(101)],
    ['cityId', 'not-a-uuid'],
    ['phone', '123'],
    ['phone', '70a00000'],
    ['phone', '+591 7000 0000 0000 0'],
    ['personalEmail', 'valeria'],
  ])('rejects an invalid %s (%s)', (field, value) => {
    const result = updatePersonalInfoSchema.safeParse({ ...validPersonalInfo, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual([field]);
  });

  it('rejects a body with missing fields', () => {
    expect(updatePersonalInfoSchema.safeParse({}).success).toBe(false);
  });
});

describe('updatePresentationSchema', () => {
  it('accepts the headline and the about me text', () => {
    expect(
      updatePresentationSchema.parse({ headline: ' Junior developer ', aboutMe: 'Graduate.' }),
    ).toEqual({ headline: 'Junior developer', aboutMe: 'Graduate.' });
  });

  it.each([
    ['headline', '   '],
    ['headline', 'a'.repeat(151)],
    ['aboutMe', ''],
    ['aboutMe', 'a'.repeat(2001)],
  ])('rejects an invalid %s', (field, value) => {
    const result = updatePresentationSchema.safeParse({
      headline: 'Junior developer',
      aboutMe: 'Graduate.',
      [field]: value,
    });

    expect(result.success).toBe(false);
  });
});
