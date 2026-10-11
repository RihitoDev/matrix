import { describe, expect, it } from 'vitest';
import { EducationMapper } from '../mappers/education.mapper.js';
import type { EducationRecord } from '../types/education-record.type.js';

const buildRecord = (
  overrides: Partial<EducationRecord> = {},
): EducationRecord => ({
  id: '33333333-3333-4333-8333-333333333333',
  userId: '11111111-1111-4111-8111-111111111111',
  institution: 'Universidad Mayor de San Simon',
  degree: 'Computer Science',
  startDate: new Date('2018-02-01T00:00:00.000Z'),
  endDate: new Date('2023-12-15T00:00:00.000Z'),
  description: 'Software engineering specialization',
  createdAt: new Date('2024-05-11T10:00:00.000Z'),
  updatedAt: new Date('2024-05-12T10:00:00.000Z'),
  ...overrides,
});

describe('EducationMapper', () => {
  const mapper = new EducationMapper();

  it('maps academic fields and audit dates without exposing the owner', () => {
    const record = buildRecord();
    const response = mapper.toResponse(record);

    expect(response).toEqual({
      id: record.id,
      institution: 'Universidad Mayor de San Simon',
      degree: 'Computer Science',
      startDate: '2018-02-01',
      endDate: '2023-12-15',
      description: 'Software engineering specialization',
      createdAt: '2024-05-11T10:00:00.000Z',
      updatedAt: '2024-05-12T10:00:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
    expect(record.startDate).toBeInstanceOf(Date);
    expect(record.endDate).toBeInstanceOf(Date);
  });

  it('preserves nullable end dates and descriptions', () => {
    const response = mapper.toResponse(
      buildRecord({ endDate: null, description: null }),
    );

    expect(response.endDate).toBeNull();
    expect(response.description).toBeNull();
  });

  it('preserves calendar dates at year boundaries and on leap days', () => {
    const response = mapper.toResponse(
      buildRecord({
        startDate: new Date('2023-12-31T00:00:00.000Z'),
        endDate: new Date('2024-02-29T00:00:00.000Z'),
      }),
    );

    expect(response.startDate).toBe('2023-12-31');
    expect(response.endDate).toBe('2024-02-29');
  });

  it('maps multiple records in their original order', () => {
    const records = [
      buildRecord(),
      buildRecord({
        id: '44444444-4444-4444-8444-444444444444',
        endDate: null,
      }),
    ];
    const responses = mapper.toResponseList(records);

    expect(responses.map((response) => response.id)).toEqual(
      records.map((record) => record.id),
    );
    expect(responses[0].startDate).toBe('2018-02-01');
    expect(responses[1].endDate).toBeNull();
    responses.forEach((response) => {
      expect(response).not.toHaveProperty('userId');
    });
  });

  it('maps an empty list to an empty list', () => {
    expect(mapper.toResponseList([])).toEqual([]);
  });
});
