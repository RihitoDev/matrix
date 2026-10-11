import { describe, expect, it } from 'vitest';
import { createEducationSchema } from '../requests/create-education.request.js';
import { educationIdSchema } from '../requests/education-fields.schema.js';
import { updateEducationSchema } from '../requests/update-education.request.js';

const input = {
  institution: ' UMSS ',
  degree: ' Computer Science ',
  startDate: '2020-02-29',
  endDate: '2024-12-31',
};

describe('Education requests', () => {
  it('trims required strings and converts a valid calendar date to UTC', () => {
    expect(createEducationSchema.parse(input)).toEqual({
      institution: 'UMSS',
      degree: 'Computer Science',
      startDate: new Date('2020-02-29T00:00:00.000Z'),
      endDate: new Date('2024-12-31T00:00:00.000Z'),
    });
  });

  it('accepts and trims an optional description and converts the end date', () => {
    const parsed = createEducationSchema.parse({
      ...input,
      endDate: '2024-12-31',
      description: ' Research ',
    });
    expect(parsed.endDate).toEqual(new Date('2024-12-31T00:00:00.000Z'));
    expect(parsed.description).toBe('Research');
  });

  it('accepts null for the optional description', () => {
    expect(
      createEducationSchema.parse({
        ...input,
        description: null,
      }),
    ).toMatchObject({
      description: null,
    });
  });

  it.each(['institution', 'degree', 'startDate', 'endDate'] as const)(
    'requires %s',
    (field) => {
      expect(
        createEducationSchema.safeParse({ ...input, [field]: undefined })
          .success,
      ).toBe(false);
      expect(
        createEducationSchema.safeParse({ ...input, [field]: null }).success,
      ).toBe(false);
      expect(
        createEducationSchema.safeParse({ ...input, [field]: ' ' }).success,
      ).toBe(false);
    },
  );

  it.each([
    '2023-02-29',
    '2024-02-30',
    '2024-13-01',
    '02/03/2024',
    '2024-01-01T00:00:00Z',
    '',
  ])('rejects invalid calendar date %s', (date) => {
    expect(
      createEducationSchema.safeParse({ ...input, startDate: date }).success,
    ).toBe(false);
    expect(
      createEducationSchema.safeParse({ ...input, endDate: date }).success,
    ).toBe(false);
  });

  it.each(['userId', 'id', 'createdAt', 'unknownField'])(
    'rejects externally assigned %s',
    (field) => {
      expect(
        createEducationSchema.safeParse({ ...input, [field]: 'unexpected' })
          .success,
      ).toBe(false);
      expect(
        updateEducationSchema.safeParse({
          degree: 'Updated',
          [field]: 'unexpected',
        }).success,
      ).toBe(false);
    },
  );

  it('allows partial edits and explicit clearing of optional fields', () => {
    expect(updateEducationSchema.parse({ degree: ' Updated ' })).toEqual({
      degree: 'Updated',
    });
    expect(
      updateEducationSchema.parse({ description: null }),
    ).toEqual({ description: null });
  });

  it.each(['institution', 'degree', 'startDate', 'endDate'] as const)(
    'rejects clearing %s in partial edits',
    (field) => {
      for (const value of [null, '', ' ']) {
        expect(updateEducationSchema.safeParse({ [field]: value }).success).toBe(false);
      }
    },
  );

  it('rejects empty or undefined-only edits', () => {
    expect(updateEducationSchema.safeParse({}).success).toBe(false);
    expect(updateEducationSchema.safeParse({ degree: undefined }).success).toBe(
      false,
    );
  });

  it('validates record identifiers as UUIDs', () => {
    expect(
      educationIdSchema.safeParse('33333333-3333-4333-8333-333333333333')
        .success,
    ).toBe(true);
    expect(educationIdSchema.safeParse('123').success).toBe(false);
  });
});
