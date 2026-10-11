import { describe, expect, it } from 'vitest';
import { ProfileMapper } from '../mappers/profile.mapper.js';
import type { ProfileRecord } from '../types/profile-record.type.js';

const buildRecord = (overrides: Partial<ProfileRecord> = {}): ProfileRecord => ({
  id: '11111111-1111-4111-8111-111111111111',
  firstName: 'Valeria',
  lastName: 'Quispe',
  email: 'valeria.quispe@umss.edu.bo',
  personalEmail: 'valeria@mail.com',
  phone: '+591 70000000',
  headline: 'Junior web developer',
  aboutMe: 'Systems engineering graduate.',
  city: { id: '22222222-2222-4222-8222-222222222222', title: 'Cochabamba' },
  updatedAt: new Date('2026-10-04T12:00:00.000Z'),
  ...overrides,
});

describe('ProfileMapper', () => {
  const mapper = new ProfileMapper();

  it('maps a record to the profile response', () => {
    expect(mapper.toResponse(buildRecord())).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      firstName: 'Valeria',
      lastName: 'Quispe',
      institutionalEmail: 'valeria.quispe@umss.edu.bo',
      personalEmail: 'valeria@mail.com',
      phone: '+591 70000000',
      city: { id: '22222222-2222-4222-8222-222222222222', title: 'Cochabamba' },
      headline: 'Junior web developer',
      aboutMe: 'Systems engineering graduate.',
      updatedAt: '2026-10-04T12:00:00.000Z',
    });
  });

  it('keeps empty optional fields as null', () => {
    const response = mapper.toResponse(
      buildRecord({
        personalEmail: null,
        phone: null,
        headline: null,
        aboutMe: null,
        city: null,
      }),
    );

    expect(response).toMatchObject({
      personalEmail: null,
      phone: null,
      city: null,
      headline: null,
      aboutMe: null,
    });
  });

  it('maps a city record to the city response', () => {
    expect(
      mapper.toCityResponse({ id: '22222222-2222-4222-8222-222222222222', title: 'La Paz' }),
    ).toEqual({ id: '22222222-2222-4222-8222-222222222222', title: 'La Paz' });
  });
});
