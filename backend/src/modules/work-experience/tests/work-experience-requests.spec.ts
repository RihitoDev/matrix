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
  ])('rejects invalid data', (body) => {
    expect(createWorkExperienceSchema.safeParse(body).success).toBe(false);
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