import { describe, expect, it } from 'vitest';
import { MentorMapper } from '../mappers/mentor.mapper.js';
import type { MentorsRepository } from '../repositories/mentors.repository.js';

function buildProfileRecord(): NonNullable<
  Awaited<ReturnType<MentorsRepository['findActiveMentorById']>>
> {
  return {
    id: 'mentor-1',
    firstName: 'Ana María',
    lastName: 'Rojas',
    headline: 'Arquitecta de Software',
    aboutMe: 'Mentora de ingeniería.',
    isAvailableForMentoring: true,
    photoUrl: new TextEncoder().encode('https://cdn.test/María.jpg'),
    city: { id: 'city-1', title: 'Cochabamba' },
    educations: [
      {
        id: 'education-1',
        institution: 'UMSS',
        degree: 'Ingeniería de Sistemas',
        startDate: new Date('2020-01-01T00:00:00.000Z'),
        endDate: null,
        description: null,
      },
    ],
    workExperiences: [
      {
        id: 'work-1',
        position: 'Tech Lead',
        startDate: new Date('2021-01-01T00:00:00.000Z'),
        endDate: null,
        isCurrent: true,
        description: null,
        company: { id: 'company-1', title: 'Acme' },
      },
    ],
    userSkills: [
      { skill: { id: 'skill-1', name: 'TypeScript', isCustom: false } },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Cloud Architect',
        issuingOrganization: 'Cloud Org',
        issueDate: new Date('2025-06-15T00:00:00.000Z'),
        documentUrl: new TextEncoder().encode(
          'https://cdn.test/certificación.pdf',
        ),
      },
    ],
    mentorTechnicalAreas: [
      {
        technicalArea: { id: 'area-1', name: 'Backend', description: null },
      },
    ],
    mentorOrientationTypes: [
      {
        orientationType: {
          id: 'orientation-1',
          name: 'Orientación técnica',
          description: null,
        },
      },
    ],
  };
}

describe('MentorMapper', () => {
  const mapper = new MentorMapper();

  it('construye fullName y technicalAreas sin exponer campos internos del directorio', () => {
    const record = {
      id: 'mentor-1',
      firstName: 'Ana María',
      lastName: 'Rojas',
      headline: 'Arquitecta de Software',
      mentorTechnicalAreas: [
        { technicalArea: { name: 'Backend' } },
        { technicalArea: { name: 'Cloud' } },
      ],
      isActive: true,
    };

    expect(mapper.toDirectoryResponse(record)).toEqual({
      id: 'mentor-1',
      fullName: 'Ana María Rojas',
      headline: 'Arquitecta de Software',
      technicalAreas: ['Backend', 'Cloud'],
    });
  });

  it('mapea listas conservando orden, headline null y areas vacias', () => {
    const first = {
      id: 'mentor-1',
      firstName: 'Ana',
      lastName: 'Rojas',
      headline: null,
      mentorTechnicalAreas: [],
    };
    const second = { ...first, id: 'mentor-2', firstName: 'Luis' };

    expect(mapper.toDirectoryResponseList([first, second])).toEqual([
      {
        id: 'mentor-1',
        fullName: 'Ana Rojas',
        headline: null,
        technicalAreas: [],
      },
      {
        id: 'mentor-2',
        fullName: 'Luis Rojas',
        headline: null,
        technicalAreas: [],
      },
    ]);
  });

  it('mapea el perfil completo y convierte URLs UTF-8 sin alterar fechas ni records', () => {
    const record = buildProfileRecord();

    expect(mapper.toProfileResponse(record)).toEqual({
      id: 'mentor-1',
      fullName: 'Ana María Rojas',
      headline: 'Arquitecta de Software',
      aboutMe: 'Mentora de ingeniería.',
      isAvailable: true,
      photoUrl: 'https://cdn.test/María.jpg',
      city: { id: 'city-1', title: 'Cochabamba' },
      educations: [
        {
          id: 'education-1',
          institution: 'UMSS',
          degree: 'Ingeniería de Sistemas',
          startDate: new Date('2020-01-01T00:00:00.000Z'),
          endDate: null,
          description: null,
        },
      ],
      workExperiences: [
        {
          id: 'work-1',
          position: 'Tech Lead',
          startDate: new Date('2021-01-01T00:00:00.000Z'),
          endDate: null,
          isCurrent: true,
          description: null,
          company: { id: 'company-1', title: 'Acme' },
        },
      ],
      skills: [{ id: 'skill-1', name: 'TypeScript', isCustom: false }],
      certifications: [
        {
          id: 'cert-1',
          name: 'Cloud Architect',
          issuingOrganization: 'Cloud Org',
          issueDate: new Date('2025-06-15T00:00:00.000Z'),
          documentUrl: 'https://cdn.test/certificación.pdf',
        },
      ],
      technicalAreas: [{ id: 'area-1', name: 'Backend', description: null }],
      orientationTypes: [
        { id: 'orientation-1', name: 'Orientación técnica', description: null },
      ],
    });
    expect(record.photoUrl).toBeInstanceOf(Uint8Array);
    expect(record.certifications[0]?.documentUrl).toBeInstanceOf(Uint8Array);
  });

  it.each([
    { bytes: null, expected: null },
    { bytes: new Uint8Array(), expected: '' },
  ])('conserva URLs nulas o vacias: $expected', ({ bytes, expected }) => {
    const record = buildProfileRecord();
    record.photoUrl = bytes;
    record.certifications = record.certifications.map((certification) => ({
      ...certification,
      documentUrl: bytes,
    }));

    const result = mapper.toProfileResponse(record);

    expect(result.photoUrl).toBe(expected);
    expect(result.certifications[0]?.documentUrl).toBe(expected);
  });

  it('conserva todos los campos del perfil con nulls y relaciones vacias', () => {
    const record = {
      id: 'mentor-1',
      firstName: 'Ana',
      lastName: 'Rojas',
      headline: null,
      aboutMe: null,
      isAvailableForMentoring: false,
      photoUrl: null,
      city: null,
      educations: [],
      workExperiences: [],
      userSkills: [],
      certifications: [],
      mentorTechnicalAreas: [],
      mentorOrientationTypes: [],
    };

    expect(mapper.toProfileResponse(record)).toEqual({
      id: 'mentor-1',
      fullName: 'Ana Rojas',
      headline: null,
      aboutMe: null,
      isAvailable: false,
      photoUrl: null,
      city: null,
      educations: [],
      workExperiences: [],
      skills: [],
      certifications: [],
      technicalAreas: [],
      orientationTypes: [],
    });
  });

  it('extrae las areas tecnicas y orientaciones de sus relaciones', () => {
    const technicalArea = { id: 'area-1', name: 'Backend', description: null };
    const orientationType = {
      id: 'orientation-1',
      name: 'Orientación técnica',
      description: 'Apoyo técnico',
    };

    expect(mapper.toTechnicalAreasResponse([{ technicalArea }])).toEqual([
      technicalArea,
    ]);
    expect(mapper.toOrientationTypesResponse([{ orientationType }])).toEqual([
      orientationType,
    ]);
  });

  it('devuelve listas vacias cuando no hay records ni relaciones', () => {
    expect(mapper.toDirectoryResponseList([])).toEqual([]);
    expect(mapper.toTechnicalAreasResponse([])).toEqual([]);
    expect(mapper.toOrientationTypesResponse([])).toEqual([]);
  });
});
