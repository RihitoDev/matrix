import { describe, expect, it } from 'vitest';
import { JobOfferMapper } from '../mappers/job-offer.mapper.js';
import type { JobOfferRecord } from '../types/job-offer-record.type.js';

const CREATED_AT = new Date('2026-10-12T15:00:00.000Z');

const RECORD: JobOfferRecord = {
  id: 'offer-1',
  title: 'DevOps Senior',
  description: 'Descripción',
  category: 'Tecnología',
  positionsAvailable: 2,
  salaryRange: 'Bs 6.500 - 8.000',
  languages: 'Español',
  locationUrl: 'https://maps.google.com/?q=x',
  expiresAt: null,
  createdAt: CREATED_AT,
  company: { id: 'company-1', title: 'TechBolivia S.R.L.' },
  modality: { title: 'Híbrido' },
  contractType: { title: 'Tiempo completo' },
  status: { title: 'Publicada' },
  skills: [{ skill: { id: 'skill-1', name: 'Docker' } }],
};

describe('JobOfferMapper', () => {
  const mapper = new JobOfferMapper();

  it('arma la respuesta de una vacante con nombres de catálogos y tecnologías', () => {
    expect(mapper.toResponse(RECORD)).toEqual({
      id: 'offer-1',
      title: 'DevOps Senior',
      description: 'Descripción',
      category: 'Tecnología',
      modality: 'Híbrido',
      contractType: 'Tiempo completo',
      status: 'Publicada',
      positionsAvailable: 2,
      salaryRange: 'Bs 6.500 - 8.000',
      languages: 'Español',
      locationUrl: 'https://maps.google.com/?q=x',
      expiresAt: null,
      createdAt: CREATED_AT.toISOString(),
      company: { id: 'company-1', name: 'TechBolivia S.R.L.' },
      skills: [{ id: 'skill-1', name: 'Docker' }],
    });
  });

  it('convierte la fecha de vencimiento a texto ISO', () => {
    const expiresAt = new Date('2026-12-31T00:00:00.000Z');

    expect(mapper.toResponse({ ...RECORD, expiresAt }).expiresAt).toBe(expiresAt.toISOString());
  });

  it('arma la respuesta de una vacante creada', () => {
    expect(mapper.toCreatedResponse({ id: 'offer-1', createdAt: CREATED_AT })).toEqual({
      id: 'offer-1',
      createdAt: CREATED_AT.toISOString(),
    });
  });
});
