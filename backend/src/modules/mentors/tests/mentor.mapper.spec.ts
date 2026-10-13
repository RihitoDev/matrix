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
    photoUrl: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
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

  it('expone solo los datos públicos previstos para la tarjeta', () => {
    const record = {
      ...buildProfileRecord(),
      photoVersion: '2026-10-09T12:00:00.000Z',
      educations: [{ degree: 'Ingeniería', institution: 'UMSS' }],
      isAvailableForMentoring: true,
      mentorOrientationTypes: [
        { orientationType: { name: 'Orientación técnica' } },
      ],
      email: 'private@example.test',
      phone: 'private',
    };
    expect(mapper.toDirectoryResponse(record)).toEqual({
      id: 'mentor-1',
      fullName: 'Ana María Rojas',
      headline: 'Arquitecta de Software',
      photoUrl: '/mentors/mentor-1/photo?v=2026-10-09T12%3A00%3A00.000Z',
      education: { degree: 'Ingeniería', institution: 'UMSS' },
      isAvailable: true,
      technicalAreas: ['Backend'],
      orientationTypes: ['Orientación técnica'],
    });
  });

  it('mantiene el endpoint compartido y versiona ambos consumidores sin exponer bytes', () => {
    const record = { ...buildProfileRecord(), photoVersion: 'version-1' };
    const directory = mapper.toDirectoryResponse(record);
    const profile = mapper.toProfileResponse(record);
    expect(directory.photoUrl?.split('?')[0]).toBe(profile.photoUrl?.split('?')[0]);
    record.photoVersion = 'version-2';
    expect(mapper.toDirectoryResponse(record).photoUrl).not.toBe(directory.photoUrl);
    expect(mapper.toDirectoryResponse({ ...record, photoVersion: null }).photoUrl).toBeNull();
  });

  it('usa solo el estudio seleccionado, o ninguno, sin inventar formación', () => {
    const record = {
      ...buildProfileRecord(),
      photoVersion: null,
      educations: [
        { degree: 'Maestría', institution: 'Universidad A' },
        { degree: 'Licenciatura', institution: 'Universidad B' },
      ],
      mentorOrientationTypes: [],
    };
    expect(mapper.toDirectoryResponse(record).education).toEqual(record.educations[0]);
    expect(mapper.toDirectoryResponse({ ...record, educations: [] }).education).toBeNull();
  });

  it('construye fullName y technicalAreas sin exponer campos internos del directorio', () => {
    const record = {
      id: 'mentor-1',
      firstName: 'Ana María',
      lastName: 'Rojas',
      headline: 'Arquitecta de Software',
      photoVersion: null,
      educations: [],
      isAvailableForMentoring: false,
      mentorOrientationTypes: [],
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
      photoUrl: null,
      education: null,
      isAvailable: false,
      orientationTypes: [],
    });
  });

  it('mapea listas conservando orden, headline null y areas vacias', () => {
    const first = {
      id: 'mentor-1',
      firstName: 'Ana',
      lastName: 'Rojas',
      headline: null,
      photoVersion: null,
      educations: [],
      isAvailableForMentoring: false,
      mentorOrientationTypes: [],
      mentorTechnicalAreas: [],
    };
    const second = { ...first, id: 'mentor-2', firstName: 'Luis' };

    expect(mapper.toDirectoryResponseList([first, second])).toEqual([
      {
        id: 'mentor-1',
        fullName: 'Ana Rojas',
        headline: null,
        technicalAreas: [],
        photoUrl: null,
        education: null,
        isAvailable: false,
        orientationTypes: [],
      },
      {
        id: 'mentor-2',
        fullName: 'Luis Rojas',
        headline: null,
        technicalAreas: [],
        photoUrl: null,
        education: null,
        isAvailable: false,
        orientationTypes: [],
      },
    ]);
  });

  it('mapea la foto a una ruta API sin alterar certificados, fechas ni records', () => {
    const record = buildProfileRecord();

    expect(mapper.toProfileResponse(record)).toEqual({
      id: 'mentor-1',
      fullName: 'Ana María Rojas',
      headline: 'Arquitecta de Software',
      aboutMe: 'Mentora de ingeniería.',
      isAvailable: true,
      photoUrl: expect.stringMatching(/^\/mentors\/mentor-1\/photo\?v=[a-f0-9]{64}$/),
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

    expect(result.photoUrl).toBeNull();
    expect(result.certifications[0]?.documentUrl).toBe(expected);
  });

  it('cambia la URL al actualizar los bytes y devuelve null al eliminar la foto', () => {
    const record = buildProfileRecord();
    const original = mapper.toProfileResponse(record).photoUrl;
    expect(mapper.toProfileResponse(record).photoUrl).toBe(original);
    record.photoUrl = new Uint8Array([0xff, 0xd8, 0xff]);
    expect(mapper.toProfileResponse(record).photoUrl).not.toBe(original);
    record.photoUrl = null;
    expect(mapper.toProfileResponse(record).photoUrl).toBeNull();
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
