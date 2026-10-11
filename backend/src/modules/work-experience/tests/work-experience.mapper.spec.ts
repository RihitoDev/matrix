import { describe, expect, it } from 'vitest';
import { WorkExperienceMapper } from '../mappers/work-experience.mapper.js';
import type { WorkExperienceRecord } from '../types/work-experience-record.type.js';

const buildRecord = (
  overrides: Partial<WorkExperienceRecord> = {},
): WorkExperienceRecord => ({
  id: '33333333-3333-4333-8333-333333333333',
  userId: '11111111-1111-4111-8111-111111111111',
  position: 'Junior web developer',
  startDate: new Date('2024-07-01T00:00:00.000Z'),
  endDate: new Date('2024-12-31T00:00:00.000Z'),
  isCurrent: false,
  description: 'Built user interfaces with React',
  createdAt: new Date('2025-01-10T10:00:00.000Z'),
  updatedAt: new Date('2025-01-11T10:00:00.000Z'),
  company: {
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Synapse Labs',
  },
  ...overrides,
});

describe('WorkExperienceMapper', () => {
  const mapper = new WorkExperienceMapper();

  it('maps the work experience with its company name and without the owner', () => {
    const record = buildRecord();
    const response = mapper.toResponse(record);

    expect(response).toEqual({
      id: record.id,
      companyName: 'Synapse Labs',
      position: 'Junior web developer',
      startDate: '2024-07-01',
      endDate: '2024-12-31',
      isCurrent: false,
      description: 'Built user interfaces with React',
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-11T10:00:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
    expect(response).not.toHaveProperty('company');
  });

  it('keeps a null end date and description for a current job', () => {
    const response = mapper.toResponse(
      buildRecord({ endDate: null, isCurrent: true, description: null }),
    );

    expect(response.endDate).toBeNull();
    expect(response.isCurrent).toBe(true);
    expect(response.description).toBeNull();
  });

  it('maps every record of a list', () => {
    const records = [buildRecord(), buildRecord({ id: 'other-id' })];

    expect(mapper.toResponseList(records)).toHaveLength(2);
    expect(mapper.toResponseList([])).toEqual([]);
  });
});