import { describe, expect, it } from 'vitest';
import { CertificationMapper } from '../mappers/certification.mapper.js';
import type { CertificationRecord } from '../types/certification-record.type.js';

const buildRecord = (
  overrides: Partial<CertificationRecord> = {},
): CertificationRecord => ({
  id: '33333333-3333-4333-8333-333333333333',
  userId: '11111111-1111-4111-8111-111111111111',
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: new Date('2024-05-10'),
  createdAt: new Date('2024-05-11T10:00:00.000Z'),
  updatedAt: new Date('2024-05-12T10:00:00.000Z'),
  ...overrides,
});

describe('CertificationMapper', () => {
  const mapper = new CertificationMapper();

  it('maps a record to the public response without exposing the user id', () => {
    const response = mapper.toResponse(buildRecord());

    expect(response).toEqual({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'AWS Solutions Architect',
      issuingOrganization: 'Amazon',
      issueDate: '2024-05-10',
      hasDocument: false,
      createdAt: '2024-05-11T10:00:00.000Z',
      updatedAt: '2024-05-12T10:00:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
  });

  it('formats the issue date as a calendar date', () => {
    const response = mapper.toResponse(
      buildRecord({ issueDate: new Date('2021-12-31T00:00:00.000Z') }),
    );

    expect(response.issueDate).toBe('2021-12-31');
  });

  it('maps a list preserving the order', () => {
    const responses = mapper.toResponseList([
      buildRecord({ id: 'a' }),
      buildRecord({ id: 'b' }),
    ]);

    expect(responses.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('marks the document of the response when the certification has one', () => {
    expect(mapper.toResponse(buildRecord(), true).hasDocument).toBe(true);
  });

  it('marks only the certifications included in the document ids', () => {
    const responses = mapper.toResponseList(
      [buildRecord({ id: 'a' }), buildRecord({ id: 'b' })],
      new Set(['b']),
    );

    expect(responses.map((item) => item.hasDocument)).toEqual([false, true]);
  });

  it('maps an empty list to an empty list', () => {
    expect(mapper.toResponseList([])).toEqual([]);
  });
});
