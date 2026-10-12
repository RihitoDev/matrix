import { describe, expect, it } from 'vitest';
import { createWorkExperienceSchema } from '../requests/create-work-experience.request.js';
import { updateWorkExperienceSchema } from '../requests/update-work-experience.request.js';
import { workExperienceIdSchema } from '../requests/work-experience-fields.schema.js';

const validBody = {
  companyName: ' Synapse Labs ',
  position: ' Junior web developer ',
  startDate: '2024-07-01',
  endDate: '2024-12-31',
  isCurrent: false,
  description: ' Built user interfaces ',
};

describe('createWorkExperienceSchema', () => {
  it('trims the texts and converts the dates', () => {
    const result = createWorkExperienceSchema.parse(validBody);

    expect(result).toEqual({
      companyName: 'Synapse Labs',
      position: 'Junior web developer',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      isCurrent: false,
      description: 'Built user interfaces',
    });
  });

  it('accepts a current job without end date or description', () => {
    const { endDate: _endDate, description: _description, ...body } =
      validBody;

    expect(
      createWorkExperienceSchema.safeParse({ ...body, isCurrent: true })
        .success,
    ).toBe(true);
    expect(
      createWorkExperienceSchema.safeParse({ ...validBody, endDate: null })
        .success,
    ).toBe(true);
  });

  it.each([
    { ...validBody, companyName: ' ' },
    { ...validBody, companyName: 'a'.repeat(101) },
    { ...validBody, position: '' },
    { ...validBody, startDate: '2024-02-30' },
    { ...validBody, endDate: '31/12/2024' },
    { ...validBody, isCurrent: 'yes' },
    { ...validBody, userId: '11111111-1111-4111-8111-111111111111' },
    { ...validBody, startDate: '0012-02-10' },
    { ...validBody, startDate: '1949-12-31' },
    { ...validBody, endDate: '2999-01-01' },
    { ...validBody, position: 'a'.repeat(151) },
    { ...validBody, description: 'b'.repeat(2001) },
  ])('rejects invalid data', (body) => {
    expect(createWorkExperienceSchema.safeParse(body).success).toBe(false);
  });

  it('accepts the limits of the date range and the texts', () => {
    expect(
      createWorkExperienceSchema.safeParse({
        ...validBody,
        startDate: '1950-01-01',
        position: 'a'.repeat(150),
        description: 'b'.repeat(2000),
      }).success,
    ).toBe(true);
  });

  it('explains why a date before 1950 is rejected', () => {
    const result = createWorkExperienceSchema.safeParse({
      ...validBody,
      startDate: '0012-02-10',
    });

    expect(result.error?.issues[0]).toMatchObject({
      path: ['startDate'],
      message: 'La fecha no puede ser anterior al 1 de enero de 1950.',
    });
  });

  it('requires the mandatory fields', () => {
    expect(createWorkExperienceSchema.safeParse({}).success).toBe(false);
  });
});

describe('updateWorkExperienceSchema', () => {
  it('accepts a partial update', () => {
    expect(updateWorkExperienceSchema.parse({ position: ' Lead ' })).toEqual({
      position: 'Lead',
    });
  });

  it('rejects an empty update', () => {
    expect(updateWorkExperienceSchema.safeParse({}).success).toBe(false);
  });
});

describe('workExperienceIdSchema', () => {
  it('accepts only UUIDs', () => {
    expect(
      workExperienceIdSchema.safeParse('33333333-3333-4333-8333-333333333333')
        .success,
    ).toBe(true);
    expect(workExperienceIdSchema.safeParse('not-a-uuid').success).toBe(false);
  });
});